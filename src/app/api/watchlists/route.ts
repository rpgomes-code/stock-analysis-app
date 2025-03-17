// src/app/api/watchlists/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import logger from '@/lib/logger';
import { ApiError } from "@/types/errors";
import db from '@/lib/db'; // Updated to use the server-only db instance

// GET /api/watchlists - Get all watchlists for the current user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Find the user
        const user = await db.user.findUnique({
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
        const watchlists = await db.watchlist.findMany({
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
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
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
        const user = await db.user.findUnique({
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
        const watchlist = await db.watchlist.create({
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
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
        return NextResponse.json(
            { message: 'Failed to create watchlist' },
            { status: 500 }
        );
    }
}