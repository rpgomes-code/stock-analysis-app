// src/app/api/market/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stockService } from '@/services/api';
import logger from '@/lib/logger';

// GET /api/market/summary - Get market summary data
export async function GET(req: NextRequest) {
    try {
        const searchParams = new URL(req.url).searchParams;
        const market = searchParams.get('market') || 'us';

        // Fetch market summary from the yfinance API service
        const summary = await stockService.getMarketSummary(market);
        return NextResponse.json(summary);
    } catch (error: any) {
        logger.error(`Error fetching market summary: ${error.message}`, { error });
        return NextResponse.json(
            { message: 'Failed to fetch market summary' },
            { status: 500 }
        );
    }
}