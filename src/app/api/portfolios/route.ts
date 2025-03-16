// src/app/api/portfolios/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

// GET /api/portfolios - Get all portfolios for the current user
export async function GET(req: NextRequest) {
    try {
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

        // Get all portfolios with their stocks
        const portfolios = await prisma.portfolio.findMany({
            where: { userId: user.id },
            include: {
                stocks: {
                    select: {
                        id: true,
                        symbol: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(portfolios);
    } catch (error: any) {
        logger.error(`Error fetching portfolios: ${error.message}`, { error });
        return NextResponse.json(
            { message: 'Failed to fetch portfolios' },
            { status: 500 }
        );
    }
}

// POST /api/portfolios - Create a new portfolio
export async function POST(req: NextRequest) {
    try {
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

        // Create portfolio
        const portfolio = await prisma.portfolio.create({
            data: {
                name: body.name,
                userId: user.id,
                initialInvestment: body.initialInvestment || 0,
                description: body.description
            }
        });

        logger.info(`Portfolio created: ${portfolio.id} for user: ${user.id}`);

        return NextResponse.json(
            { message: 'Portfolio created successfully', portfolio },
            { status: 201 }
        );
    } catch (error: any) {
        logger.error(`Error creating portfolio: ${error.message}`, { error });
        return NextResponse.json(
            { message: 'Failed to create portfolio' },
            { status: 500 }
        );
    }
}