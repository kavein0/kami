import { PrismaClient } from "@prisma/client";

// Automatically fix Supabase connection strings for serverless environments (Vercel).
// Prisma requires Transaction Pooler (Port 6543) and pgbouncer=true to prevent hanging.
let dbUrl = process.env.DATABASE_URL || "";
if (dbUrl.includes("pooler.supabase.com")) {
  dbUrl = dbUrl.replace(":5432/postgres", ":6543/postgres");
  if (!dbUrl.includes("pgbouncer=true")) {
    dbUrl += dbUrl.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true";
  }
}

// Fix local TLS verification for Supabase pooler 
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Inject the corrected URL directly into the environment for this process
process.env.DATABASE_URL = dbUrl;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
