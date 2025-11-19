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
    console.log('[/api/auth/register] start', {
      body: req.body,
      time: new Date().toISOString()
    });

    const { email, password, fullName } = req.body;

    // Validation
    console.log('[/api/auth/register] validating payload');
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password harus diisi' });
    }

    console.log('[/api/auth/register] validation success');

    // Check if user already exists
    console.log('[/api/auth/register] checking existing user');
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('[/api/auth/register] user already exists');
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    console.log('[/api/auth/register] user does not exist, proceeding');

    // Hash password
    console.log('[/api/auth/register] hashing password');
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('[/api/auth/register] password hashed');

    // Create user with profile and role
    console.log('[/api/auth/register] creating user with profile & role');
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

    console.log('[/api/auth/register] user created');

    console.log('[/api/auth/register] success, returning 201');

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
    console.error('[/api/auth/register] Register error:', error);

    console.log('[/api/auth/register] error 500, returning error');

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
    console.log('[/api/auth/login] start', {
      body: req.body,
      time: new Date().toISOString()
    });

    const { email, password } = req.body;

    // Validation
    console.log('[/api/auth/login] validating payload');
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password harus diisi' });
    }

    console.log('[/api/auth/login] validation success');

    // Find user
    console.log('[/api/auth/login] finding user by email');
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        profile: true
      }
    });

    if (!user) {
      console.log('[/api/auth/login] user not found');
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // Verify password
    console.log('[/api/auth/login] verifying password');
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      console.log('[/api/auth/login] invalid password');
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // Generate JWT token
    console.log('[/api/auth/login] generating JWT token');
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
    console.log('[/api/auth/login] creating session record');
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    console.log('[/api/auth/login] success, returning 200');

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
    console.error('[/api/auth/login] Login error:', error);

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
