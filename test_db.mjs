import { PrismaClient } from '@prisma/client';

async function main() {
  const dbUrl = "postgresql://postgres.eysvapnuqxexlrcdvnlb:1501GfGf2003%2E@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true";
  process.env.DATABASE_URL = dbUrl;
  const prisma = new PrismaClient();
  
  try {
    const res = await prisma.user.count();
    console.log("Success! Users count:", res);
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
