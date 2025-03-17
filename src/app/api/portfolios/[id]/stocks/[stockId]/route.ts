// src/app/api/portfolios/[id]/stocks/[stockId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import logger from '@/lib/logger';
import {ApiError} from "@/types/errors";

const prisma = new PrismaClient();

// DELETE /api/portfolios/[id]/stocks/[stockId] - Remove a stock from a portfolio
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

        // Verify portfolio exists and belongs to user
        const portfolio = await prisma.portfolio.findFirst({
            where: {
                id,
                userId: user.id
            }
        });

        if (!portfolio) {
            return NextResponse.json(
                { message: 'Portfolio not found or not owned by user' },
                { status: 404 }
            );
        }

        // Delete stock from portfolio
        const stock = await prisma.stock.deleteMany({
            where: {
                id: stockId,
                portfolioId: id
            }
        });

        if (stock.count === 0) {
            return NextResponse.json(
                { message: 'Stock not found in portfolio' },
                { status: 404 }
            );
        }

        logger.info(`Stock removed from portfolio: ${stockId} from ${id}`);

        return NextResponse.json(
            { message: 'Stock removed from portfolio successfully' }
        );
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
        return NextResponse.json(
            { message: 'Failed to remove stock from portfolio' },
            { status: 500 }
        );
    }
}