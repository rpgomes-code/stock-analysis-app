// src/app/api/stocks/[symbol]/route.ts
import {NextRequest, NextResponse} from 'next/server';
import { stockService } from '@/services/api';
import logger from '@/lib/logger';
import {ApiError} from "@/types/errors";

// GET /api/stocks/[symbol] - Get stock info
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ symbol: string; }> }
) {
    try {
        console.log(req);
        const { symbol } = params;

        if (!symbol) {
            return NextResponse.json(
                { message: 'Stock symbol is required' },
                { status: 400 }
            );
        }

        const stockInfo = await stockService.getTickerInfo(symbol);
        return NextResponse.json(stockInfo);
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
        return NextResponse.json(
            { message: 'Failed to fetch stock info' },
            { status: 500 }
        );
    }
}