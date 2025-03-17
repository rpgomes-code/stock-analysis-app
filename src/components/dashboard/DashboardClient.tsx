'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LineChart, TrendingUp, TrendingDown, Briefcase, Plus } from 'lucide-react';
import StockSearch from '@/components/StockSearch';
import Watchlist from '@/components/Watchlist';
import MarketChart from '@/components/markets/MarketChart';
import { UserProps } from '@/types/settings';

interface DashboardClientProps {
    user: UserProps | null;
}

export default function DashboardClient({ user }: DashboardClientProps) {
    const [, setSearchResult] = useState<string | null>(null);

    // Handle stock search selection
    const handleStockSelect = (symbol: string) => {
        setSearchResult(symbol);
        // Navigate programmatically if needed
        window.location.href = `/stocks/${symbol}`;
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Dashboard Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center">
                    <LineChart className="mr-2 h-7 w-7" />
                    Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Welcome{user?.name ? `, ${user.name}` : ''}! Here&#39;s your market overview.
                </p>
            </div>

            {/* Market Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MarketSummaryCard
                    title="S&P 500"
                    value="5,123.47"
                    change="+0.76%"
                    isPositive={true}
                />
                <MarketSummaryCard
                    title="NASDAQ"
                    value="16,021.34"
                    change="+1.02%"
                    isPositive={true}
                />
                <MarketSummaryCard
                    title="DOW JONES"
                    value="38,654.89"
                    change="+0.32%"
                    isPositive={true}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Left Sidebar */}
                <div className="md:col-span-1">
                    <div className="space-y-6">
                        {/* Search Component */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Search Stocks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <StockSearch onSelect={handleStockSelect} />
                            </CardContent>
                        </Card>

                        {/* Watchlist Component */}
                        {user ? (
                            <Watchlist userId={user.id} />
                        ) : (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle>Watchlists</CardTitle>
                                    <CardDescription>
                                        Sign in to create and manage watchlists
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-center py-6">
                                    <Link href="/auth/signin">
                                        <Button>Sign In</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-3 space-y-6">
                    {/* Main Market Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                <span className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  S&P 500 Overview
                </span>
                                <Link href="/markets">
                                    <Button variant="outline" size="sm">View Markets</Button>
                                </Link>
                            </CardTitle>
                            <CardDescription>
                                S&P 500 index performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MarketChart symbol="^GSPC" name="S&P 500" />
                        </CardContent>
                    </Card>

                    {/* Tabbed Content Section */}
                    <Card>
                        <CardHeader className="pb-0">
                            <CardTitle>Market Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3">
                            <Tabs defaultValue="trending" className="w-full">
                                <TabsList>
                                    <TabsTrigger value="trending">Trending</TabsTrigger>
                                    <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
                                    <TabsTrigger value="losers">Top Losers</TabsTrigger>
                                    {user && <TabsTrigger value="portfolio">Your Portfolio</TabsTrigger>}
                                </TabsList>

                                {/* Trending Stocks Tab */}
                                <TabsContent value="trending" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <TrendingStockCard
                                            symbol="NVDA"
                                            name="NVIDIA Corporation"
                                            price="950.62"
                                            change="+3.76%"
                                            isPositive={true}
                                        />
                                        <TrendingStockCard
                                            symbol="TSLA"
                                            name="Tesla, Inc."
                                            price="178.83"
                                            change="-1.23%"
                                            isPositive={false}
                                        />
                                        <TrendingStockCard
                                            symbol="AAPL"
                                            name="Apple Inc."
                                            price="189.78"
                                            change="+0.54%"
                                            isPositive={true}
                                        />
                                        <TrendingStockCard
                                            symbol="MSFT"
                                            name="Microsoft Corporation"
                                            price="421.89"
                                            change="+1.12%"
                                            isPositive={true}
                                        />
                                    </div>
                                </TabsContent>

                                {/* Top Gainers Tab */}
                                <TabsContent value="gainers" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <TrendingStockCard
                                            symbol="NVDA"
                                            name="NVIDIA Corporation"
                                            price="950.62"
                                            change="+3.87%"
                                            isPositive={true}
                                        />
                                        <TrendingStockCard
                                            symbol="SMCI"
                                            name="Super Micro Computer"
                                            price="994.76"
                                            change="+3.67%"
                                            isPositive={true}
                                        />
                                        <TrendingStockCard
                                            symbol="MSTR"
                                            name="MicroStrategy Inc"
                                            price="1468.92"
                                            change="+3.00%"
                                            isPositive={true}
                                        />
                                        <TrendingStockCard
                                            symbol="AMD"
                                            name="Advanced Micro Devices"
                                            price="178.59"
                                            change="+2.69%"
                                            isPositive={true}
                                        />
                                    </div>
                                </TabsContent>

                                {/* Top Losers Tab */}
                                <TabsContent value="losers" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <TrendingStockCard
                                            symbol="ORCL"
                                            name="Oracle Corporation"
                                            price="124.89"
                                            change="-4.00%"
                                            isPositive={false}
                                        />
                                        <TrendingStockCard
                                            symbol="XOM"
                                            name="Exxon Mobil Corp"
                                            price="111.27"
                                            change="-3.34%"
                                            isPositive={false}
                                        />
                                        <TrendingStockCard
                                            symbol="CVX"
                                            name="Chevron Corporation"
                                            price="155.36"
                                            change="-2.99%"
                                            isPositive={false}
                                        />
                                        <TrendingStockCard
                                            symbol="WMT"
                                            name="Walmart Inc"
                                            price="59.64"
                                            change="-2.37%"
                                            isPositive={false}
                                        />
                                    </div>
                                </TabsContent>

                                {/* Portfolio Tab (only for authenticated users) */}
                                {user && (
                                    <TabsContent value="portfolio" className="pt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center">
                                                <Briefcase className="h-5 w-5 mr-2" />
                                                <h3 className="font-semibold">Your Portfolios</h3>
                                            </div>
                                            <Link href="/portfolio">
                                                <Button size="sm">
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Manage Portfolios
                                                </Button>
                                            </Link>
                                        </div>
                                        <div className="p-8 text-center border rounded-md bg-muted/40">
                                            <p className="text-sm text-muted-foreground mb-2">
                                                View and manage your portfolio performance
                                            </p>
                                            <Link href="/portfolio">
                                                <Button variant="default">Go to Portfolio</Button>
                                            </Link>
                                        </div>
                                    </TabsContent>
                                )}
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Helper Components
const MarketSummaryCard = ({ title, value, change, isPositive }: {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
}) => (
    <Card className="shadow-sm">
        <CardContent className="p-4">
            <div className="flex justify-between items-center">
                <p className="font-medium">{title}</p>
                <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {change}
                </div>
            </div>
            <p className="text-2xl font-bold mt-2">{value}</p>
        </CardContent>
    </Card>
);

const TrendingStockCard = ({ symbol, name, price, change, isPositive }: {
    symbol: string;
    name: string;
    price: string;
    change: string;
    isPositive: boolean;
}) => (
    <Link href={`/stocks/${symbol}`} className="block">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold">{symbol}</p>
                        <p className="text-sm text-muted-foreground">{name}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">${price}</p>
                        <p className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {change}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </Link>
);