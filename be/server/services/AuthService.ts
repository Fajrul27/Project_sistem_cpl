import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

import { authSchemas } from '../schemas/auth.schema.js';

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
                profile: true
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
}
