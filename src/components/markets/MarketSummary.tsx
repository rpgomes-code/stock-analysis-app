'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { stockService } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#6A6AFF', '#FFD700', '#A569BD'];

interface MarketSummaryProps {
    market: string; // 'us', 'global', etc.
    className?: string;
}

interface SectorPerformance {
    name: string;
    value: number;
    change: number;
}

interface AdvanceDecline {
    advances: number;
    declines: number;
    unchanged: number;
    newHighs: number;
    newLows: number;
    advanceVolume: number;
    declineVolume: number;
}

interface MarketStats {
    totalVolume: number;
    avgVolume: number;
    avgAdvance: number;
    avgDecline: number;
    medianPE: number;
    medianDivYield: number;
}

interface MarketSummaryData {
    sectorPerformance: SectorPerformance[];
    advanceDecline: AdvanceDecline;
    marketStats: MarketStats;
}

export default function MarketSummary({ market, className = '' }: MarketSummaryProps) {
    const [summaryData, setSummaryData] = useState<MarketSummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMarketSummary = async () => {
            setIsLoading(true);
            try {
                // Call the real API for market summary data
                const data = await stockService.getMarketSummary(market);
                setSummaryData(data);
            } catch (error) {
                console.error(`Error fetching market summary for ${market}:`, error);
                setError('Failed to load market data');
                toast.error('Error', {
                    description: 'Failed to load market summary data'
                });

                // As a fallback, use some mock data
                const mockData = {
                    sectorPerformance: [
                        { name: 'Technology', value: 34, change: 1.8 },
                        { name: 'Financial', value: 15, change: 0.3 },
                        { name: 'Healthcare', value: 13, change: 0.7 },
                        { name: 'Consumer Cyclical', value: 10, change: 1.2 },
                        { name: 'Industrial', value: 9, change: 0.5 },
                        { name: 'Communication', value: 8, change: 1.4 },
                        { name: 'Energy', value: 4, change: -1.4 },
                        { name: 'Consumer Defensive', value: 4, change: 0.2 },
                        { name: 'Real Estate', value: 2, change: -0.8 },
                        { name: 'Utilities', value: 1, change: -0.3 },
                    ],
                    advanceDecline: {
                        advances: 312,
                        declines: 189,
                        unchanged: 14,
                        newHighs: 42,
                        newLows: 18,
                        advanceVolume: 678.4,
                        declineVolume: 423.6,
                    },
                    marketStats: {
                        totalVolume: 1102,
                        avgVolume: 1258,
                        avgAdvance: 1.4,
                        avgDecline: -1.1,
                        medianPE: 21.2,
                        medianDivYield: 1.8,
                    }
                };

                setSummaryData(mockData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMarketSummary().then(() => {});
    }, [market]);

    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Market Summary</CardTitle>
                    <CardDescription>
                        Loading market data...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                        <Skeleton className="h-64 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!summaryData) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Market Summary</CardTitle>
                    <CardDescription>
                        No data available
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center p-6">
                        <p>Unable to load market summary data. Please try again later.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Market Summary</CardTitle>
                <CardDescription>
                    S&P 500 sector performance and market statistics
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sector Performance */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Sector Performance</h3>
                        <div className="space-y-2">
                            {summaryData.sectorPerformance.map((sector) => (
                                <div key={sector.name} className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: COLORS[summaryData.sectorPerformance.indexOf(sector) % COLORS.length] }}
                                        ></div>
                                        <span>{sector.name}</span>
                                        <span className="text-muted-foreground text-xs ml-2">{sector.value}%</span>
                                    </div>
                                    <span className={sector.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                                        {sector.change >= 0 ? '+' : ''}{sector.change}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={summaryData.sectorPerformance}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {summaryData.sectorPerformance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => `${value}%`}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                    contentStyle={{
                                        backgroundColor: 'var(--background)',
                                        borderColor: 'var(--border)',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Market Statistics */}
                <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Advance/Decline Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Advancing Issues</span>
                                <span className="font-medium text-green-500">{summaryData.advanceDecline.advances}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Declining Issues</span>
                                <span className="font-medium text-red-500">{summaryData.advanceDecline.declines}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Unchanged</span>
                                <span className="font-medium">{summaryData.advanceDecline.unchanged}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">New Highs</span>
                                <span className="font-medium text-green-500">{summaryData.advanceDecline.newHighs}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">New Lows</span>
                                <span className="font-medium text-red-500">{summaryData.advanceDecline.newLows}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">A/D Ratio</span>
                                <span className="font-medium">
                                    {(summaryData.advanceDecline.advances / summaryData.advanceDecline.declines).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Volume (M)</span>
                                <span className="font-medium">{summaryData.marketStats.totalVolume}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Median P/E</span>
                                <span className="font-medium">{summaryData.marketStats.medianPE}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Median Div Yield</span>
                                <span className="font-medium">{summaryData.marketStats.medianDivYield}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}