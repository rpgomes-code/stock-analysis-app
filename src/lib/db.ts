// src/lib/db.ts
import { PrismaClient } from '@prisma/client'
import 'server-only'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Export a db instance that can be used across server components and API handlers
export default db