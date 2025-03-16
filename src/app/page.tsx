import { Suspense } from 'react';
import Link from 'next/link';
import StockSearch from '@/components/StockSearch';
import Watchlist from '@/components/Watchlist';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableIcon, LineChart, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
      <div className="container max-w-screen-xl mx-auto p-6">
        <div className="flex flex-col gap-8">
          {/* Hero Section */}
          <section className="py-12 md:py-16">
            <div className="flex flex-col items-center text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold">
                Stock Analysis Made Simple
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Track, analyze, and research stocks with real-time data and powerful visualization tools.
              </p>
              <div className="w-full max-w-md">
                <StockSearch
                    onSelect={(symbol) => {
                      window.location.href = `/stocks/${symbol}`;
                    }}
                />
              </div>
            </div>
          </section>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Left sidebar with watchlist */}
            <div className="md:col-span-1">
              <Suspense fallback={<WatchlistSkeleton />}>
                {user ? (
                    <Watchlist userId={user.id} />
                ) : (
                    <Card className="shadow-md">
                      <CardHeader>
                        <CardTitle>Watchlists</CardTitle>
                        <CardDescription>
                          Sign in to create and manage your watchlists
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center py-8">
                        <Link href="/auth/signin">
                          <Button>Sign In</Button>
                        </Link>
                      </CardContent>
                    </Card>
                )}
              </Suspense>
            </div>

            {/* Main content area */}
            <div className="md:col-span-3 space-y-6">
              {/* Market Overview */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Market Overview
                  </CardTitle>
                  <CardDescription>
                    Latest market trends and indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="us" className="w-full">
                    <TabsList className="grid grid-cols-3 w-[400px]">
                      <TabsTrigger value="us">US Markets</TabsTrigger>
                      <TabsTrigger value="global">Global</TabsTrigger>
                      <TabsTrigger value="crypto">Crypto</TabsTrigger>
                    </TabsList>
                    <TabsContent value="us" className="space-y-4 pt-4">
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
                            title="DOW"
                            value="38,654.89"
                            change="+0.32%"
                            isPositive={true}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Link href="/markets">
                          <Button variant="link" className="flex items-center">
                            More market data <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TabsContent>
                    <TabsContent value="global" className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MarketSummaryCard
                            title="FTSE 100"
                            value="7,648.98"
                            change="-0.21%"
                            isPositive={false}
                        />
                        <MarketSummaryCard
                            title="NIKKEI 225"
                            value="39,098.68"
                            change="+1.12%"
                            isPositive={true}
                        />
                        <MarketSummaryCard
                            title="DAX"
                            value="17,842.92"
                            change="+0.43%"
                            isPositive={true}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="crypto" className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MarketSummaryCard
                            title="Bitcoin"
                            value="61,234.78"
                            change="+2.34%"
                            isPositive={true}
                        />
                        <MarketSummaryCard
                            title="Ethereum"
                            value="3,452.19"
                            change="+1.87%"
                            isPositive={true}
                        />
                        <MarketSummaryCard
                            title="Solana"
                            value="132.45"
                            change="+5.68%"
                            isPositive={true}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Popular Stocks */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="mr-2 h-5 w-5" />
                    Trending Stocks
                  </CardTitle>
                  <CardDescription>
                    Most active stocks in the market today
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* Features Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FeatureCard
                    icon={<LineChart className="h-8 w-8" />}
                    title="Advanced Charts"
                    description="Interactive charts with technical indicators"
                    href="/features/charts"
                />
                <FeatureCard
                    icon={<TableIcon className="h-8 w-8" />}
                    title="Financial Data"
                    description="Detailed financial statements and ratios"
                    href="/features/financials"
                />
                <FeatureCard
                    icon={<TrendingUp className="h-8 w-8" />}
                    title="Portfolio Tracking"
                    description="Track performance of your investments"
                    href="/features/portfolio"
                />
              </div>
            </div>
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
            {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" />}
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

const FeatureCard = ({ icon, title, description, href }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) => (
    <Link href={href} className="block">
      <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-2 rounded-full bg-primary/10">{icon}</div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
);

const WatchlistSkeleton = () => (
    <Card className="shadow-md">
      <CardHeader>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
);