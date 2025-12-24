import { PrismaClient } from "../../app/generated/prisma/wasm";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// 3. Gunakan adapter di PrismaClient
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // Masukkan adapter yang sudah dibuat
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
