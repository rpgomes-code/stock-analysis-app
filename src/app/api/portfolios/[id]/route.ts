// src/app/api/portfolios/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

// GET /api/portfolios/[id] - Get a specific portfolio
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

        // Get the portfolio with stocks
        const portfolio = await prisma.portfolio.findFirst({
            where: {
                id,
                userId: user.id
            },
            include: {
                stocks: true
            }
        });

        if (!portfolio) {
            return NextResponse.json(
                { message: 'Portfolio not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(portfolio);
    } catch (error: any) {
        logger.error(`Error fetching portfolio: ${error.message}`, { error });
        return NextResponse.json(
            { message: 'Failed to fetch portfolio' },
            { status: 500 }
        );
    }
}

// PUT /api/portfolios/[id] - Update a portfolio
export async function PUT(
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

        if (!body.name) {
            return NextResponse.json(
                { message: 'Portfolio name is required' },
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

        // Update portfolio
        const updateData: any = { name: body.name };

        if (body.description !== undefined) {
            updateData.description = body.description;
        }

        if (body.initialInvestment !== undefined) {
            updateData.initialInvestment = body.initialInvestment;
        }

        const portfolio = await prisma.portfolio.updateMany({
            where: {
                id,
                userId: user.id
            },
            data: updateData
        });

        if (portfolio.count === 0) {
            return NextResponse.json(
                { message: 'Portfolio not found or not owned by user' },
                { status: 404 }
            );
        }

        logger.info(`Portfolio updated: ${id} for user: ${user.id}`);

        return NextResponse.json(
            { message: 'Portfolio updated successfully' }
        );
    } catch (error: any) {
        logger.error(`Error updating portfolio: ${error.message}`, { error });
        return NextResponse.json(
            { message: 'Failed to update portfolio' },
            { status: 500 }
        );
    }
}

// DELETE /api/portfolios/[id] - Delete a portfolio
export async function DELETE(
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

        // Delete portfolio (this will cascade delete associated stocks)
        const portfolio = await prisma.portfolio.deleteMany({
            where: {
                id,
                userId: user.id
            }
        });

        if (portfolio.count === 0) {
            return NextResponse.json(
                { message: 'Portfolio not found or not owned by user' },
                { status: 404 }
            );
        }

        logger.info(`Portfolio deleted: ${id} for user: ${user.id}`);

        return NextResponse.json(
            { message: 'Portfolio deleted successfully' }
        );
    } catch (error: any) {
        logger.error(`Error deleting portfolio: ${error.message}`, { error });
        return NextResponse.json(
            { message: 'Failed to delete portfolio' },
            { status: 500 }
        );
    }
}