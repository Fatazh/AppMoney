import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const databaseUrl = process.env.DATABASE_URL ?? "";
const useAccelerate = databaseUrl.startsWith("prisma://");
const PrismaPgModule = useAccelerate ? null : await import("@prisma/adapter-pg");

const createPrismaClient = () => {
  if (useAccelerate) {
    const { PrismaClient } = require("@prisma/client/edge") as typeof import("@prisma/client/edge");
    // require the accelerate extension dynamically to avoid a static import error when the package is not installed
    const { withAccelerate } = require("@prisma/extension-accelerate") as any;
    return new PrismaClient({ accelerateUrl: databaseUrl }).$extends(withAccelerate());
  }
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client");
  const PrismaPg = PrismaPgModule?.PrismaPg;
  if (!PrismaPg) {
    throw new Error("Prisma adapter module failed to load");
  }
  const { Pool } = require("pg") as any;
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

type PrismaClientInstance = ReturnType<typeof createPrismaClient>;
const globalForPrisma = globalThis as { prisma?: PrismaClientInstance };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
