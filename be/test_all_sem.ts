import { TranskripService } from './server/services/TranskripService.ts';

async function main() {
  const result = await TranskripService.getAnalysis({});
  console.log("CPL count:", result.cplData.length);
  console.log(result.cplData.slice(0, 3));
}
main().catch(console.error);
