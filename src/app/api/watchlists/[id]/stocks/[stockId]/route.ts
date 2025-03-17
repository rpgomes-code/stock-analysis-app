// src/app/api/watchlists/[id]/stocks/[stockId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth-options';
import logger from '@/lib/logger';
import {ApiError} from "@/types/errors";

const prisma = new PrismaClient();

// DELETE /api/watchlists/[id]/stocks/[stockId] - Remove a stock from a watchlist
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; stockId: string; }> }
) {
    try {
        console.log(req);
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
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
        return NextResponse.json(
            { message: 'Failed to remove stock from watchlist' },
            { status: 500 }
        );
    }
}