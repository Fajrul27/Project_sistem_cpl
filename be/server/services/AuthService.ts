import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';

import { authSchemas } from '../schemas/auth.schema.js';
import { EmailService } from './EmailService.js';
import crypto from 'crypto';

// Read Private Key
const privateKeyPath = process.env.JWT_PRIVATE_KEY_PATH || path.resolve(process.cwd(), '../private.key');
let privateKey: string;
try {
    privateKey = fs.readFileSync(privateKeyPath, 'utf8');
} catch (error) {
    console.error('CRITICAL: Failed to read private.key at', privateKeyPath);
    // Fallback to avoid crash during build if key missing, but will fail at runtime
    privateKey = '';
}

export class AuthService {
    static async register(data: any) {
        // Validation using Zod
        const validatedData = authSchemas.register.parse(data);
        const { email, password, namaLengkap, role } = validatedData;
        const prodiId = (data as any).prodiId; // Keep loose for optional fields not in strict register schema yet

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new Error('Email sudah terdaftar');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        let fakultasId = null;
        let programStudiName = null;

        if (prodiId) {
            const prodi = await prisma.prodi.findUnique({
                where: { id: prodiId },
                include: { fakultas: true }
            });
            if (prodi) {
                fakultasId = prodi.fakultasId;
                programStudiName = prodi.fakultas ? `${prodi.fakultas.nama} - ${prodi.nama}` : prodi.nama;
            }
        }

        // Get default role (mahasiswa)
        const mahasiswaRole = await prisma.role.findUnique({
            where: { name: 'mahasiswa' }
        });

        if (!mahasiswaRole) {
            throw new Error('Default role (mahasiswa) not found');
        }

        // Create user with profile and role
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                emailVerified: true,
                role: {
                    create: {
                        roleId: mahasiswaRole.id
                    }
                },
                profile: {
                    create: {
                        namaLengkap: namaLengkap || 'User Baru',
                        prodiId: prodiId || null,
                        fakultasId: fakultasId,
                        programStudi: programStudiName
                    }
                }
            },
            include: {
                role: { include: { role: true } },
                profile: true
            }
        });

        return {
            id: user.id,
            email: user.email,
            role: user.role?.role?.name || 'mahasiswa',
            profile: user.profile
        };
    }


    static async login(data: any) {
        const { email, password } = authSchemas.login.parse(data);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                role: { include: { role: true } },
                profile: {
                    include: {
                        kelasRef: true,
                        angkatanRef: { include: { kurikulum: true } },
                        prodi: { include: { fakultas: true } }
                    }
                }
            }
        });

        if (!user) {
            throw new Error('Email atau password salah');
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            throw new Error('Email atau password salah');
        }

        // Generate JWT token using RS256
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role?.role?.name || 'mahasiswa'
            },
            privateKey,
            {
                algorithm: 'RS256',
                expiresIn: '7d'
            }
        );

        // Delete any existing sessions for this user to avoid duplicate token errors
        await prisma.session.deleteMany({
            where: { userId: user.id }
        });

        // Create new session
        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role?.role?.name || 'mahasiswa',
                profile: user.profile
            }
        };
    }

    static async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: { include: { role: true } },
                profile: {
                    include: {
                        kelasRef: true,
                        angkatanRef: { include: { kurikulum: true } },
                        prodi: {
                            include: {
                                fakultas: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            throw new Error('User tidak ditemukan');
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role?.role?.name || 'mahasiswa',
            profile: user.profile
        };
    }

    static async logout(token: string) {
        if (token) {
            await prisma.session.deleteMany({
                where: { token }
            });
        }
    }

    // Login As User (Admin Impersonation)
    static async loginAsUser(adminUserId: string, targetUserId: string) {
        // Verify admin user
        const adminUser = await prisma.user.findUnique({
            where: { id: adminUserId },
            include: { role: { include: { role: true } } }
        });

        if (!adminUser || adminUser.role?.role?.name !== 'admin') {
            throw new Error('UNAUTHORIZED: Only admin can use this feature');
        }

        // Get target user
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            include: {
                role: { include: { role: true } },
                profile: {
                    include: {
                        kelasRef: true,
                        angkatanRef: { include: { kurikulum: true } },
                        prodi: { include: { fakultas: true } }
                    }
                }
            }
        });

        if (!targetUser) {
            throw new Error('Target user tidak ditemukan');
        }

        // Prevent impersonating other admins (optional security measure)
        if (targetUser.role?.role?.name === 'admin') {
            throw new Error('Cannot impersonate other admin users');
        }

        // Generate impersonation JWT token
        const token = jwt.sign(
            {
                userId: targetUser.id,
                email: targetUser.email,
                role: targetUser.role?.role?.name || 'mahasiswa',
                originalUserId: adminUserId, // Track original admin
                isImpersonating: true
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Create session with impersonation flag
        await prisma.session.create({
            data: {
                userId: targetUser.id,
                token,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        return {
            token,
            user: {
                id: targetUser.id,
                email: targetUser.email,
                role: targetUser.role?.role?.name || 'mahasiswa',
                profile: targetUser.profile
            },
            originalAdmin: {
                id: adminUser.id,
                email: adminUser.email
            },
            isImpersonating: true
        };
    }

    // Return to Admin (Exit Impersonation)
    static async returnToAdmin(originalAdminId: string, currentToken: string) {
        // Delete impersonation session
        if (currentToken) {
            await prisma.session.deleteMany({
                where: { token: currentToken }
            });
        }

        // Get admin user
        const adminUser = await prisma.user.findUnique({
            where: { id: originalAdminId },
            include: {
                role: { include: { role: true } },
                profile: {
                    include: {
                        kelasRef: true,
                        angkatanRef: { include: { kurikulum: true } },
                        prodi: { include: { fakultas: true } }
                    }
                }
            }
        });

        if (!adminUser) {
            throw new Error('Admin user tidak ditemukan');
        }

        // Generate new admin token
        const token = jwt.sign(
            {
                userId: adminUser.id,
                email: adminUser.email,
                role: adminUser.role?.role?.name || 'admin'
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Create new admin session
        await prisma.session.create({
            data: {
                userId: adminUser.id,
                token,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        return {
            token,
            user: {
                id: adminUser.id,
                email: adminUser.email,
                role: adminUser.role?.role?.name || 'admin',
                profile: adminUser.profile
            }
        };
    }

    // Forgot Password Flow
    static async forgotPassword(email: string) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true }
        });

        if (!user) {
            throw new Error('Email tidak terdaftar');
        }

        // Generate 6 digit code
        const code = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes



        // Actually, to ensure only one active token or strict logic:
        await prisma.passwordResetToken.deleteMany({ where: { email } });
        await prisma.passwordResetToken.create({
            data: { email, token: code, expiresAt }
        });

        // Send Email
        await EmailService.sendResetCode(email, code, user.profile?.namaLengkap || user.email);

        return { message: 'Kode verifikasi telah dikirim ke email Anda' };
    }

    static async verifyResetCode(email: string, code: string) {
        const resetToken = await prisma.passwordResetToken.findFirst({
            where: {
                email,
                token: code,
                expiresAt: { gt: new Date() }
            }
        });

        if (!resetToken) {
            throw new Error('Kode verifikasi salah atau sudah kadaluarsa');
        }

        return { message: 'Kode valid', valid: true };
    }

    static async resetPassword(email: string, code: string, newPassword: string) {
        const resetToken = await prisma.passwordResetToken.findFirst({
            where: {
                email,
                token: code,
                expiresAt: { gt: new Date() }
            }
        });

        if (!resetToken) {
            throw new Error('Kode verifikasi salah atau sudah kadaluarsa');
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                role: { include: { role: true } },
                profile: {
                    include: {
                        kelasRef: true,
                        angkatanRef: { include: { kurikulum: true } },
                        prodi: { include: { fakultas: true } }
                    }
                }
            }
        });

        if (!user) {
            throw new Error('User tidak ditemukan');
        }

        // Update password
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { email },
            data: { passwordHash }
        });

        // Delete used token
        await prisma.passwordResetToken.deleteMany({ where: { email } });

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role?.role?.name || 'mahasiswa'
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Delete any existing sessions for this user
        await prisma.session.deleteMany({
            where: { userId: user.id }
        });

        // Create new session
        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        });

        return {
            message: 'Password berhasil direset. Login otomatis...',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role?.role?.name || 'mahasiswa',
                profile: user.profile
            }
        };
    }
}
