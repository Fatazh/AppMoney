import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const databaseUrl = process.env.DATABASE_URL ?? "";
const useAccelerate = databaseUrl.startsWith("prisma://");

const createPrismaClient = () => {
  if (useAccelerate) {
    const { PrismaClient } = require("@prisma/client/edge") as typeof import("@prisma/client/edge");
    // require the accelerate extension dynamically to avoid a static import error when the package is not installed
    const { withAccelerate } = require("@prisma/extension-accelerate") as any;
    return new PrismaClient({ accelerateUrl: databaseUrl }).$extends(withAccelerate());
  }
  const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client");
  return new PrismaClient();
};

type PrismaClientInstance = ReturnType<typeof createPrismaClient>;
const globalForPrisma = globalThis as { prisma?: PrismaClientInstance };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
