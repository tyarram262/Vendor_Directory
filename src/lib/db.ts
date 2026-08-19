import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across Next.js dev-server hot reloads.
// Without this guard, every HMR pass would open a fresh connection pool.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
