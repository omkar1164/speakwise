import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const connectDatabase = async (): Promise<void> => {
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};

export { prisma };
