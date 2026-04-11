import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Автоматическая подмена пуллера для Vercel (исключит зависания pg)
let dbUrl = process.env.DATABASE_URL || "";
if (dbUrl.includes("pooler.supabase.com")) {
  dbUrl = dbUrl.replace(":5432/postgres", ":6543/postgres");
  if (!dbUrl.includes("pgbouncer=true")) {
    dbUrl += dbUrl.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true";
  }
}

// Убираем sslmode=require из строки, так как пакет pg интерпретирует это 
// как строгую проверку сертификата (verify-full), игнорируя наши настройки.
dbUrl = dbUrl.replace("?sslmode=require", "").replace("&sslmode=require", "");

// Защита сертификата
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    max: 1, // Required for Vercel Serverless
    allowExitOnIdle: true, // Prevents event loop hangs when freezing
    connectionTimeoutMillis: 5000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter }); // Обязательный параметр для вашей версии
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
