import { TranskripService } from './server/services/TranskripService.ts';

async function main() {
  const result = await TranskripService.getAnalysis({
      semester: 2,
  });
  console.log(JSON.stringify(result, null, 2));
}
main().catch(console.error);
