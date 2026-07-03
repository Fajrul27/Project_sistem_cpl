const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  const session = await prisma.session.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  if (session) {
    console.log("Found token, fetching...");
    const res = await fetch('http://localhost:8082/api/auth/me', {
      headers: { 'Authorization': `Bearer ${session.token}` }
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } else {
    console.log("No session found in DB");
  }
}
test().catch(console.error).finally(() => prisma.$disconnect());
