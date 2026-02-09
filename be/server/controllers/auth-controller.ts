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
            path: '/',
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
            sameSite: 'lax',
            path: '/'
        });

        res.json({ message: 'Logout berhasil' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Gagal logout' });
    }
};

// Login As User (Admin Impersonation)
export const loginAsUser = async (req: Request, res: Response) => {
    try {
        const adminUserId = (req as any).userId;
        const { userId: targetUserId } = req.params;

        const result = await AuthService.loginAsUser(adminUserId, targetUserId);

        // Set HttpOnly cookie with new token
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: `Berhasil login sebagai ${result.user.email}`,
            user: result.user,
            originalAdmin: result.originalAdmin,
            isImpersonating: result.isImpersonating,
            token: result.token
        });
    } catch (error: any) {
        console.error('Login as user error:', error);

        if (error.message === 'UNAUTHORIZED: Only admin can use this feature') {
            return res.status(403).json({ error: 'Hanya admin yang dapat menggunakan fitur ini' });
        }
        if (error.message === 'Target user tidak ditemukan') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Cannot impersonate other admin users') {
            return res.status(403).json({ error: 'Tidak dapat login sebagai admin lain' });
        }

        res.status(500).json({ error: 'Gagal login sebagai user' });
    }
};

// Return to Admin (Exit Impersonation)
export const returnToAdmin = async (req: Request, res: Response) => {
    try {
        const originalAdminId = (req as any).originalUserId;
        const currentToken = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!originalAdminId) {
            return res.status(400).json({ error: 'Tidak dalam mode impersonation' });
        }

        const result = await AuthService.returnToAdmin(originalAdminId, currentToken);

        // Set HttpOnly cookie with admin token
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: 'Berhasil kembali ke akun admin',
            user: result.user,
            token: result.token
        });
    } catch (error: any) {
        console.error('Return to admin error:', error);

        if (error.message === 'Admin user tidak ditemukan') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: 'Gagal kembali ke akun admin' });
    }
};
// Forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email wajib diisi' });
        }

        const result = await AuthService.forgotPassword(email);
        res.json(result);
    } catch (error: any) {
        console.error('Forgot password error:', error);
        if (error.message === 'Email tidak terdaftar') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal memproses permintaan reset password' });
    }
};

// Verify Reset Code
export const verifyResetCode = async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ error: 'Email dan kode wajib diisi' });
        }

        const result = await AuthService.verifyResetCode(email, code);
        res.json(result);
    } catch (error: any) {
        console.error('Verify code error:', error);
        if (error.message === 'Kode verifikasi salah atau sudah kadaluarsa') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal memverifikasi kode' });
    }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'Data tidak lengkap' });
        }

        const result = await AuthService.resetPassword(email, code, newPassword);

        // Set HttpOnly cookie for auto-login
        res.cookie('token', (result as any).token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json(result);
    } catch (error: any) {
        console.error('Reset password error:', error);
        if (error.message === 'Kode verifikasi salah atau sudah kadaluarsa') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal mereset password' });
    }
};
