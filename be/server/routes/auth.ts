// ============================================
// Authentication Routes
// ============================================

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password harus diisi' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with profile and role
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        emailVerified: true,
        role: {
          create: {
            role: 'mahasiswa' // Default role
          }
        },
        profile: {
          create: {
            namaLengkap: fullName || 'User Baru'
          }
        }
      },
      include: {
        role: true,
        profile: true
      }
    });

    res.status(201).json({
      message: 'Akun berhasil dibuat',
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.role || 'mahasiswa',
        profile: user.profile
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);

    // Di development, kirim pesan error asli supaya mudah debug
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({
        error: 'Gagal membuat akun',
        message: error?.message || String(error)
      });
    }

    // Di production, tetap kirim pesan generic
    res.status(500).json({ error: 'Gagal membuat akun' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password harus diisi' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        profile: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role?.role || 'mahasiswa'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.role || 'mahasiswa',
        profile: user.profile
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);

    // Di development, kirim pesan error asli supaya mudah debug
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({
        error: 'Gagal login',
        message: error?.message || String(error)
      });
    }

    // Di production, tetap kirim pesan generic
    res.status(500).json({ error: 'Gagal login' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        profile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.role || 'mahasiswa',
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Gagal mengambil data user' });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      // Delete session
      await prisma.session.deleteMany({
        where: { token }
      });
    }

    res.json({ message: 'Logout berhasil' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Gagal logout' });
  }
});

export default router;
