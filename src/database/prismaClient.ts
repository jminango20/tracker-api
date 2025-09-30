import { PrismaClient } from '@prisma/client';

class PrismaClientSingleton {
  private static instance: PrismaClient | null = null;

  static getInstance(): PrismaClient {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' 
          ? ['query', 'error', 'warn'] 
          : ['error'],
        errorFormat: 'pretty',
      });

      const cleanup = async () => {
        if (PrismaClientSingleton.instance) {
          await PrismaClientSingleton.instance.$disconnect();
          PrismaClientSingleton.instance = null;
        }
      };

      process.on('beforeExit', cleanup);
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
    }

    return PrismaClientSingleton.instance;
  }

  static async disconnect(): Promise<void> {
    if (PrismaClientSingleton.instance) {
      await PrismaClientSingleton.instance.$disconnect();
      PrismaClientSingleton.instance = null;
    }
  }
}

export const prisma = PrismaClientSingleton.getInstance();

export default prisma;