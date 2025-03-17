'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
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
import { stockService } from '@/services/api';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

// Colors for the chart
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c'];

interface PortfolioOverviewProps {
    userId: string;
}

interface PortfolioData {
    id: string;
    name: string;
    initialInvestment: number;
    totalValue: number;
    allTimeReturn: number;
    allTimeReturnPercent: number;
    dailyChange: number;
    dailyChangePercent: number;
    holdings: HoldingData[];
    history: HistoryPoint[];
}

interface HoldingData {
    id: string;
    symbol: string;
    name: string;
    shares: number;
    avgCost: number;
    currentPrice: number;
    value: number;
    weight: number;
    return: number;
    returnPercent: number;
}

interface HistoryPoint {
    date: string;
    value: number;
}

interface StockData {
    regularMarketPrice?: number;
    currentPrice?: number;
    regularMarketChange?: number;
    shortName?: string;
    longName?: string;
    [key: string]: unknown;
}

interface TransactionData {
    id?: string;
    stockSymbol: string;
    quantity: number;
    price: number;
    type: 'BUY' | 'SELL';
    timestamp: Date | string;
    portfolioId?: string;
}

export default function PortfolioOverview({ userId }: PortfolioOverviewProps) {
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch portfolio data
    useEffect(() => {
        const fetchPortfolioData = async () => {
            setIsLoading(true);
            try {
                // Fetch list of portfolios
                const portfoliosResponse = await axios.get('/api/portfolios');
                const portfolios = portfoliosResponse.data;

                if (!portfolios || portfolios.length === 0) {
                    setIsLoading(false);
                    return;
                }

                // Get the first portfolio (or you could add logic to select a specific one)
                const portfolioId = portfolios[0].id;

                // Fetch detailed portfolio data including stocks
                const portfolioResponse = await axios.get(`/api/portfolios/${portfolioId}`);
                const portfolio = portfolioResponse.data;

                // No stocks in portfolio
                if (!portfolio.stocks || portfolio.stocks.length === 0) {
                    setPortfolioData({
                        ...portfolio,
                        totalValue: portfolio.initialInvestment || 0,
                        allTimeReturn: 0,
                        allTimeReturnPercent: 0,
                        dailyChange: 0,
                        dailyChangePercent: 0,
                        holdings: [],
                        history: generateHistoryData(portfolio.createdAt, portfolio.initialInvestment || 0)
                    });
                    setIsLoading(false);
                    return;
                }

                // Fetch stock data for all stocks in portfolio
                const symbols = portfolio.stocks.map((stock: { symbol: string }) => stock.symbol);
                const stocksData = await stockService.getMultiTicker(symbols);

                // Get transactions for this portfolio
                const transactionsResponse = await axios.get(`/api/portfolios/${portfolioId}/transactions`);
                const transactions = transactionsResponse.data;

                // Calculate holdings based on transactions
                const holdings = calculateHoldings(portfolio.stocks, transactions, stocksData);

                // Calculate portfolio value and returns
                const totalValue = holdings.reduce((sum: number, holding: HoldingData) => sum + holding.value, 0);
                const initialInvestment = portfolio.initialInvestment ||
                    holdings.reduce((sum: number, holding: HoldingData) =>
                        sum + (holding.shares * holding.avgCost), 0);

                const allTimeReturn = totalValue - initialInvestment;
                const allTimeReturnPercent = initialInvestment > 0 ? (allTimeReturn / initialInvestment) * 100 : 0;

                // Calculate daily change (this is simplified; in real app you'd use yesterday's closing values)
                const dailyChange = holdings.reduce((sum: number, holding: HoldingData) => {
                    const stockData = stocksData[holding.symbol];
                    const change = stockData ? (stockData.regularMarketChange || 0) * holding.shares : 0;
                    return sum + change;
                }, 0);

                const dailyChangePercent = totalValue > 0 ? (dailyChange / totalValue) * 100 : 0;

                // Generate historical data (in a real app, you'd fetch this from an API)
                const history = generatePerformanceHistory(portfolioId, initialInvestment, totalValue);

                setPortfolioData({
                    ...portfolio,
                    initialInvestment,
                    totalValue,
                    allTimeReturn,
                    allTimeReturnPercent,
                    dailyChange,
                    dailyChangePercent,
                    holdings,
                    history
                });
            } catch (err) {
                console.error("Error fetching portfolio data:", err);
                setError("Failed to load portfolio data. Please try again later.");
                toast.error("Error", {
                    description: "Failed to load portfolio data"
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchPortfolioData().then(() => {});
        }
    }, [userId]);

    // Helper function to calculate holdings based on transactions
    const calculateHoldings = (
        stocks: Array<{ id: string; symbol: string }>,
        transactions: TransactionData[],
        stocksData: Record<string, StockData>
    ): HoldingData[] => {
        // Group transactions by symbol
        const transactionsBySymbol: Record<string, TransactionData[]> = {};
        transactions.forEach((transaction: TransactionData) => {
            if (!transactionsBySymbol[transaction.stockSymbol]) {
                transactionsBySymbol[transaction.stockSymbol] = [];
            }
            transactionsBySymbol[transaction.stockSymbol].push(transaction);
        });

        // Calculate holdings
        const holdings: HoldingData[] = [];
        let totalPortfolioValue = 0;

        stocks.forEach((stock) => {
            const stockTransactions = transactionsBySymbol[stock.symbol] || [];
            let totalShares = 0;
            let totalCost = 0;

            // Calculate shares and cost basis from transactions
            stockTransactions.forEach((transaction: TransactionData) => {
                if (transaction.type === 'BUY') {
                    totalShares += transaction.quantity;
                    totalCost += transaction.quantity * transaction.price;
                } else if (transaction.type === 'SELL') {
                    totalShares -= transaction.quantity;
                    // For simplicity, we don't adjust cost basis on sells
                    // In a real app, you might want to implement FIFO/LIFO
                }
            });

            // Skip if no shares (all sold)
            if (totalShares <= 0) return;

            const avgCost = totalShares > 0 ? totalCost / totalShares : 0;
            const stockData = stocksData[stock.symbol] || {};
            const currentPrice = stockData.regularMarketPrice || stockData.currentPrice || 0;
            const value = totalShares * currentPrice;
            const returnValue = value - (totalShares * avgCost);
            const returnPercent = avgCost > 0 ? (returnValue / (totalShares * avgCost)) * 100 : 0;

            totalPortfolioValue += value;

            holdings.push({
                id: stock.id,
                symbol: stock.symbol,
                name: stockData.shortName || stockData.longName || stock.symbol,
                shares: totalShares,
                avgCost,
                currentPrice,
                value,
                weight: 0, // Will calculate after getting total value
                return: returnValue,
                returnPercent
            });
        });

        // Calculate weights
        if (totalPortfolioValue > 0) {
            holdings.forEach(holding => {
                holding.weight = (holding.value / totalPortfolioValue) * 100;
            });
        }

        return holdings;
    };

    // Generate mock history data
    // In a real app, you'd fetch this from an API with actual historical values
    const generatePerformanceHistory = (portfolioId: string, initialValue: number, currentValue: number) => {
        const history = [];
        const now = new Date();
        const startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);

        // For demo purposes, create a roughly linear growth with some volatility
        // In a real app, this would be actual historical data
        const days = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const increment = (currentValue - initialValue) / days;

        for (let i = 0; i <= days; i += 7) { // Weekly points
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);

            // Add some randomness
            const randomFactor = 1 + (Math.random() * 0.04 - 0.02); // ±2%
            const value = initialValue + (increment * i * randomFactor);

            history.push({
                date: format(date, 'yyyy-MM-dd'),
                value: Math.max(0, Math.round(value * 100) / 100)
            });
        }

        // Ensure the last point matches current value
        if (history.length > 0) {
            history[history.length - 1].value = currentValue;
        }

        return history;
    };

    // Helper function to generate empty history data
    const generateHistoryData = (createdAtStr: string, initialValue: number) => {
        const history = [];
        const createdAt = new Date(createdAtStr);
        const now = new Date();

        // Add creation date point
        history.push({
            date: format(createdAt, 'yyyy-MM-dd'),
            value: initialValue
        });

        // Add current date point
        history.push({
            date: format(now, 'yyyy-MM-dd'),
            value: initialValue
        });

        return history;
    };

    if (isLoading) {
        return <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Skeleton className="h-80 w-full lg:col-span-2" />
                <Skeleton className="h-80 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>;
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

    if (!portfolioData) {
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
                            {portfolioData.holdings.length > 0 ? (
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
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <p>No holdings to display</p>
                                </div>
                            )}
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
                    {portfolioData.holdings.length > 0 ? (
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
                                    <tr key={holding.id} className="border-b hover:bg-muted/50">
                                        <td className="py-3 px-4 font-medium">
                                            <Link href={`/stocks/${holding.symbol}`} className="hover:underline">
                                                {holding.symbol}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4">{holding.name}</td>
                                        <td className="py-3 px-4 text-right">{holding.shares.toFixed(2)}</td>
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
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No holdings in this portfolio yet.</p>
                            <Button className="mt-4" asChild>
                                <Link href={`/portfolio/${portfolioData.id}/add`}>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Add Stock
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}