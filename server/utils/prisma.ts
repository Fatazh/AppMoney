// server/utils/prisma.ts
import { PrismaClient } from "../../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg"; // <--- Wajib import ini

const connectionString = process.env.DATABASE_URL;

// 1. Buat Pool koneksi terlebih dahulu
const pool = new Pool({ connectionString });

// 2. Masukkan pool ke dalam adapter
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
