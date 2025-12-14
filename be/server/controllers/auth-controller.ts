import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService.js';

// Register new user
export const register = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.register(req.body);

        res.status(201).json({
            message: 'Akun berhasil dibuat',
            user: result
        });
    } catch (error: any) {
        console.error('Register error:', error);

        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }

        // Handle specific business errors
        if (error.message === 'Email sudah terdaftar') {
            return res.status(400).json({ error: error.message });
        }

        if (process.env.NODE_ENV === 'development') {
            return res.status(500).json({
                error: 'Gagal membuat akun',
                message: error?.message || String(error)
            });
        }
        res.status(500).json({ error: 'Gagal membuat akun' });
    }
};

// Login
export const login = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.login(req.body);

        // Set HttpOnly cookie
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            message: 'Login berhasil',
            user: result.user,
            token: result.token
        });
    } catch (error: any) {
        console.error('Login error:', error);

        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }

        if (error.message === 'Email atau password salah') {
            return res.status(401).json({ error: error.message });
        }

        if (process.env.NODE_ENV === 'development') {
            return res.status(500).json({
                error: 'Gagal login',
                message: error?.message || String(error)
            });
        }
        res.status(500).json({ error: 'Gagal login' });
    }
};

// Get current user
export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const result = await AuthService.getMe(userId);

        res.json({ user: result });
    } catch (error: any) {
        console.error('Get user error:', error);
        if (error.message === 'User tidak ditemukan') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal mengambil data user' });
    }
};

// Logout
export const logout = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        await AuthService.logout(token);

        // Clear cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        res.json({ message: 'Logout berhasil' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Gagal logout' });
    }
};
