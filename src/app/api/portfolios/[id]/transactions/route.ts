// src/app/api/portfolios/[id]/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth-options';
import logger from '@/lib/logger';
import {ApiError} from "@/types/errors";

const prisma = new PrismaClient();

// GET /api/portfolios/[id]/transactions - Get all transactions for a portfolio
export async function GET(
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

        // Get transactions for this portfolio
        const transactions = await prisma.stockTransaction.findMany({
            where: {
                portfolioId: id
            },
            orderBy: {
                timestamp: 'desc'
            }
        });

        return NextResponse.json(transactions);
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
        return NextResponse.json(
            { message: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}

// POST /api/portfolios/[id]/transactions - Add a transaction to a portfolio
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

        if (!body.stockSymbol) {
            return NextResponse.json(
                { message: 'Stock symbol is required' },
                { status: 400 }
            );
        }

        if (!body.quantity || typeof body.quantity !== 'number') {
            return NextResponse.json(
                { message: 'Valid quantity is required' },
                { status: 400 }
            );
        }

        if (!body.price || typeof body.price !== 'number') {
            return NextResponse.json(
                { message: 'Valid price is required' },
                { status: 400 }
            );
        }

        if (!body.type || !['BUY', 'SELL'].includes(body.type)) {
            return NextResponse.json(
                { message: 'Type must be BUY or SELL' },
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

        // Create transaction
        const transaction = await prisma.stockTransaction.create({
            data: {
                stockSymbol: body.stockSymbol.toUpperCase(),
                quantity: body.quantity,
                price: body.price,
                type: body.type,
                timestamp: body.timestamp || new Date(),
                portfolioId: id
            }
        });

        // Ensure the stock exists in the portfolio
        const existingStock = await prisma.stock.findFirst({
            where: {
                symbol: body.stockSymbol.toUpperCase(),
                portfolioId: id
            }
        });

        if (!existingStock) {
            // Add the stock to the portfolio
            await prisma.stock.create({
                data: {
                    symbol: body.stockSymbol.toUpperCase(),
                    portfolioId: id
                }
            });
        }

        logger.info(`Transaction added: ${transaction.id} to portfolio ${id}`);

        return NextResponse.json(
            { message: 'Transaction added successfully', transaction },
            { status: 201 }
        );
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
        return NextResponse.json(
            { message: 'Failed to add transaction' },
            { status: 500 }
        );
    }
}