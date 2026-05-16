
import { CPMKService } from './server/services/CPMKService.js';
import { PrismaClient } from '@prisma/client';

async function testService() {
  // Mock admin user
  const result = await CPMKService.getAllCpmk({
    userId: 'any',
    userRole: 'admin',
    q: 'CPMK-021'
  });

  console.log('Service Result for CPMK-021:');
  const cpmk = result.data.find(c => c.kodeCpmk === 'CPMK-021');
  if (cpmk) {
    console.log(`kodeCpmk: ${cpmk.kodeCpmk}`);
    console.log(`cplMappings length: ${cpmk.cplMappings?.length}`);
    console.log(`teknikPenilaian length: ${cpmk.teknikPenilaian?.length}`);
    console.log('Full cpmk keys:', Object.keys(cpmk));
  } else {
    console.log('CPMK-021 not found in results');
    console.log('First result:', result.data[0]?.kodeCpmk);
  }
}

testService()
  .catch(console.error)
  .finally(() => new PrismaClient().$disconnect());
