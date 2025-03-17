// src/app/api/market/movers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stockService } from '@/services/api';
import logger from '@/lib/logger';
import {ApiError} from "@/types/errors";

// GET /api/market/movers - Get market movers (gainers/losers)
export async function GET(req: NextRequest) {
    try {
        const searchParams = new URL(req.url).searchParams;
        const market = searchParams.get('market') || 'us';
        const direction = searchParams.get('direction') || 'gainers';

        if (!['gainers', 'losers'].includes(direction)) {
            return NextResponse.json(
                { message: 'Direction must be either "gainers" or "losers"' },
                { status: 400 }
            );
        }

        const movers = await stockService.getMarketMovers(market, direction as 'gainers' | 'losers');
        return NextResponse.json(movers);
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
        return NextResponse.json(
            { message: 'Failed to fetch market movers' },
            { status: 500 }
        );
    }
}