'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Generate mock data for charts since we can't always fetch real data
const generateMockData = (days: number, startValue: number, volatility: number = 0.01) => {
    const data = [];
    let currentValue = startValue;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        // Add some random daily volatility
        const change = currentValue * (Math.random() * volatility * 2 - volatility);

        // Add a slight trend upward
        const trend = 1 + (Math.random() * 0.001);

        currentValue += change;
        currentValue *= trend;

        // Format to 2 decimal places
        currentValue = Math.round(currentValue * 100) / 100;

        data.push({
            date: format(date, 'yyyy-MM-dd'),
            value: currentValue
        });
    }

    return data;
};

interface MarketChartProps {
    symbol: string;
    name: string;
}

export default function MarketChart({ symbol, name }: MarketChartProps) {
    const [period, setPeriod] = useState('1m');
    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMarketData = async () => {
            setIsLoading(true);
            try {
                // In a real app, this would be an API call
                // const data = await stockService.getTickerHistory(symbol, {
                //   period,
                //   interval: period === '1d' ? '5m' : period === '5d' ? '1h' : '1d'
                // });

                // For demo, generate mock data based on the period
                let days = 30;
                switch (period) {
                    case '1d':
                        days = 1;
                        break;
                    case '5d':
                        days = 5;
                        break;
                    case '1m':
                        days = 30;
                        break;
                    case '3m':
                        days = 90;
                        break;
                    case '6m':
                        days = 180;
                        break;
                    case '1y':
                        days = 365;
                        break;
                    case '5y':
                        days = 365 * 5;
                        break;
                }

                // Generate mock data
                // For S&P 500, use a realistic starting value
                const mockData = generateMockData(days,
                    symbol === '^GSPC' ? 5000 : 100, // S&P 500 around 5000, others use 100 as base
                    0.008 // volatility
                );

                setChartData(mockData);
            } catch (error) {
                console.error(`Error fetching data for ${symbol}:`, error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMarketData();
    }, [symbol, period]);

    // Format numbers for the tooltip
    const formatValue = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
        }).format(value);
    };

    // Calculate change and percent change
    const calculateChanges = () => {
        if (chartData.length < 2) return { change: 0, percentChange: 0 };

        const firstValue = chartData[0].value;
        const lastValue = chartData[chartData.length - 1].value;

        const change = lastValue - firstValue;
        const percentChange = (change / firstValue) * 100;

        return {
            change: change.toFixed(2),
            percentChange: percentChange.toFixed(2)
        };
    };

    const changes = calculateChanges();
    const isPositive = parseFloat(changes.change) >= 0;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>{name} Chart</CardTitle>
                        <CardDescription>Historical performance</CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant={period === '1d' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('1d')}
                        >
                            1D
                        </Button>
                        <Button
                            variant={period === '5d' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('5d')}
                        >
                            5D
                        </Button>
                        <Button
                            variant={period === '1m' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('1m')}
                        >
                            1M
                        </Button>
                        <Button
                            variant={period === '3m' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('3m')}
                        >
                            3M
                        </Button>
                        <Button
                            variant={period === '6m' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('6m')}
                        >
                            6M
                        </Button>
                        <Button
                            variant={period === '1y' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('1y')}
                        >
                            1Y
                        </Button>
                        <Button
                            variant={period === '5y' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod('5y')}
                        >
                            5Y
                        </Button>
                    </div>
                </div>

                {/* Price and change info */}
                <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {chartData.length > 0 && formatValue(chartData[chartData.length - 1].value)}
          </span>
                    <span className={`${isPositive ? 'text-green-500' : 'text-red-500'} text-sm font-medium`}>
            {isPositive ? '+' : ''}{changes.change} ({isPositive ? '+' : ''}{changes.percentChange}%)
          </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => {
                                    if (period === '1d') {
                                        return format(new Date(date), 'HH:mm');
                                    } else if (period === '5d') {
                                        return format(new Date(date), 'EEE');
                                    } else if (period === '1m') {
                                        return format(new Date(date), 'dd MMM');
                                    } else {
                                        return format(new Date(date), 'MMM yy');
                                    }
                                }}
                                minTickGap={20}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                tickFormatter={(value) => formatValue(value)}
                            />
                            <Tooltip
                                formatter={(value: number) => [formatValue(value), 'Value']}
                                labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={isPositive ? '#22c55e' : '#ef4444'}
                                fill={isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}