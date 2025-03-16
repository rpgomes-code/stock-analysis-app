// src/app/api/stocks/[symbol]/financials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stockService } from '@/services/api';
import logger from '@/lib/logger';

// GET /api/stocks/[symbol]/financials - Get stock financials
export async function GET(
    req: NextRequest,
    { params }: { params: { symbol: string } }
) {
    try {
        const { symbol } = params;

        const financials = await stockService.getTickerFinancials(symbol);
        return NextResponse.json(financials);
    } catch (error: any) {
        logger.error(`Error fetching stock financials: ${error.message}`, { error });
        return NextResponse.json(
            { message: 'Failed to fetch stock financials' },
            { status: 500 }
        );
    }
}