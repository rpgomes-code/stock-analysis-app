import { Suspense } from 'react';
import Link from 'next/link';
import { BarChart3, Globe, TrendingUp, ChevronRight, Clock, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { stockService } from '@/services/api';
import MarketChart from '@/components/markets/MarketChart';
import MarketSummary from '@/components/markets/MarketSummary';
import MarketMovers from '@/components/markets/MarketMovers';

export const metadata = {
    title: 'Markets | Stock Analysis',
    description: 'Market overviews, indices, trends, and global data',
};

// Check market status (would normally be a server component)
async function getMarketStatus() {
    try {
        const usMarketStatus = await stockService.getMarketStatus('us');

        // This would depend on your API response format
        return {
            us: {
                isOpen: usMarketStatus?.isOpen || false,
                nextOpen: usMarketStatus?.nextMarketOpen || '2024-03-18T13:30:00Z',
                nextClose: usMarketStatus?.nextMarketClose || '2024-03-18T20:00:00Z',
            }
        };
    } catch (error) {
        console.error('Failed to fetch market status:', error);
        return {
            us: {
                isOpen: false,
                nextOpen: '2024-03-18T13:30:00Z',
                nextClose: '2024-03-18T20:00:00Z',
            }
        };
    }
}

// Get market indices data
async function getMarketIndices() {
    // In a real app, this would be API calls
    // This is mocked data
    return {
        us: [
            { symbol: '^GSPC', name: 'S&P 500', value: 5123.47, change: 38.54, percentChange: 0.76 },
            { symbol: '^DJI', name: 'Dow Jones', value: 38654.89, change: 124.21, percentChange: 0.32 },
            { symbol: '^IXIC', name: 'NASDAQ', value: 16021.34, change: 162.41, percentChange: 1.02 },
            { symbol: '^RUT', name: 'Russell 2000', value: 2024.36, change: 12.84, percentChange: 0.64 },
            { symbol: '^VIX', name: 'VIX', value: 14.73, change: -1.21, percentChange: -7.59 },
        ],
        global: [
            { symbol: '^FTSE', name: 'FTSE 100', value: 7648.98, change: -16.23, percentChange: -0.21 },
            { symbol: '^GDAXI', name: 'DAX', value: 17842.92, change: 76.57, percentChange: 0.43 },
            { symbol: '^FCHI', name: 'CAC 40', value: 7928.45, change: 34.82, percentChange: 0.44 },
            { symbol: '^N225', name: 'Nikkei 225', value: 39098.68, change: 435.12, percentChange: 1.12 },
            { symbol: '^HSI', name: 'Hang Seng', value: 16512.92, change: -134.45, percentChange: -0.81 },
        ],
        crypto: [
            { symbol: 'BTC-USD', name: 'Bitcoin', value: 61234.78, change: 1432.56, percentChange: 2.34 },
            { symbol: 'ETH-USD', name: 'Ethereum', value: 3452.19, change: 64.53, percentChange: 1.87 },
            { symbol: 'SOL-USD', name: 'Solana', value: 132.45, change: 7.54, percentChange: 5.68 },
            { symbol: 'ADA-USD', name: 'Cardano', value: 0.48, change: -0.02, percentChange: -4.12 },
            { symbol: 'DOGE-USD', name: 'Dogecoin', value: 0.12, change: 0.01, percentChange: 8.33 },
        ],
        sectors: [
            { symbol: 'XLK', name: 'Technology', value: 182.45, change: 3.21, percentChange: 1.79 },
            { symbol: 'XLF', name: 'Financial', value: 38.73, change: 0.12, percentChange: 0.31 },
            { symbol: 'XLV', name: 'Healthcare', value: 141.21, change: 1.05, percentChange: 0.75 },
            { symbol: 'XLE', name: 'Energy', value: 87.34, change: -1.24, percentChange: -1.42 },
            { symbol: 'XLY', name: 'Consumer Cyclical', value: 182.73, change: 2.31, percentChange: 1.28 },
        ],
    };
}

export default async function MarketsPage() {
    const marketStatus = await getMarketStatus();
    const marketIndices = await getMarketIndices();

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="container max-w-screen-xl mx-auto p-6">
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center">
                            <BarChart3 className="mr-2 h-7 w-7" />
                            Markets
                        </h1>
                        <p className="text-muted-foreground">
                            Market overviews, indices, and global data
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
                        <Button variant="outline" size="sm">
                            <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Market Status */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Market Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center justify-between md:justify-start md:space-x-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">US Markets</span>
                                    <Badge variant={marketStatus.us.isOpen ? "default" : "secondary"} className="w-fit mt-1">
                                        {marketStatus.us.isOpen ? 'Open' : 'Closed'}
                                    </Badge>
                                </div>
                                {marketStatus.us.isOpen ? (
                                    <div className="text-sm text-muted-foreground">
                                        Closes at {formatTime(marketStatus.us.nextClose)}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">
                                        Opens at {formatTime(marketStatus.us.nextOpen)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Markets Tabs */}
                <Tabs defaultValue="us" className="w-full">
                    <TabsList className="flex justify-start w-full overflow-x-auto mb-6">
                        <TabsTrigger value="us">US Markets</TabsTrigger>
                        <TabsTrigger value="global">Global Markets</TabsTrigger>
                        <TabsTrigger value="crypto">Crypto</TabsTrigger>
                        <TabsTrigger value="sectors">Sectors</TabsTrigger>
                        <TabsTrigger value="commodities">Commodities</TabsTrigger>
                        <TabsTrigger value="forex">Forex</TabsTrigger>
                    </TabsList>

                    {/* US Markets Tab */}
                    <TabsContent value="us" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {marketIndices.us.map((index) => (
                                <Link href={`/stocks/${index.symbol}`} key={index.symbol}>
                                    <Card className="hover:shadow-md transition-shadow h-full">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold">{index.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{index.symbol}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">{index.value.toLocaleString()}</p>
                                                    <p className={`text-sm ${index.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {index.percentChange >= 0 ? '+' : ''}{index.percentChange.toFixed(2)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        {/* Chart for S&P 500 */}
                        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                            <MarketChart symbol="^GSPC" name="S&P 500" />
                        </Suspense>

                        {/* Market summary and movers */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Suspense fallback={<Skeleton className="h-[300px] w-full col-span-1 lg:col-span-2" />}>
                                <MarketSummary market="us" className="col-span-1 lg:col-span-2" />
                            </Suspense>

                            <div className="space-y-6">
                                <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                                    <MarketMovers market="us" direction="up" title="Top Gainers" />
                                </Suspense>

                                <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                                    <MarketMovers market="us" direction="down" title="Top Losers" />
                                </Suspense>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button variant="link" asChild>
                                <Link href="/markets/us" className="flex items-center">
                                    View detailed US market data <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Global Markets Tab */}
                    <TabsContent value="global" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {marketIndices.global.map((index) => (
                                <Link href={`/stocks/${index.symbol}`} key={index.symbol}>
                                    <Card className="hover:shadow-md transition-shadow h-full">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold">{index.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{index.symbol}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">{index.value.toLocaleString()}</p>
                                                    <p className={`text-sm ${index.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {index.percentChange >= 0 ? '+' : ''}{index.percentChange.toFixed(2)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        <div className="p-8 text-center">
                            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <h3 className="text-lg font-medium mb-2">Global Market Analysis</h3>
                            <p className="text-muted-foreground mb-4">
                                Detailed global market data and analysis is coming soon. Check back for updates.
                            </p>
                            <Button>Get Notified</Button>
                        </div>
                    </TabsContent>

                    {/* Crypto Tab */}
                    <TabsContent value="crypto" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {marketIndices.crypto.map((crypto) => (
                                <Link href={`/stocks/${crypto.symbol}`} key={crypto.symbol}>
                                    <Card className="hover:shadow-md transition-shadow h-full">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold">{crypto.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">${crypto.value.toLocaleString()}</p>
                                                    <p className={`text-sm ${crypto.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {crypto.percentChange >= 0 ? '+' : ''}{crypto.percentChange.toFixed(2)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        <div className="p-8 text-center">
                            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <h3 className="text-lg font-medium mb-2">Cryptocurrency Market Analysis</h3>
                            <p className="text-muted-foreground mb-4">
                                Detailed cryptocurrency market data and analysis is coming soon. Check back for updates.
                            </p>
                            <Button>Get Notified</Button>
                        </div>
                    </TabsContent>

                    {/* Placeholders for other tabs */}
                    <TabsContent value="sectors" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {marketIndices.sectors.map((sector) => (
                                <Link href={`/stocks/${sector.symbol}`} key={sector.symbol}>
                                    <Card className="hover:shadow-md transition-shadow h-full">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold">{sector.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{sector.symbol}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">${sector.value.toLocaleString()}</p>
                                                    <p className={`text-sm ${sector.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {sector.percentChange >= 0 ? '+' : ''}{sector.percentChange.toFixed(2)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        <div className="p-8 text-center">
                            <p className="text-muted-foreground">More detailed sector analysis coming soon</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="commodities" className="py-12 text-center">
                        <p className="text-muted-foreground">Commodities data coming soon</p>
                    </TabsContent>

                    <TabsContent value="forex" className="py-12 text-center">
                        <p className="text-muted-foreground">Forex data coming soon</p>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}