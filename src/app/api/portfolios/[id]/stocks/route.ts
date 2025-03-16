// src/app/api/portfolios/[id]/stocks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

// POST /api/portfolios/[id]/stocks - Add a stock to a portfolio
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
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

        // Check if stock already exists in this portfolio
        const existingStock = await prisma.stock.findFirst({
            where: {
                symbol: body.symbol.toUpperCase(),
                portfolioId: id
            }
        });

        if (existingStock) {
            return NextResponse.json(
                { message: 'Stock already exists in this portfolio' },
                { status: 400 }
            );
        }

        // Add stock to portfolio
        const stock = await prisma.stock.create({
            data: {
                symbol: body.symbol.toUpperCase(),
                portfolioId: id
            }
        });

        logger.info(`Stock added to portfolio: ${stock.symbol} to ${id}`);

        return NextResponse.json(
            { message: 'Stock added to portfolio successfully', stock },
            { status: 201 }
        );
    } catch (error: any) {
        logger.error(`Error adding stock to portfolio: ${error.message}`, { error });
        return NextResponse.json(
            { message: 'Failed to add stock to portfolio' },
            { status: 500 }
        );
    }
}