
import { EvaluasiCPLService } from './server/services/EvaluasiCPLService.js';
import { prisma } from './server/lib/prisma.js';

async function test() {
    console.log('Testing EvaluasiCPLService.getEvaluation...');
    try {
        // Try with valid-ish params but maybe non-existent data
        const result = await EvaluasiCPLService.getEvaluation({
            prodiId: '046fee81-bc0d-43f9-96fb-3cb06abe8954',
            angkatan: '2024',
            tahunAjaran: 'some-id'
        });
        console.log('EvaluasiCPLService success:', !!result);
    } catch (e) {
        console.error('EvaluasiCPLService failed:', e);
    }

    await prisma.$disconnect();
}

test();
