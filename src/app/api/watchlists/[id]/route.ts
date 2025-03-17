// src/app/api/watchlists/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import logger from '@/lib/logger';
import {ApiError} from "@/types/errors";

const prisma = new PrismaClient();

// GET /api/watchlists/[id] - Get a specific watchlist
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

        // Get the watchlist with stocks
        const watchlist = await prisma.watchlist.findFirst({
            where: {
                id,
                userId: user.id
            },
            include: {
                stocks: true
            }
        });

        if (!watchlist) {
            return NextResponse.json(
                { message: 'Watchlist not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(watchlist);
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
        return NextResponse.json(
            { message: 'Failed to fetch watchlist' },
            { status: 500 }
        );
    }
}

// PUT /api/watchlists/[id] - Update a watchlist
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

        // Update watchlist
        const watchlist = await prisma.watchlist.updateMany({
            where: {
                id,
                userId: user.id
            },
            data: {
                name: body.name
            }
        });

        if (watchlist.count === 0) {
            return NextResponse.json(
                { message: 'Watchlist not found or not owned by user' },
                { status: 404 }
            );
        }

        logger.info(`Watchlist updated: ${id} for user: ${user.id}`);

        return NextResponse.json(
            { message: 'Watchlist updated successfully' }
        );
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
        return NextResponse.json(
            { message: 'Failed to update watchlist' },
            { status: 500 }
        );
    }
}

// DELETE /api/watchlists/[id] - Delete a watchlist
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

        // Delete watchlist (this will cascade delete associated stocks)
        const watchlist = await prisma.watchlist.deleteMany({
            where: {
                id,
                userId: user.id
            }
        });

        if (watchlist.count === 0) {
            return NextResponse.json(
                { message: 'Watchlist not found or not owned by user' },
                { status: 404 }
            );
        }

        logger.info(`Watchlist deleted: ${id} for user: ${user.id}`);

        return NextResponse.json(
            { message: 'Watchlist deleted successfully' }
        );
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
        return NextResponse.json(
            { message: 'Failed to delete watchlist' },
            { status: 500 }
        );
    }
}