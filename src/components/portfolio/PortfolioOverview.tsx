'use client';

import { useEffect, useState } from 'react';
import {LineChart, BarChart, PieChart, ArrowUpRight, ArrowDownRight, AlertTriangle, PlusCircle} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock portfolio data (in a real app, this would be fetched from backend)
const MOCK_PORTFOLIO_DATA = {
    totalValue: 48761.23,
    initialInvestment: 42500,
    allTimeReturn: 6261.23,
    allTimeReturnPercent: 14.73,
    dailyChange: 356.87,
    dailyChangePercent: 0.74,
    holdings: [
        { symbol: 'AAPL', name: 'Apple Inc.', shares: 20, avgCost: 153.42, currentPrice: 189.78, value: 3795.60, weight: 7.78, return: 726.20, returnPercent: 23.7 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 15, avgCost: 287.65, currentPrice: 421.89, value: 6328.35, weight: 12.98, return: 2016.60, returnPercent: 46.8 },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', shares: 25, avgCost: 132.18, currentPrice: 178.12, value: 4453.00, weight: 9.13, return: 1148.50, returnPercent: 34.8 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 30, avgCost: 124.67, currentPrice: 147.21, value: 4416.30, weight: 9.06, return: 676.20, returnPercent: 18.1 },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: 8, avgCost: 478.23, currentPrice: 950.62, value: 7604.96, weight: 15.60, return: 3780.12, returnPercent: 98.8 },
        { symbol: 'BRK-B', name: 'Berkshire Hathaway', shares: 18, avgCost: 347.89, currentPrice: 412.14, value: 7418.52, weight: 15.21, return: 1155.50, returnPercent: 18.5 },
        { symbol: 'JPM', name: 'JPMorgan Chase', shares: 35, avgCost: 160.42, currentPrice: 187.68, value: 6568.80, weight: 13.47, return: 953.10, returnPercent: 17.0 },
        { symbol: 'JNJ', name: 'Johnson & Johnson', shares: 40, avgCost: 165.73, currentPrice: 154.32, value: 6172.80, weight: 12.66, return: -456.40, returnPercent: -6.9 },
        { symbol: 'PG', name: 'Procter & Gamble', shares: 22, avgCost: 145.28, currentPrice: 161.13, value: 3544.86, weight: 7.27, return: 348.70, returnPercent: 10.9 },
    ],
    history: [
        { date: '2023-03-15', value: 42500.00 },
        { date: '2023-04-15', value: 43121.45 },
        { date: '2023-05-15', value: 44567.89 },
        { date: '2023-06-15', value: 43980.12 },
        { date: '2023-07-15', value: 45321.56 },
        { date: '2023-08-15', value: 46876.34 },
        { date: '2023-09-15', value: 45789.23 },
        { date: '2023-10-15', value: 47234.56 },
        { date: '2023-11-15', value: 47890.10 },
        { date: '2023-12-15', value: 48123.78 },
        { date: '2024-01-15', value: 47432.19 },
        { date: '2024-02-15', value: 47980.67 },
        { date: '2024-03-15', value: 48761.23 },
    ],
};

// Colors for the chart
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c'];

interface PortfolioOverviewProps {
    userId: string;
}

export default function PortfolioOverview({ userId }: PortfolioOverviewProps) {
    const [portfolioData, setPortfolioData] = useState(MOCK_PORTFOLIO_DATA);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // In a real implementation, fetch portfolio data from your backend
    useEffect(() => {
        // This would be an API call to your backend
        const fetchPortfolioData = async () => {
            setIsLoading(true);
            try {
                // For demo, we'll use the mock data
                // const response = await fetch(`/api/portfolio/${userId}/overview`);
                // const data = await response.json();
                // setPortfolioData(data);

                // Simulate API call
                setTimeout(() => {
                    setPortfolioData(MOCK_PORTFOLIO_DATA);
                    setIsLoading(false);
                }, 500);
            } catch (err) {
                console.error("Error fetching portfolio data:", err);
                setError("Failed to load portfolio data. Please try again later.");
                setIsLoading(false);
            }
        };

        fetchPortfolioData().then(() => {});
    }, [userId]);

    if (isLoading) {
        return <div>Loading portfolio data...</div>;
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!portfolioData || portfolioData.holdings.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">No Portfolio Data Available</h2>
                <p className="text-muted-foreground mb-8">You haven&#39;t created any portfolios yet or haven&#39;t added any stocks to your portfolios.</p>
                <Button asChild>
                    <Link href="/portfolio/create">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Portfolio
                    </Link>
                </Button>
            </div>
        );
    }

    // Calculate some statistics
    const positiveHoldings = portfolioData.holdings.filter(h => h.return > 0);
    const negativeHoldings = portfolioData.holdings.filter(h => h.return < 0);
    const totalPositive = positiveHoldings.reduce((acc, h) => acc + h.return, 0);
    const totalNegative = Math.abs(negativeHoldings.reduce((acc, h) => acc + h.return, 0));

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Portfolio Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Initial Investment: ${portfolioData.initialInvestment.toLocaleString('en-US')}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Today&#39;s Change
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <div className={`text-2xl font-bold ${portfolioData.dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ${Math.abs(portfolioData.dailyChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className={`ml-2 flex items-center ${portfolioData.dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {portfolioData.dailyChange >= 0 ?
                                    <ArrowUpRight className="h-4 w-4 mr-1" /> :
                                    <ArrowDownRight className="h-4 w-4 mr-1" />
                                }
                                {Math.abs(portfolioData.dailyChangePercent).toFixed(2)}%
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Based on last market close
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Return
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <div className={`text-2xl font-bold ${portfolioData.allTimeReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ${Math.abs(portfolioData.allTimeReturn).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className={`ml-2 flex items-center ${portfolioData.allTimeReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {portfolioData.allTimeReturn >= 0 ?
                                    <ArrowUpRight className="h-4 w-4 mr-1" /> :
                                    <ArrowDownRight className="h-4 w-4 mr-1" />
                                }
                                {Math.abs(portfolioData.allTimeReturnPercent).toFixed(2)}%
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Since inception
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Profit/Loss Ratio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(totalPositive / (totalNegative || 1)).toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                            <span className="text-green-500">Gain: ${totalPositive.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                            <span className="text-red-500">Loss: ${totalNegative.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Holdings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <LineChart className="h-5 w-5 mr-2" />
                            Portfolio Performance
                        </CardTitle>
                        <CardDescription>
                            Historical value over time
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsLineChart
                                    data={portfolioData.history}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(date) => {
                                            const d = new Date(date);
                                            return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
                                        }}
                                    />
                                    <YAxis
                                        tickFormatter={(value) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Portfolio Value']}
                                        labelFormatter={(date) => {
                                            const d = new Date(date);
                                            return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        activeDot={{ r: 8 }}
                                    />
                                </RechartsLineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Allocation Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <PieChart className="h-5 w-5 mr-2" />
                            Portfolio Allocation
                        </CardTitle>
                        <CardDescription>
                            Current distribution by holdings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={portfolioData.holdings}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={90}
                                        innerRadius={40}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="symbol"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                                    >
                                        {portfolioData.holdings.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Value']}
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Holdings Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <BarChart className="h-5 w-5 mr-2" />
                        Holdings
                    </CardTitle>
                    <CardDescription>
                        Current portfolio holdings and performance
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4">Symbol</th>
                                <th className="text-left py-3 px-4">Name</th>
                                <th className="text-right py-3 px-4">Shares</th>
                                <th className="text-right py-3 px-4">Avg Cost</th>
                                <th className="text-right py-3 px-4">Current Price</th>
                                <th className="text-right py-3 px-4">Value</th>
                                <th className="text-right py-3 px-4">Weight</th>
                                <th className="text-right py-3 px-4">Return ($)</th>
                                <th className="text-right py-3 px-4">Return (%)</th>
                            </tr>
                            </thead>
                            <tbody>
                            {portfolioData.holdings.map((holding) => (
                                <tr key={holding.symbol} className="border-b hover:bg-muted/50">
                                    <td className="py-3 px-4 font-medium">
                                        <Link href={`/stocks/${holding.symbol}`} className="hover:underline">
                                            {holding.symbol}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-4">{holding.name}</td>
                                    <td className="py-3 px-4 text-right">{holding.shares}</td>
                                    <td className="py-3 px-4 text-right">${holding.avgCost.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-right">${holding.currentPrice.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-right">${holding.value.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-right">{holding.weight.toFixed(2)}%</td>
                                    <td className={`py-3 px-4 text-right ${holding.return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        ${holding.return.toFixed(2)}
                                    </td>
                                    <td className={`py-3 px-4 text-right ${holding.returnPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {holding.returnPercent >= 0 ? '+' : ''}{holding.returnPercent.toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}