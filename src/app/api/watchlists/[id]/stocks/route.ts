// src/app/api/watchlists/[id]/stocks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth-options';
import logger from '@/lib/logger';
import {ApiError} from "@/types/errors";

const prisma = new PrismaClient();

// POST /api/watchlists/[id]/stocks - Add a stock to a watchlist
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; }> }
) {
    try {
        const { id } = params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get request body
        const body = await req.json();

        if (!body.symbol) {
            return NextResponse.json(
                { message: 'Stock symbol is required' },
                { status: 400 }
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

        // Check if stock already exists in this watchlist
        const existingStock = await prisma.stock.findFirst({
            where: {
                symbol: body.symbol.toUpperCase(),
                watchlistId: id
            }
        });

        if (existingStock) {
            return NextResponse.json(
                { message: 'Stock already exists in this watchlist' },
                { status: 400 }
            );
        }

        // Add stock to watchlist
        const stock = await prisma.stock.create({
            data: {
                symbol: body.symbol.toUpperCase(),
                watchlistId: id
            }
        });

        logger.info(`Stock added to watchlist: ${stock.symbol} to ${id}`);

        return NextResponse.json(
            { message: 'Stock added to watchlist successfully', stock },
            { status: 201 }
        );
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
        return NextResponse.json(
            { message: 'Failed to add stock to watchlist' },
            { status: 500 }
        );
    }
}