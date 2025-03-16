// src/app/api/stocks/[symbol]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stockService } from '@/services/api';
import logger from '@/lib/logger';

// GET /api/stocks/[symbol] - Get stock info
export async function GET(
    req: NextRequest,
    { params }: { params: { symbol: string } }
) {
    try {
        const { symbol } = params;

        if (!symbol) {
            return NextResponse.json(
                { message: 'Stock symbol is required' },
                { status: 400 }
            );
        }

        const stockInfo = await stockService.getTickerInfo(symbol);
        return NextResponse.json(stockInfo);
    } catch (error: any) {
        logger.error(`Error fetching stock info: ${error.message}`, { error });
        return NextResponse.json(
            { message: 'Failed to fetch stock info' },
            { status: 500 }
        );
    }
}