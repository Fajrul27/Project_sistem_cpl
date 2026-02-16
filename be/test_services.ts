
import { CPLService } from './server/services/CPLService.js';
import { DashboardService } from './server/services/DashboardService.js';
import { prisma } from './server/lib/prisma.js';

async function test() {
    console.log('Testing CPLService...');
    try {
        const result = await CPLService.getAllCpl({
            userId: '00000000-0000-0000-0000-000000000000', // Non-existent but should just result in empty
            userRole: 'dosen',
            limit: 10,
            page: 1
        });
        console.log('CPLService success:', !!result);
    } catch (e) {
        console.error('CPLService failed:', e);
    }

    console.log('Testing DashboardService...');
    try {
        const result = await DashboardService.getDashboardStats({
            userId: '00000000-0000-0000-0000-000000000000',
            userRole: 'dosen'
        });
        console.log('DashboardService success:', !!result);
    } catch (e) {
        console.error('DashboardService failed:', e);
    }

    console.log('Testing TranskripService.getAnalysis...');
    try {
        const { TranskripService } = await import('./server/services/TranskripService.js');
        const result = await TranskripService.getAnalysis({
            semester: 1,
            // empty filters
            fakultasId: '',
            prodiId: '',
            angkatan: ''
        });
        console.log('TranskripService success:', !!result);
        console.log('Data:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('TranskripService failed:', e);
    }

    console.log('Testing UserService.getAllUsers...');
    try {
        const { UserService } = await import('./server/services/UserService.js');
        const result = await UserService.getAllUsers({
            page: 1,
            limit: 5,
            userId: 'dummy',
            userRole: 'admin',
            q: ''
        });
        console.log('UserService success:', !!result);
        console.log('User count:', result.data.length);
    } catch (e) {
        console.error('UserService failed:', e);
    }

    await prisma.$disconnect();
}

test();
