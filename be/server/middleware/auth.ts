// ============================================
// Enhanced Authentication Middleware with Scoping
// ============================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { context } from '../lib/context.js';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie or header
    let token = req.cookies?.token;

    // Debug logging

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    // Attach user info to request
    (req as any).userId = decoded.userId;
    (req as any).userEmail = decoded.email;
    (req as any).userRole = decoded.role;

    // Run next middleware in the context of the user
    context.run({ userId: decoded.userId }, () => {
      next();
    });
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const currentRole = (req as any).userRole as string | undefined;

    if (!currentRole || !roles.includes(currentRole)) {
      return res.status(403).json({ error: 'Forbidden - Insufficient role' });
    }

    next();
  };
};

// Dynamic Permission Middleware
export const requirePermission = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const userRole = (req as any).userRole;


      if (!userId) return res.status(403).json({ error: 'Forbidden - No user' });

      // Fetch user's roleId from database
      const userRoleRecord = await prisma.userRole.findUnique({
        where: { userId },
        include: { role: true }
      });

      if (!userRoleRecord) {
        return res.status(403).json({ error: 'Forbidden - No role assigned' });
      }

      const roleId = userRoleRecord.roleId;
      const roleName = userRoleRecord.role.name;

      // Admin override
      if (roleName === 'admin') {
        return next();
      }

      const permission = await prisma.rolePermission.findFirst({
        where: {
          roleId: roleId,
          resource,
          action
        }
      });

      if (permission && permission.isEnabled) {
        return next();
      }

      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    } catch (error) {
      console.error('requirePermission middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Helper: Get user profile
export const getUserProfile = async (userId: string) => {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      prodi: true,
      fakultas: true
    }
  });
  return profile;
};

// Middleware: Require user to be pengampu of mata kuliah
export const requirePengampu = (paramName: string = 'mataKuliahId') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const userRole = (req as any).userRole;

      // Admin can access everything
      if (userRole === 'admin') {
        return next();
      }

      // Get mataKuliahId from params or body
      const mataKuliahId = req.params[paramName] || req.body[paramName] || req.query[paramName];

      if (!mataKuliahId) {
        return res.status(400).json({ error: 'Mata Kuliah ID required' });
      }

      // Get user profile
      const profile = await getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Check if user is pengampu of this mata kuliah
      const pengampu = await prisma.mataKuliahPengampu.findFirst({
        where: {
          mataKuliahId,
          dosenId: userId // Use userId directly as it is the FK in MataKuliahPengampu
        }
      });

      if (!pengampu) {
        return res.status(403).json({
          error: 'Forbidden - You are not pengampu of this mata kuliah'
        });
      }

      // Attach to request for later use
      (req as any).pengampuProfile = profile;

      next();
    } catch (error) {
      console.error('requirePengampu middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Middleware: Require prodi scope (for kaprodi)
export const requireProdiScope = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    // Admin can access everything
    if (userRole === 'admin') {
      return next();
    }

    // Only enforce for kaprodi
    if (userRole !== 'kaprodi') {
      return next();
    }

    // Get user profile
    const profile = await getUserProfile(userId);
    if (!profile || !profile.prodiId) {
      return res.status(403).json({
        error: 'Forbidden - Kaprodi must have prodi assigned'
      });
    }

    // Check target mahasiswa prodi (from params or body)
    const mahasiswaId = req.params.mahasiswaId || req.body.mahasiswaId;

    if (mahasiswaId) {
      const mahasiswaProfile = await prisma.profile.findUnique({
        where: { userId: mahasiswaId }
      });

      if (mahasiswaProfile && mahasiswaProfile.prodiId !== profile.prodiId) {
        return res.status(403).json({
          error: 'Forbidden - Cannot access data from different prodi'
        });
      }
    }

    // Attach to request
    (req as any).kaprodiProfile = profile;

    next();
  } catch (error) {
    console.error('requireProdiScope middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
