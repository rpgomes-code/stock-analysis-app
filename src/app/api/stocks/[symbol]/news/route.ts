// src/app/api/stocks/[symbol]/news/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stockService } from '@/services/api';
import logger from '@/lib/logger';

// GET /api/stocks/[symbol]/news - Get stock news
export async function GET(
    req: NextRequest,
    { params }: { params: { symbol: string } }
) {
    try {
        const { symbol } = params;

        const news = await stockService.getTickerNews(symbol);
        return NextResponse.json(news);
    } catch (error: any) {
        logger.error(`Error fetching stock news: ${error.message}`, { error });
        return NextResponse.json(
            { message: 'Failed to fetch stock news' },
            { status: 500 }
        );
    }
}