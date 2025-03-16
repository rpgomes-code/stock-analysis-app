'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { stockService } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface MarketMoversProps {
    market: string; // 'us', 'global', etc.
    direction: 'up' | 'down'; // 'up' for gainers, 'down' for losers
    title?: string;
}

interface StockData {
    symbol: string;
    name: string;
    exchange: string;
    price: number;
    change: number;
    percentChange: number;
    volume: number;
}

export default function MarketMovers({ market, direction, title }: MarketMoversProps) {
    const [moversData, setMoversData] = useState<StockData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMarketMovers = async () => {
            setIsLoading(true);
            try {
                // Call the real API for market movers data
                const apiDirection = direction === 'up' ? 'gainers' : 'losers';
                const data = await stockService.getMarketMovers(market, apiDirection);
                setMoversData(data);
            } catch (error) {
                console.error(`Error fetching market movers for ${market}:`, error);
                setError('Failed to load market movers data');
                toast.error('Error', {
                    description: 'Failed to load market movers data'
                });

                // As a fallback, use some mock data
                const mockData = direction === 'up' ? [
                    { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', price: 950.62, change: 35.38, percentChange: 3.87, volume: 24.6 },
                    { symbol: 'SMCI', name: 'Super Micro Computer', exchange: 'NASDAQ', price: 994.76, change: 35.21, percentChange: 3.67, volume: 6.8 },
                    { symbol: 'MSTR', name: 'MicroStrategy Inc', exchange: 'NASDAQ', price: 1468.92, change: 42.74, percentChange: 3.00, volume: 1.2 },
                    { symbol: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ', price: 178.59, change: 4.67, percentChange: 2.69, volume: 14.3 },
                    { symbol: 'TSLA', name: 'Tesla Inc', exchange: 'NASDAQ', price: 178.83, change: 4.33, percentChange: 2.48, volume: 32.6 },
                ] : [
                    { symbol: 'ORCL', name: 'Oracle Corporation', exchange: 'NYSE', price: 124.89, change: -5.21, percentChange: -4.00, volume: 9.4 },
                    { symbol: 'XOM', name: 'Exxon Mobil Corp', exchange: 'NYSE', price: 111.27, change: -3.84, percentChange: -3.34, volume: 8.2 },
                    { symbol: 'CVX', name: 'Chevron Corporation', exchange: 'NYSE', price: 155.36, change: -4.78, percentChange: -2.99, volume: 4.1 },
                    { symbol: 'WMT', name: 'Walmart Inc', exchange: 'NYSE', price: 59.64, change: -1.45, percentChange: -2.37, volume: 7.5 },
                    { symbol: 'UNH', name: 'UnitedHealth Group', exchange: 'NYSE', price: 487.23, change: -10.42, percentChange: -2.09, volume: 2.8 },
                ];

                setMoversData(mockData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMarketMovers().then(() => {});
    }, [market, direction]);

    const defaultTitle = direction === 'up' ? 'Top Gainers' : 'Top Losers';
    const displayTitle = title || defaultTitle;

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        {direction === 'up' ? (
                            <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                            <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
                        )}
                        {displayTitle}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error && moversData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        {direction === 'up' ? (
                            <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                            <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
                        )}
                        {displayTitle}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base font-medium">
                    {direction === 'up' ? (
                        <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                        <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
                    )}
                    {displayTitle}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-2">
                <div className="space-y-1">
                    {moversData.map((stock) => (
                        <Link
                            key={stock.symbol}
                            href={`/stocks/${stock.symbol}`}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                        >
                            <div>
                                <div className="font-medium">{stock.symbol}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                    {stock.name}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">${stock.price.toFixed(2)}</div>
                                <div className={`text-xs ${stock.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {stock.percentChange >= 0 ? '+' : ''}{stock.percentChange.toFixed(2)}%
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}