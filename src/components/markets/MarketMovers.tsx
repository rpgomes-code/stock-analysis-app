'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for market movers
const US_MARKET_MOVERS = {
    gainers: [
        { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 950.62, change: 35.38, percentChange: 3.87, volume: 24.6 },
        { symbol: 'SMCI', name: 'Super Micro Computer', price: 994.76, change: 35.21, percentChange: 3.67, volume: 6.8 },
        { symbol: 'MSTR', name: 'MicroStrategy Inc', price: 1468.92, change: 42.74, percentChange: 3.00, volume: 1.2 },
        { symbol: 'AMD', name: 'Advanced Micro Devices', price: 178.59, change: 4.67, percentChange: 2.69, volume: 14.3 },
        { symbol: 'TSLA', name: 'Tesla Inc', price: 178.83, change: 4.33, percentChange: 2.48, volume: 32.6 },
    ],
    losers: [
        { symbol: 'ORCL', name: 'Oracle Corporation', price: 124.89, change: -5.21, percentChange: -4.00, volume: 9.4 },
        { symbol: 'XOM', name: 'Exxon Mobil Corp', price: 111.27, change: -3.84, percentChange: -3.34, volume: 8.2 },
        { symbol: 'CVX', name: 'Chevron Corporation', price: 155.36, change: -4.78, percentChange: -2.99, volume: 4.1 },
        { symbol: 'WMT', name: 'Walmart Inc', price: 59.64, change: -1.45, percentChange: -2.37, volume: 7.5 },
        { symbol: 'UNH', name: 'UnitedHealth Group', price: 487.23, change: -10.42, percentChange: -2.09, volume: 2.8 },
    ]
};

interface MarketMoversProps {
    market: string; // 'us', 'global', etc.
    direction: 'up' | 'down'; // 'up' for gainers, 'down' for losers
    title?: string;
}

export default function MarketMovers({ market, direction, title }: MarketMoversProps) {
    const [moversData, setMoversData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMarketMovers = async () => {
            setIsLoading(true);
            try {
                // This would be an API call in a real app
                // const data = await stockService.getMarketMovers(market, direction);

                // For demo, use mock data
                setTimeout(() => {
                    const data = direction === 'up' ?
                        US_MARKET_MOVERS.gainers :
                        US_MARKET_MOVERS.losers;

                    setMoversData(data);
                    setIsLoading(false);
                }, 600);
            } catch (error) {
                console.error(`Error fetching market movers for ${market}:`, error);
                setIsLoading(false);
            }
        };

        fetchMarketMovers();
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
                    <div className="h-32 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
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