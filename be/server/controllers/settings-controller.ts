
import { Request, Response } from 'express';
import { SettingsService } from '../services/SettingsService.js';

export const getSettings = async (req: Request, res: Response) => {
    try {
        const settingsMap = await SettingsService.getSettings();
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
        await SettingsService.updateSettings(req.body);
        res.json({
            status: 'success',
            message: 'Settings updated successfully'
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        console.error('Error updating settings:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update settings'
        });
    }
};
