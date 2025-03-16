// src/app/api/market/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stockService } from '@/services/api';
import logger from '@/lib/logger';

// GET /api/market/status - Get market status
export async function GET(req: NextRequest) {
    try {
        const searchParams = new URL(req.url).searchParams;
        const market = searchParams.get('market') || 'us';

        const status = await stockService.getMarketStatus(market);
        return NextResponse.json(status);
    } catch (error: any) {
        logger.error(`Error fetching market status: ${error.message}`, { error });
        return NextResponse.json(
            { message: 'Failed to fetch market status' },
            { status: 500 }
        );
    }
}