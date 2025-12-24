
import { PrismaClient } from "../../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg"; 

const connectionString = process.env.DATABASE_URL;

let _prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // ☁️ CLOUDFLARE MODE (Production)
  // Gunakan Adapter agar jalan di Edge/Serverless
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  _prisma = new PrismaClient({ adapter });
} else {
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({} as any);
  }
  _prisma = globalForPrisma.prisma;
}

export const prisma = _prisma;