import { createRequire } from "node:module";
import { PrismaClient as PrismaClientNode } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const require = createRequire(import.meta.url);
const databaseUrl = process.env.DATABASE_URL ?? "";
const useAccelerate = databaseUrl.startsWith("prisma://");

const createPrismaClient = () => {
  if (useAccelerate) {
    const { PrismaClient } = require("@prisma/client/edge") as typeof import("@prisma/client/edge");
    const { withAccelerate } = require("@prisma/extension-accelerate") as any;
    return new PrismaClient({ accelerateUrl: databaseUrl }).$extends(withAccelerate());
  }
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  return new PrismaClientNode({ adapter });
};

type PrismaClientInstance = ReturnType<typeof createPrismaClient>;
const globalForPrisma = globalThis as { prisma?: PrismaClientInstance };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
