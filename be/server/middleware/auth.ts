// ============================================
// Enhanced Authentication Middleware with Scoping
// ============================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { context } from '../lib/context.js';
import fs from 'fs';
import path from 'path';

// Read Public Key
const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH || path.resolve(process.cwd(), '../public.key');
let publicKey: string;
try {
  publicKey = fs.readFileSync(publicKeyPath, 'utf8');
} catch (error) {
  console.error('CRITICAL: Failed to read public.key at', publicKeyPath);
  publicKey = '';
}

/**
 * In-process cache for permission lookups.
 * Key: "userId:action:resource" → { allowed: boolean, expiresAt: number }
 * TTL: 60 seconds — permissions rarely change mid-session.
 * This eliminates 2 DB queries (UserRole + RolePermission) on EVERY protected endpoint call.
 */
const permissionCache = new Map<string, { allowed: boolean; expiresAt: number }>();
const PERMISSION_CACHE_TTL_MS = 60_000; // 60 seconds

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

    // Verify token using RS256 (Asynchronous to prevent Event Loop blocking)
    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err: any, decoded: any) => {
      if (err) {
        if (process.env.NODE_ENV !== 'production') console.error('[Auth] Token verification failed:', err);
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
      }

      // Attach user info to request
      (req as any).userId = decoded.userId;
      (req as any).userEmail = decoded.email;
      (req as any).userRole = decoded.role;

      // Attach impersonation info if present
      if (decoded.originalUserId) {
        (req as any).originalUserId = decoded.originalUserId;
        (req as any).isImpersonating = decoded.isImpersonating || false;
      }

      // Run next middleware in the context of the user
      context.run({ userId: decoded.userId }, () => {
        next();
      });
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('[Auth] Auth error:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawRole = (req as any).userRole as string | undefined;
    const currentRole = rawRole?.toLowerCase();
    const normalizedRoles = roles.map(r => r.toLowerCase());

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[requireRole Check] Path: ${req.method} ${req.originalUrl} | UserRole: "${rawRole}" (normalized: "${currentRole}") | Allowed: [${normalizedRoles.join(', ')}]`);
    }

    if (!currentRole || (!normalizedRoles.includes(currentRole) && currentRole !== 'admin')) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[requireRole REJECTED 403] User role "${rawRole}" not allowed for ${req.method} ${req.originalUrl}`);
      }
      return res.status(403).json({ error: `Forbidden - Insufficient role (${rawRole || 'None'})` });
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

      // --- PERMISSION CACHE CHECK ---
      // Admin shortcut: role is already in JWT, no DB needed
      if (userRole?.toLowerCase() === 'admin') return next();

      const permKey = `${userId}:${action}:${resource}`;
      const cachedPerm = permissionCache.get(permKey);
      if (cachedPerm && Date.now() < cachedPerm.expiresAt) {
        return cachedPerm.allowed ? next() : res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
      }

      // --- DB FALLBACK (cache miss) ---
      const userRoleRecord = await prisma.userRole.findUnique({
        where: { userId },
        include: { role: true }
      });

      if (!userRoleRecord) {
        return res.status(403).json({ error: 'Forbidden - No role assigned' });
      }

      const roleId = userRoleRecord.roleId;
      const roleName = userRoleRecord.role.name;

      // Admin override (DB confirmed)
      if (roleName?.toLowerCase() === 'admin') {
        permissionCache.set(permKey, { allowed: true, expiresAt: Date.now() + PERMISSION_CACHE_TTL_MS });
        return next();
      }

      const permission = await prisma.rolePermission.findFirst({
        where: { roleId, resource, action }
      });

      const allowed = !!(permission && permission.isEnabled);
      // Store result in cache
      permissionCache.set(permKey, { allowed, expiresAt: Date.now() + PERMISSION_CACHE_TTL_MS });

      if (allowed) return next();
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
