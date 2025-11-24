import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await prisma.settings.findMany();

        // Convert array to object for easier frontend consumption
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        res.json({
            status: 'success',
            data: settingsMap
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch settings'
        });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const updates = req.body; // Expecting { key: value, key2: value2 }

        const operations = Object.entries(updates).map(([key, value]) => {
            return prisma.settings.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) }
            });
        });

        await prisma.$transaction(operations);

        res.json({
            status: 'success',
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update settings'
        });
    }
};
