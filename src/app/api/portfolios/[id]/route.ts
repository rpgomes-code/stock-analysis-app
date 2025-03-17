// src/app/api/portfolios/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth-options'; // Updated import
import logger from '@/lib/logger';
import {ApiError} from "@/types/errors";

const prisma = new PrismaClient();

// PUT /api/portfolios/[id] - Update a portfolio
// Fix the function signature for Next.js App Router compatibility
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
        interface PortfolioUpdateData {
            name: string;
            description?: string | null;
            initialInvestment?: number;
        }

        const updateData: PortfolioUpdateData = { name: body.name };

        if (body.description !== undefined) {
            updateData.description = body.description;
        }

        if (body.initialInvestment !== undefined) {
            updateData.initialInvestment = body.initialInvestment;
        }

        // Change updateMany calls to use the typed updateData
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
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
        return NextResponse.json(
            { message: 'Failed to update portfolio' },
            { status: 500 }
        );
    }
}