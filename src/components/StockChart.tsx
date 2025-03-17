'use client';

import React, { useState, useEffect } from 'react';
import {
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { stockService } from '@/services/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface StockChartProps {
    symbol: string;
}

interface ChartData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface StockInfo {
    shortName?: string;
    longName?: string;
    regularMarketPrice?: number;
    regularMarketChange?: number;
    regularMarketChangePercent?: number;
    [key: string]: string | number | undefined;
}

const StockChart: React.FC<StockChartProps> = ({ symbol }) => {
    const [data, setData] = useState<ChartData[]>([]);
    const [period, setPeriod] = useState('1mo');
    const [interval, setInterval] = useState('1d');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState('price');
    const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Periods for the selector
    const periods = [
        { value: '1d', label: '1 Day' },
        { value: '5d', label: '5 Days' },
        { value: '1mo', label: '1 Month' },
        { value: '3mo', label: '3 Months' },
        { value: '6mo', label: '6 Months' },
        { value: '1y', label: '1 Year' },
        { value: '2y', label: '2 Years' },
        { value: '5y', label: '5 Years' },
    ];

    // Intervals for the selector
    const intervals = [
        { value: '1m', label: '1 Minute' },
        { value: '5m', label: '5 Minutes' },
        { value: '15m', label: '15 Minutes' },
        { value: '30m', label: '30 Minutes' },
        { value: '60m', label: '1 Hour' },
        { value: '1d', label: '1 Day' },
        { value: '1wk', label: '1 Week' },
        { value: '1mo', label: '1 Month' },
    ];

    // Filter appropriate intervals based on a selected period
    const getValidIntervals = () => {
        if (['1d', '5d'].includes(period)) {
            return intervals.filter(i => ['1m', '5m', '15m', '30m', '60m'].includes(i.value));
        }
        if (['1mo', '3mo'].includes(period)) {
            return intervals.filter(i => ['15m', '30m', '60m', '1d'].includes(i.value));
        }
        return intervals.filter(i => ['1d', '1wk', '1mo'].includes(i.value));
    };

    // Fetch stock data
    useEffect(() => {
        const fetchData = async () => {
            if (!symbol) return;

            setIsLoading(true);
            setError(null);

            try {
                // Fetch historical data using the API service
                const historyData = await stockService.getTickerHistory(symbol, {
                    period,
                    interval,
                });

                if (!historyData || historyData.length === 0) {
                    setError("No historical data available for this time period");
                    setData([]);
                    return;
                }

                // Process data for the chart
                const processedData = historyData.map((item: { Date: string; Open: number; High: number; Low: number; Close: number; Volume: number }) => ({
                    date: format(new Date(item.Date), interval === '1d' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm'),
                    open: item.Open,
                    high: item.High,
                    low: item.Low,
                    close: item.Close,
                    volume: item.Volume,
                }));

                setData(processedData);

                // Also fetch stock info if it's not loaded yet
                if (!stockInfo) {
                    const info = await stockService.getTickerInfo(symbol);
                    setStockInfo(info);
                }
            } catch (error) {
                console.error('Error fetching stock data:', error);
                setError("Failed to load chart data. Please try again later.");
                toast.error("Error", {
                    description: "Failed to load chart data"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData().then(() => {});
    }, [symbol, period, interval, stockInfo]);

    // Color based on stock performance
    const getChartColor = () => {
        if (data.length < 2) return '#888888'; // Neutral gray if not enough data
        const firstPoint = data[0].close;
        const lastPoint = data[data.length - 1].close;
        return lastPoint >= firstPoint ? '#22c55e' : '#ef4444'; // Green if up, red if down
    };

    // Calculate performance
    const getPerformance = () => {
        if (data.length < 2) return { value: 0, percent: 0 };
        const firstPoint = data[0].close;
        const lastPoint = data[data.length - 1].close;
        const diff = lastPoint - firstPoint;
        const percent = (diff / firstPoint) * 100;
        return { value: diff.toFixed(2), percent: percent.toFixed(2) };
    };

    const performance = getPerformance();
    const chartColor = getChartColor();
    const validIntervals = getValidIntervals();

    console.log(`Chart performance: ${performance.value}%`);

    // Current stock price from stockInfo or last data point
    const currentPrice = stockInfo?.regularMarketPrice ||
        (data.length > 0 ? data[data.length - 1].close : 0);

    // Current price change
    const priceChange = stockInfo?.regularMarketChange ||
        (data.length > 1 ? data[data.length - 1].close - data[0].close : 0);

    // Current percent change
    const percentChange = stockInfo?.regularMarketChangePercent ||
        (data.length > 1 ? ((data[data.length - 1].close - data[0].close) / data[0].close) * 100 : 0);

    return (
        <Card className="w-full h-full shadow-md">
            <CardHeader className="pb-0 pt-4">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl font-bold">{symbol}</CardTitle>
                        {stockInfo && (
                            <p className="text-sm text-gray-500">{stockInfo.shortName || stockInfo.longName}</p>
                        )}
                    </div>
                    <div className="text-right">
                        {!isLoading && (
                            <>
                                <p className="text-xl font-bold">${currentPrice.toFixed(2)}</p>
                                <div
                                    className={`text-sm flex items-center justify-end ${
                                        priceChange >= 0 ? 'text-green-500' : 'text-red-500'
                                    }`}
                                >
                                    {priceChange >= 0 ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                    <span>
                                        {priceChange >= 0 ? '+' : ''}
                                        {typeof priceChange === 'number' ? priceChange.toFixed(2) : priceChange}
                                        ({typeof percentChange === 'number' ? percentChange.toFixed(2) : percentChange}%)
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                <div className="flex space-x-2 mb-4">
                    <Select
                        value={period}
                        onValueChange={(value) => {
                            setPeriod(value);
                            // Reset interval to a valid one for this period
                            const validIntervals = getValidIntervals().map(i => i.value);
                            if (!validIntervals.includes(interval)) {
                                setInterval(validIntervals[0]);
                            }
                        }}
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            {periods.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={interval} onValueChange={setInterval}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Interval" />
                        </SelectTrigger>
                        <SelectContent>
                            {validIntervals.map((i) => (
                                <SelectItem key={i.value} value={i.value}>
                                    {i.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="price">Price</TabsTrigger>
                        <TabsTrigger value="volume">Volume</TabsTrigger>
                    </TabsList>

                    <TabsContent value="price" className="h-[300px]">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">Loading chart data...</div>
                        ) : error ? (
                            <div className="h-full flex items-center justify-center text-red-500">{error}</div>
                        ) : data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => {
                                            if (interval === '1d' || interval === '1wk' || interval === '1mo') {
                                                return format(new Date(value), 'MMM dd');
                                            }
                                            return format(new Date(value), 'HH:mm');
                                        }}
                                    />
                                    <YAxis domain={['auto', 'auto']} tickFormatter={(value) => `$${value.toFixed(2)}`} />
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <Tooltip
                                        formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                                        labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy HH:mm')}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="close"
                                        stroke={chartColor}
                                        fillOpacity={1}
                                        fill="url(#colorClose)"
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">No data available</div>
                        )}
                    </TabsContent>

                    <TabsContent value="volume" className="h-[300px]">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">Loading volume data...</div>
                        ) : error ? (
                            <div className="h-full flex items-center justify-center text-red-500">{error}</div>
                        ) : data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => {
                                            if (interval === '1d' || interval === '1wk' || interval === '1mo') {
                                                return format(new Date(value), 'MMM dd');
                                            }
                                            return format(new Date(value), 'HH:mm');
                                        }}
                                    />
                                    <YAxis
                                        domain={['auto', 'auto']}
                                        tickFormatter={(value) =>
                                            value >= 1000000
                                                ? `${(value / 1000000).toFixed(1)}M`
                                                : value >= 1000
                                                    ? `${(value / 1000).toFixed(1)}K`
                                                    : value
                                        }
                                    />
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <Tooltip
                                        formatter={(value: number) => [
                                            value >= 1000000
                                                ? `${(value / 1000000).toFixed(2)}M`
                                                : value >= 1000
                                                    ? `${(value / 1000).toFixed(2)}K`
                                                    : value,
                                            'Volume',
                                        ]}
                                        labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy HH:mm')}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="volume"
                                        stroke="#6366f1"
                                        fillOpacity={1}
                                        fill="url(#colorVolume)"
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">No volume data available</div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default StockChart;