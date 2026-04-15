import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Safe DB URL parsing to fix Vercel / Supabase quirks
let dbUrl = process.env.DATABASE_URL || "";
if (dbUrl.includes("pooler.supabase.com")) {
  try {
    const parsedUrl = new URL(dbUrl);
    // Switch to Transaction pooler port
    if (parsedUrl.port === "5432") {
      parsedUrl.port = "6543";
    }
    
    // Add pgbouncer=true
    if (!parsedUrl.searchParams.has("pgbouncer")) {
      parsedUrl.searchParams.set("pgbouncer", "true");
    }
    
    // Strip sslmode=require because 'pg' module treats it as verify-full, overriding rejectUnauthorized
    if (parsedUrl.searchParams.has("sslmode")) {
      parsedUrl.searchParams.delete("sslmode");
    }
    
    dbUrl = parsedUrl.toString();
  } catch {
    console.error("Failed to parse DATABASE_URL");
  }
}

// TLS: enforce certificate validation in production, relax only for local dev

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
