'use client';

import { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    Scatter, PieChart, Pie,
    Cell
} from 'recharts';
import { addDays, format, subMonths, subYears, parseISO } from 'date-fns';
import { TrendingUp, Calendar, DollarSign, BarChart as BarChartIcon, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

// Mock data for charts
const generatePerformanceData = (startDate: Date, days: number, initialValue: number, volatility: number = 0.015) => {
    const data = [];
    let currentValue = initialValue;

    for (let i = 0; i < days; i++) {
        const date = addDays(startDate, i);

        // Add some random daily fluctuation
        const dailyChange = currentValue * (Math.random() * volatility * 2 - volatility);

        // Add a slight upward trend
        const trendFactor = 1 + (Math.random() * 0.001);

        currentValue = currentValue + dailyChange;
        currentValue = currentValue * trendFactor;

        // Add some more volatility on certain days
        if (i % 20 === 0) {
            currentValue = currentValue * (1 + (Math.random() * 0.03 - 0.015));
        }

        data.push({
            date: format(date, 'yyyy-MM-dd'),
            value: Math.round(currentValue * 100) / 100,
            marketValue: Math.round(initialValue * (1 + i * 0.0008) * 100) / 100
        });
    }

    return data;
};

// Generate mock performance comparison data
const generateComparisonData = () => {
    const now = new Date();
    const oneYearAgo = subYears(now, 1);

    return generatePerformanceData(oneYearAgo, 365, 42500, 0.015);
};

// Generate monthly returns data
const generateMonthlyReturnsData = () => {
    const data = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
        const month = subMonths(now, i);
        const monthName = format(month, 'MMM');
        const returns = (Math.random() * 16) - 8; // Random returns between -8% and 8%

        data.push({
            month: monthName,
            returns: parseFloat(returns.toFixed(2))
        });
    }

    return data;
};

// Generate asset allocation data
const generateAssetAllocationData = () => {
    return [
        { name: 'Technology', value: 35 },
        { name: 'Financial', value: 20 },
        { name: 'Healthcare', value: 15 },
        { name: 'Consumer', value: 12 },
        { name: 'Industrial', value: 10 },
        { name: 'Energy', value: 5 },
        { name: 'Other', value: 3 },
    ];
};

// Generate sector performance data
const generateSectorPerformanceData = () => {
    return [
        { name: 'Technology', returns: 22.4 },
        { name: 'Financial', returns: 8.7 },
        { name: 'Healthcare', returns: 12.3 },
        { name: 'Consumer', returns: 6.5 },
        { name: 'Industrial', returns: 4.8 },
        { name: 'Energy', returns: -3.2 },
        { name: 'Other', returns: 1.9 },
    ];
};

// Generate risk vs return data for scatter plot
const generateRiskReturnData = () => {
    // Each point represents a stock in the portfolio
    return [
        { name: 'AAPL', risk: 15.2, returns: 26.8, value: 3795.60 },
        { name: 'MSFT', risk: 14.8, returns: 32.1, value: 6328.35 },
        { name: 'AMZN', risk: 24.3, returns: 18.5, value: 4453.00 },
        { name: 'GOOGL', risk: 18.9, returns: 17.2, value: 4416.30 },
        { name: 'NVDA', risk: 30.6, returns: 72.4, value: 7604.96 },
        { name: 'BRK-B', risk: 12.1, returns: 15.3, value: 7418.52 },
        { name: 'JPM', risk: 19.7, returns: 21.2, value: 6568.80 },
        { name: 'JNJ', risk: 8.9, returns: 5.6, value: 6172.80 },
        { name: 'PG', risk: 10.2, returns: 12.4, value: 3544.86 },
    ];
};

// Colors for charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c'];

// Mock portfolio stats
const PORTFOLIO_STATS = {
    totalReturn: 14.73,
    annualizedReturn: 12.48,
    alpha: 2.65,
    beta: 0.92,
    sharpeRatio: 1.34,
    volatility: 15.63,
    maxDrawdown: -18.42,
    trackingError: 4.21,
    informationRatio: 0.87,
    sortinoRatio: 1.67
};

interface PortfolioPerformanceProps {
    userId: string;
}

export default function PortfolioPerformance({ userId }: PortfolioPerformanceProps) {
    type PerformanceData = Record<string, unknown>;
    const [performanceData, setPerformanceData] = useState<PerformanceData[] | null>(null);
    interface MonthlyReturnData {
        month: string;
        returns: number;
    }
    const [monthlyReturnsData, setMonthlyReturnsData] = useState<MonthlyReturnData[] | null>(null);
    interface AssetAllocationData {
        name: string;
        value: number;
    }
    const [assetAllocationData, setAssetAllocationData] = useState<AssetAllocationData[] | null>(null);
    interface SectorPerformanceData {
        name: string;
        returns: number;
    }
    const [sectorPerformanceData, setSectorPerformanceData] = useState<SectorPerformanceData[] | null>(null);
    interface RiskReturnData {
        name: string;
        risk: number;
        returns: number;
        value: number;
    }
    const [riskReturnData, setRiskReturnData] = useState<RiskReturnData[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState('1y');

    // Fetch performance data
    useEffect(() => {
        const fetchPerformanceData = async () => {
            setIsLoading(true);
            try {
                // In a real app, this would be API calls
                // const response = await fetch(`/api/portfolio/${userId}/performance?range=${timeRange}`);
                // const data = await response.json();

                // For demo, we'll generate mock data
                setTimeout(() => {
                    const mockComparisonData = generateComparisonData();
                    setPerformanceData(mockComparisonData);
                    setMonthlyReturnsData(generateMonthlyReturnsData());
                    setAssetAllocationData(generateAssetAllocationData());
                    setSectorPerformanceData(generateSectorPerformanceData());
                    setRiskReturnData(generateRiskReturnData());
                    setIsLoading(false);
                }, 800);
            } catch (err) {
                console.error('Error fetching performance data:', err);
                setError('Failed to load performance data. Please try again later.');
                setIsLoading(false);
            }
        };

        fetchPerformanceData().then(() => {});
    }, [userId, timeRange]);

    // Handle time range change
    const handleTimeRangeChange = (value: string) => {
        setTimeRange(value);
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[240px] w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[240px] w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    // Format dollar values
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* Time period selector */}
            <div className="flex justify-end">
                <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Select defaultValue={timeRange} onValueChange={handleTimeRangeChange}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1m">1 Month</SelectItem>
                            <SelectItem value="3m">3 Months</SelectItem>
                            <SelectItem value="6m">6 Months</SelectItem>
                            <SelectItem value="1y">1 Year</SelectItem>
                            <SelectItem value="3y">3 Years</SelectItem>
                            <SelectItem value="5y">5 Years</SelectItem>
                            <SelectItem value="max">Max</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Performance chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Portfolio Performance vs Market
                    </CardTitle>
                    <CardDescription>
                        Comparing your portfolio performance against market benchmarks
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={performanceData || undefined}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => {
                                        return format(parseISO(date), 'MMM yyyy');
                                    }}
                                    minTickGap={30}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                                />
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    labelFormatter={(label) => format(parseISO(label), 'MMMM d, yyyy')}
                                />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="value"
                                    name="Portfolio Value"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 8 }}
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="marketValue"
                                    name="Market Benchmark"
                                    stroke="#82ca9d"
                                    strokeWidth={2}
                                    dot={false}
                                    strokeDasharray="5 5"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Key Performance Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <BarChartIcon className="h-5 w-5 mr-2" />
                        Key Performance Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Total Return</div>
                            <div className="text-2xl font-bold">{PORTFOLIO_STATS.totalReturn.toFixed(2)}%</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Annualized Return</div>
                            <div className="text-2xl font-bold">{PORTFOLIO_STATS.annualizedReturn.toFixed(2)}%</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Alpha</div>
                            <div className="text-2xl font-bold">{PORTFOLIO_STATS.alpha.toFixed(2)}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Beta</div>
                            <div className="text-2xl font-bold">{PORTFOLIO_STATS.beta.toFixed(2)}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                            <div className="text-2xl font-bold">{PORTFOLIO_STATS.sharpeRatio.toFixed(2)}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Volatility</div>
                            <div className="text-2xl font-bold">{PORTFOLIO_STATS.volatility.toFixed(2)}%</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Max Drawdown</div>
                            <div className="text-2xl font-bold">{PORTFOLIO_STATS.maxDrawdown.toFixed(2)}%</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Tracking Error</div>
                            <div className="text-2xl font-bold">{PORTFOLIO_STATS.trackingError.toFixed(2)}%</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Information Ratio</div>
                            <div className="text-2xl font-bold">{PORTFOLIO_STATS.informationRatio.toFixed(2)}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Sortino Ratio</div>
                            <div className="text-2xl font-bold">{PORTFOLIO_STATS.sortinoRatio.toFixed(2)}</div>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                        <p className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            These metrics help you understand how your portfolio is performing relative to risk and market benchmarks.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monthly Returns */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Returns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={monthlyReturnsData || []}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="month" />
                                    <YAxis tickFormatter={(value) => `${value}%`} />
                                    <Tooltip
                                        formatter={(value: number) => [`${value.toFixed(2)}%`, 'Return']}
                                        labelFormatter={(label) => `Month: ${label}`}
                                    />
                                    <Bar
                                        dataKey="returns"
                                        name="Monthly Return"
                                        fill="#82ca9d"
                                    >
                                        {monthlyReturnsData?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.returns >= 0 ? '#82ca9d' : '#ff8042'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Asset Allocation */}
                <Card>
                    <CardHeader>
                        <CardTitle>Asset Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={assetAllocationData || []}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {assetAllocationData?.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value}%`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Sector Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sector Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={sectorPerformanceData || []}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 80,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                    <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                                    <YAxis type="category" dataKey="name" width={80} />
                                    <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`, 'Return']} />
                                    <Bar
                                        dataKey="returns"
                                        name="Sector Return"
                                        fill="#82ca9d"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Risk vs Return */}
                <Card>
                    <CardHeader>
                        <CardTitle>Risk vs Return Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={riskReturnData || []}
                                    margin={{
                                        top: 20,
                                        right: 20,
                                        bottom: 20,
                                        left: 20,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis
                                        dataKey="risk"
                                        type="number"
                                        name="Risk"
                                        label={{ value: 'Risk (%)', position: 'insideBottom', offset: -5 }}
                                        domain={[0, 40]}
                                    />
                                    <YAxis
                                        dataKey="returns"
                                        type="number"
                                        name="Return"
                                        label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }}
                                        domain={[0, 80]}
                                    />
                                    <Tooltip
                                        formatter={(value: number, name: string) => {
                                            if (name === 'returns') return [`${value.toFixed(2)}%`, 'Return'];
                                            if (name === 'risk') return [`${value.toFixed(2)}%`, 'Risk'];
                                            if (name === 'value') return [formatCurrency(value), 'Position Size'];
                                            return [value, name];
                                        }}
                                        labelFormatter={(label) => `${label}`}
                                    />
                                    <Scatter
                                        name="Stocks"
                                        data={riskReturnData || []}
                                        fill="#8884d8"
                                        shape="circle"
                                        dataKey={(entry: { value: number }) => entry.value / 250}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground text-center">
                            Bubble size represents position size
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Analysis Note */}
            <Card>
                <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">
                        <p className="mb-2"><strong>Performance Analysis Note:</strong></p>
                        <p>
                            The portfolio has shown strong overall performance with a {PORTFOLIO_STATS.totalReturn.toFixed(2)}% total return,
                            outperforming the benchmark by {PORTFOLIO_STATS.alpha.toFixed(2)} percentage points (alpha).
                            With a beta of {PORTFOLIO_STATS.beta.toFixed(2)}, the portfolio exhibits slightly less volatility than the market.
                        </p>
                        <p className="mt-2">
                            The Sharpe ratio of {PORTFOLIO_STATS.sharpeRatio.toFixed(2)} indicates a good risk-adjusted return.
                            The maximum drawdown of {Math.abs(PORTFOLIO_STATS.maxDrawdown).toFixed(2)}% shows resilience during market downturns.
                            Consider rebalancing the technology sector which currently represents 35% of the portfolio to reduce concentration risk.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}