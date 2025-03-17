// src/app/api/market/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stockService } from '@/services/api';
import logger from '@/lib/logger';
import {ApiError} from "@/types/errors";

// GET /api/market/status - Get market status
export async function GET(req: NextRequest) {
    try {
        const searchParams = new URL(req.url).searchParams;
        const market = searchParams.get('market') || 'us';

        const status = await stockService.getMarketStatus(market);
        return NextResponse.json(status);
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
        return NextResponse.json(
            { message: 'Failed to fetch market status' },
            { status: 500 }
        );
    }
}