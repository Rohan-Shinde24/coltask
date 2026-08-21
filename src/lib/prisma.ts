import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const client = new PrismaClient();
  
  // Test and log the database connection
  client.$connect()
    .then(() => console.log('✅ Successfully connected to PostgreSQL database via Prisma!'))
    .catch((err: any) => console.error('❌ Failed to connect to the database:', err));
    
  return client;
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
