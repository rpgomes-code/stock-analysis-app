// src/app/api/stocks/[symbol]/news/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stockService } from '@/services/api';
import logger from '@/lib/logger';
import {ApiError} from "@/types/errors";

// GET /api/stocks/[symbol]/news - Get stock news
export async function GET(
    req: NextRequest,
    { params }: { params: { symbol: string } }
) {
    try {
        const { symbol } = params;

        const news = await stockService.getTickerNews(symbol);
        return NextResponse.json(news);
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
        return NextResponse.json(
            { message: 'Failed to fetch stock news' },
            { status: 500 }
        );
    }
}