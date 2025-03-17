// src/app/api/stocks/[symbol]/history/route.ts
import {NextRequest, NextResponse} from 'next/server';
import { stockService } from '@/services/api';
import logger from '@/lib/logger';
import {ApiError} from "@/types/errors";

// GET /api/stocks/[symbol]/history - Get stock price history
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ symbol: string; }> }
) {
    try {
        console.log(req);
        const { symbol } = params;
        const searchParams = new URL(req.url).searchParams;

        const period = searchParams.get('period') || '1y';
        const interval = searchParams.get('interval') || '1d';
        const start = searchParams.get('start') || undefined;
        const end = searchParams.get('end') || undefined;
        const prepost = searchParams.get('prepost') === 'true';
        const actions = searchParams.get('actions') === 'true';

        const historyParams = {
            period,
            interval,
            ...(start && { start }),
            ...(end && { end }),
            prepost,
            actions
        };

        const history = await stockService.getTickerHistory(symbol, historyParams);
        return NextResponse.json(history);
    } catch (error: unknown) {
        const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            originalError: error
        };

        logger.error(`Error message: ${apiError.message}`, { error: apiError });
        return NextResponse.json(
            { message: 'Failed to fetch stock history' },
            { status: 500 }
        );
    }
}