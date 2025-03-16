// src/app/api/watchlists/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

// GET /api/watchlists - Get all watchlists for the current user
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

        // Get all watchlists with their stocks
        const watchlists = await prisma.watchlist.findMany({
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

        return NextResponse.json(watchlists);
    } catch (error: any) {
        logger.error(`Error fetching watchlists: ${error.message}`, { error });
        return NextResponse.json(
            { message: 'Failed to fetch watchlists' },
            { status: 500 }
        );
    }
}

// POST /api/watchlists - Create a new watchlist
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
                { message: 'Watchlist name is required' },
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

        // Create watchlist
        const watchlist = await prisma.watchlist.create({
            data: {
                name: body.name,
                userId: user.id
            }
        });

        logger.info(`Watchlist created: ${watchlist.id} for user: ${user.id}`);

        return NextResponse.json(
            { message: 'Watchlist created successfully', watchlist },
            { status: 201 }
        );
    } catch (error: any) {
        logger.error(`Error creating watchlist: ${error.message}`, { error });
        return NextResponse.json(
            { message: 'Failed to create watchlist' },
            { status: 500 }
        );
    }
}