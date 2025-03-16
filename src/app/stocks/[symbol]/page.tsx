import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Building, Plus, Star, Newspaper } from 'lucide-react';
import Link from 'next/link';
import StockChart from '@/components/StockChart';
import FinancialData from '@/components/FinancialData';
import { stockService } from '@/services/api';
import { getCurrentUser } from '@/lib/auth';

// Make this a server component that fetches data
async function getStockData(symbol: string) {
    try {
        const info = await stockService.getTickerInfo(symbol);

        if (!info || Object.keys(info).length === 0) {
            return null;
        }

        return {
            info,
            success: true
        };
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return {
            success: false,
            error
        };
    }
}

export default async function StockPage({ params }: { params: { symbol: string } }) {
    const { symbol } = params;
    const stockData = await getStockData(symbol);
    const user = await getCurrentUser();

    // If stock not found, return 404
    if (!stockData || !stockData.success) {
        notFound();
    }

    const info = stockData.info;

    return (
        <div className="container max-w-screen-xl mx-auto p-6">
            <div className="mb-6">
                <Link href="/" className="text-sm flex items-center hover:underline">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                </Link>
            </div>

            <div className="flex flex-col gap-8">
                {/* Stock Header */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center">
                            {symbol}
                            {info.shortName && (
                                <span className="text-xl text-muted-foreground ml-2">
                  - {info.shortName}
                </span>
                            )}
                        </h1>
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            <Building className="h-4 w-4 mr-1" />
                            <span>{info.exchange || 'Unknown Exchange'}</span>
                            {info.sector && (
                                <>
                                    <span className="mx-2">•</span>
                                    <span>{info.sector}</span>
                                </>
                            )}
                            {info.industry && (
                                <>
                                    <span className="mx-2">•</span>
                                    <span>{info.industry}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {user ? (
                            <Button variant="outline" className="flex items-center">
                                <Star className="h-4 w-4 mr-2" />
                                Add to Watchlist
                            </Button>
                        ) : (
                            <Link href="/auth/signin">
                                <Button variant="outline">Sign in to save</Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Chart and Data */}
                    <div className="md:col-span-2 space-y-8">
                        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                            <StockChart symbol={symbol} />
                        </Suspense>

                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid grid-cols-3 w-full md:w-[500px]">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="financials">Financials</TabsTrigger>
                                <TabsTrigger value="news">News</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6 pt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Company Profile</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm">
                                            {info.longBusinessSummary || 'No company description available.'}
                                        </p>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                            <StockMetric
                                                label="Market Cap"
                                                value={formatMetric(info.marketCap, 'currency')}
                                            />
                                            <StockMetric
                                                label="P/E Ratio"
                                                value={formatMetric(info.trailingPE)}
                                            />
                                            <StockMetric
                                                label="EPS (TTM)"
                                                value={formatMetric(info.trailingEps, 'currency')}
                                            />
                                            <StockMetric
                                                label="Dividend Yield"
                                                value={formatMetric(info.dividendYield, 'percent')}
                                            />
                                            <StockMetric
                                                label="52 Week High"
                                                value={formatMetric(info.fiftyTwoWeekHigh, 'currency')}
                                            />
                                            <StockMetric
                                                label="52 Week Low"
                                                value={formatMetric(info.fiftyTwoWeekLow, 'currency')}
                                            />
                                            <StockMetric
                                                label="Avg Volume"
                                                value={formatMetric(info.averageVolume)}
                                            />
                                            <StockMetric
                                                label="Beta"
                                                value={formatMetric(info.beta)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Key Statistics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            <div>
                                                <h3 className="font-semibold mb-2">Valuation</h3>
                                                <StatList>
                                                    <StatItem label="Market Cap" value={formatMetric(info.marketCap, 'currency')} />
                                                    <StatItem label="Enterprise Value" value={formatMetric(info.enterpriseValue, 'currency')} />
                                                    <StatItem label="Price to Sales" value={formatMetric(info.priceToSalesTrailing12Months)} />
                                                    <StatItem label="Price to Book" value={formatMetric(info.priceToBook)} />
                                                    <StatItem label="Enterprise to Revenue" value={formatMetric(info.enterpriseToRevenue)} />
                                                    <StatItem label="Enterprise to EBITDA" value={formatMetric(info.enterpriseToEbitda)} />
                                                </StatList>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold mb-2">Financial Metrics</h3>
                                                <StatList>
                                                    <StatItem label="Profit Margin" value={formatMetric(info.profitMargins, 'percent')} />
                                                    <StatItem label="Operating Margin" value={formatMetric(info.operatingMargins, 'percent')} />
                                                    <StatItem label="ROE" value={formatMetric(info.returnOnEquity, 'percent')} />
                                                    <StatItem label="ROA" value={formatMetric(info.returnOnAssets, 'percent')} />
                                                    <StatItem label="Revenue Growth" value={formatMetric(info.revenueGrowth, 'percent')} />
                                                    <StatItem label="Earnings Growth" value={formatMetric(info.earningsGrowth, 'percent')} />
                                                </StatList>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold mb-2">Share Statistics</h3>
                                                <StatList>
                                                    <StatItem label="Shares Outstanding" value={formatMetric(info.sharesOutstanding)} />
                                                    <StatItem label="Float" value={formatMetric(info.floatShares)} />
                                                    <StatItem label="% Held by Insiders" value={formatMetric(info.heldPercentInsiders, 'percent')} />
                                                    <StatItem label="% Held by Institutions" value={formatMetric(info.heldPercentInstitutions, 'percent')} />
                                                    <StatItem label="Short % of Float" value={formatMetric(info.shortPercentOfFloat, 'percent')} />
                                                    <StatItem label="Short Ratio" value={formatMetric(info.shortRatio)} />
                                                </StatList>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="financials" className="pt-4">
                                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                                    <FinancialData symbol={symbol} />
                                </Suspense>
                            </TabsContent>

                            <TabsContent value="news" className="pt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Newspaper className="mr-2 h-5 w-5" />
                                            Latest News
                                        </CardTitle>
                                        <CardDescription>
                                            Recent news and press releases about {info.shortName || symbol}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Suspense fallback={<NewsItemSkeleton count={3} />}>
                                            <NewsItems symbol={symbol} />
                                        </Suspense>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Trading Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Previous Close</p>
                                        <p className="text-xl font-bold">${info.regularMarketPreviousClose?.toFixed(2) || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Open</p>
                                        <p className="text-xl font-bold">${info.regularMarketOpen?.toFixed(2) || '—'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Day Range</p>
                                            <p className="font-semibold">
                                                ${info.regularMarketDayLow?.toFixed(2) || '—'} - ${info.regularMarketDayHigh?.toFixed(2) || '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">52W Range</p>
                                            <p className="font-semibold">
                                                ${info.fiftyTwoWeekLow?.toFixed(2) || '—'} - ${info.fiftyTwoWeekHigh?.toFixed(2) || '—'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Volume</p>
                                            <p className="font-semibold">
                                                {formatNumber(info.regularMarketVolume)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Avg. Volume</p>
                                            <p className="font-semibold">
                                                {formatNumber(info.averageVolume)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Key Dates</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Next Earnings Date</p>
                                        <p className="font-semibold">
                                            {info.earningsTimestamp ? new Date(info.earningsTimestamp * 1000).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Ex-Dividend Date</p>
                                        <p className="font-semibold">
                                            {info.exDividendDate ? new Date(info.exDividendDate * 1000).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Dividend Payment Date</p>
                                        <p className="font-semibold">
                                            {info.dividendDate ? new Date(info.dividendDate * 1000).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Analyst Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-muted-foreground">Target Price</p>
                                        <p className="font-bold">
                                            ${info.targetMeanPrice?.toFixed(2) || '—'}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-muted-foreground">Recommendation</p>
                                        <p className="font-bold">
                                            {getRecommendation(info.recommendationMean)}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-muted-foreground">No. of Analysts</p>
                                        <p className="font-bold">
                                            {info.numberOfAnalystOpinions || '—'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper components
const StockMetric = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
    </div>
);

const StatList = ({ children }: { children: React.ReactNode }) => (
    <dl className="space-y-1 text-sm">
        {children}
    </dl>
);

const StatItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between">
        <dt className="text-muted-foreground">{label}</dt>
        <dd className="font-medium">{value}</dd>
    </div>
);

// Get news items for a stock
async function NewsItems({ symbol }: { symbol: string }) {
    try {
        const news = await stockService.getTickerNews(symbol);

        if (!news || news.length === 0) {
            return (
                <div className="py-4 text-center">
                    <p className="text-muted-foreground">No recent news available</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {news.slice(0, 5).map((item: any, index: number) => (
                    <a
                        key={index}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                    >
                        <div className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors">
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{item.publisher}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                {new Date(item.providerPublishTime * 1000).toLocaleString()}
                            </p>
                        </div>
                    </a>
                ))}
                <div className="pt-2">
                    <a
                        href={`https://finance.yahoo.com/quote/${symbol}/news`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center"
                    >
                        More news <ChevronLeft className="h-4 w-4 rotate-180 ml-1" />
                    </a>
                </div>
            </div>
        );
    } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error);
        return (
            <div className="py-4 text-center">
                <p className="text-muted-foreground">Failed to load news</p>
            </div>
        );
    }
}

const NewsItemSkeleton = ({ count = 3 }: { count?: number }) => (
    <div className="space-y-4">
        {Array(count).fill(0).map((_, i) => (
            <div key={i} className="p-4 rounded-lg border">
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-3 w-1/4" />
            </div>
        ))}
    </div>
);

// Helpers for formatting
function formatMetric(value: any, type: 'currency' | 'percent' | 'default' = 'default'): string {
    if (value === undefined || value === null) return '—';

    if (type === 'currency') {
        return formatCurrency(value);
    }

    if (type === 'percent') {
        return formatPercent(value);
    }

    // For numeric values, format based on size
    if (typeof value === 'number') {
        return formatNumber(value);
    }

    return String(value);
}

function formatCurrency(value: number): string {
    if (value >= 1e12) {
        return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
        return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
        return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
        return `$${(value / 1e3).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
}

function formatPercent(value: number): string {
    if (value === 0) return '0%';

    // Convert decimal to percentage (e.g., 0.15 -> 15%)
    const percentValue = value < 1 ? value * 100 : value;
    return `${percentValue.toFixed(2)}%`;
}

function formatNumber(value: number): string {
    if (value >= 1e12) {
        return `${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
        return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
        return `${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
        return `${(value / 1e3).toFixed(2)}K`;
    }
    return value.toFixed(2);
}

function getRecommendation(value: number | undefined): string {
    if (value === undefined) return 'N/A';

    if (value <= 1.5) return 'Strong Buy';
    if (value <= 2.5) return 'Buy';
    if (value <= 3.5) return 'Hold';
    if (value <= 4.5) return 'Sell';
    return 'Strong Sell';
}