// src/app/api/stocks/[symbol]/financials/route.ts
import {NextRequest, NextResponse} from 'next/server';
import { stockService } from '@/services/api';
import logger from '@/lib/logger';
import {ApiError} from "@/types/errors";

// GET /api/stocks/[symbol]/financials - Get stock financials
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ symbol: string; }> }
) {
    try {
        console.log(req);
        const { symbol } = params;

        const financials = await stockService.getTickerFinancials(symbol);
        return NextResponse.json(financials);
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
        return NextResponse.json(
            { message: 'Failed to fetch stock financials' },
            { status: 500 }
        );
    }
}