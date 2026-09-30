import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/env";
import { PrismaClient } from "@/generated/prisma/client";

// Typed loosely: after a reload it may hold a client of a previous PrismaClient class
const globalForPrisma = globalThis as unknown as {
  prisma?: { $disconnect: () => Promise<void> };
};

const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });

/**
 * Reuse the client across hot reloads in dev to avoid exhausting connections.
 * After `prisma generate` (a new migration) the dev server reloads a new
 * PrismaClient class: an instance of the old one lacks the new models, so it
 * is replaced instead of reused.
 */
function devClient() {
  const cached = globalForPrisma.prisma;
  if (cached instanceof PrismaClient) return cached;
  void cached?.$disconnect();
  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export const db =
  env.NODE_ENV === "production" ? createPrismaClient() : devClient();
