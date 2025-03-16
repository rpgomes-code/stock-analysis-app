// src/app/api/watchlists/[id]/stocks/[stockId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

// DELETE /api/watchlists/[id]/stocks/[stockId] - Remove a stock from a watchlist
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; stockId: string } }
) {
    try {
        const { id, stockId } = params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Verify watchlist exists and belongs to user
        const watchlist = await prisma.watchlist.findFirst({
            where: {
                id,
                userId: user.id
            }
        });

        if (!watchlist) {
            return NextResponse.json(
                { message: 'Watchlist not found or not owned by user' },
                { status: 404 }
            );
        }

        // Delete stock from watchlist
        const stock = await prisma.stock.deleteMany({
            where: {
                id: stockId,
                watchlistId: id
            }
        });

        if (stock.count === 0) {
            return NextResponse.json(
                { message: 'Stock not found in watchlist' },
                { status: 404 }
            );
        }

        logger.info(`Stock removed from watchlist: ${stockId} from ${id}`);

        return NextResponse.json(
            { message: 'Stock removed from watchlist successfully' }
        );
    } catch (error: any) {
        logger.error(`Error removing stock from watchlist: ${error.message}`, { error });
        return NextResponse.json(
            { message: 'Failed to remove stock from watchlist' },
            { status: 500 }
        );
    }
}