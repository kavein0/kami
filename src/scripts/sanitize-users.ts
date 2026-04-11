import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users. Checking for duplicates...`);

  const seenNames = new Set<string>();
  
  for (const user of users) {
    if (!user.name || seenNames.has(user.name)) {
      const fixedName = user.name 
        ? `${user.name}_${Math.floor(Math.random() * 9999)}` 
        : `User_${Math.floor(Math.random() * 999999)}`;
      console.log(`User ${user.email} -> renaming from "${user.name}" to "${fixedName}"`);
      await prisma.user.update({ 
        where: { id: user.id }, 
        data: { name: fixedName } 
      });
      seenNames.add(fixedName);
    } else {
      seenNames.add(user.name as string);
    }
  }
  
  console.log("Database sanitization complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
