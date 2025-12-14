
import { prisma } from '../lib/prisma.js';
import { otherSchemas } from '../schemas/other.schema.js';

export class SettingsService {
    static async getSettings() {
        const settings = await prisma.settings.findMany();

        // Convert to map for frontend
        return settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);
    }

    static async updateSettings(updates: any) {
        const validated = otherSchemas.settingsUpdate.parse(updates);
        const operations = Object.entries(validated).map(([key, value]) => {
            return prisma.settings.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) }
            });
        });

        return prisma.$transaction(operations);
    }
}
