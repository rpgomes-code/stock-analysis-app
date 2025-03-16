'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search as SearchIcon, XCircle, TrendingUp, Building2, Briefcase, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { stockService } from '@/services/api';

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [searchResults, setSearchResults] = useState<any | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('all');

    // Initialize recent searches from localStorage
    useEffect(() => {
        const storedSearches = localStorage.getItem('recentSearches');
        if (storedSearches) {
            try {
                const parsedSearches = JSON.parse(storedSearches);
                if (Array.isArray(parsedSearches)) {
                    setRecentSearches(parsedSearches);
                }
            } catch (e) {
                console.error('Error parsing recent searches from localStorage:', e);
            }
        }
    }, []);

    // Search on component mount if query provided in URL
    useEffect(() => {
        if (initialQuery) {
            performSearch(initialQuery);
        }
    }, [initialQuery]);

    // Perform the search
    const performSearch = async (query: string) => {
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            // Update URL to include search query
            router.push(`/search?q=${encodeURIComponent(query)}`);

            // This would be an API call in a real app
            // const results = await stockService.searchQuotes(query);

            // For demo, we'll simulate an API call with mock data
            await new Promise(resolve => setTimeout(resolve, 800));

            // Simulate search results based on the query
            const mockResults = {
                quotes: [
                    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', price: 187.48, change: 1.26, percentChange: 0.68 },
                    { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', price: 414.47, change: 3.21, percentChange: 0.78 },
                    { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', price: 147.68, change: 0.92, percentChange: 0.63 },
                    { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', price: 178.75, change: 1.87, percentChange: 1.06 },
                    { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', price: 878.37, change: -12.76, percentChange: -1.43 },
                ],
                sectors: [
                    { name: 'Technology', description: 'Tech companies', stockCount: 238 },
                    { name: 'Consumer Cyclical', description: 'Consumer discretionary goods', stockCount: 156 },
                    { name: 'Communication Services', description: 'Media and telecom companies', stockCount: 82 },
                ],
                news: [
                    { title: 'Tech Stocks Rally Despite Broader Market Uncertainty', date: '2024-03-15T18:30:00Z', source: 'MarketWatch' },
                    { title: 'Earnings Season Kicks Off with Strong Reports from Tech Giants', date: '2024-03-14T13:45:00Z', source: 'Bloomberg' },
                    { title: 'Investors Eye Upcoming Fed Decision as Markets Reach New Highs', date: '2024-03-13T21:20:00Z', source: 'Reuters' },
                ],
            };

            setSearchResults(mockResults);

            // Save search to recent searches
            saveToRecentSearches(query);
        } catch (err) {
            console.error('Error performing search:', err);
            setError('An error occurred while searching. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Save search query to recent searches
    const saveToRecentSearches = (query: string) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        // Add to recent searches (avoiding duplicates and limiting to 5)
        const updatedSearches = [
            trimmedQuery,
            ...recentSearches.filter(s => s !== trimmedQuery)
        ].slice(0, 5);

        setRecentSearches(updatedSearches);

        // Save to localStorage
        try {
            localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    };

    // Clear recent searches
    const clearRecentSearches = () => {
        setRecentSearches([]);
        try {
            localStorage.removeItem('recentSearches');
        } catch (e) {
            console.error('Error clearing localStorage:', e);
        }
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(searchQuery);
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    // Clear search input
    const handleClearInput = () => {
        setSearchQuery('');
        setSearchResults(null);
        router.push('/search');
    };

    // Handle recent search click
    const handleRecentSearchClick = (query: string) => {
        setSearchQuery(query);
        performSearch(query);
    };

    return (
        <div className="container max-w-screen-xl mx-auto p-6">
            <div className="flex flex-col gap-8">
                {/* Search header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center">
                        <SearchIcon className="mr-2 h-7 w-7" />
                        Stock Search
                    </h1>
                    <p className="text-muted-foreground">
                        Search for stocks, sectors, or recent market news
                    </p>
                </div>

                {/* Search form */}
                <div>
                    <form onSubmit={handleSubmit} className="relative">
                        <div className="flex gap-2">
                            <div className="relative flex-grow">
                                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by company name, ticker symbol, or sector..."
                                    className="pl-9 pr-10"
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={handleClearInput}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        <span className="sr-only">Clear</span>
                                    </button>
                                )}
                            </div>
                            <Button type="submit" disabled={!searchQuery.trim() || isLoading}>
                                {isLoading ? 'Searching...' : 'Search'}
                            </Button>
                        </div>
                    </form>

                    {/* Recent searches */}
                    {recentSearches.length > 0 && !searchResults && (
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-sm font-medium">Recent Searches</h2>
                                <Button variant="ghost" size="sm" onClick={clearRecentSearches}>
                                    Clear
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map((search, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-secondary"
                                        onClick={() => handleRecentSearchClick(search)}
                                    >
                                        {search}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Loading state */}
                {isLoading && (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-1/3" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Skeleton className="h-40" />
                            <Skeleton className="h-40" />
                            <Skeleton className="h-40" />
                        </div>
                        <Skeleton className="h-64" />
                    </div>
                )}

                {/* Search results */}
                {searchResults && !isLoading && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">
                            Search Results for &quot;{searchQuery}&quot;
                        </h2>

                        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                            <TabsList>
                                <TabsTrigger value="all">All Results</TabsTrigger>
                                <TabsTrigger value="stocks">Stocks</TabsTrigger>
                                <TabsTrigger value="sectors">Sectors</TabsTrigger>
                                <TabsTrigger value="news">News</TabsTrigger>
                            </TabsList>

                            {/* All Results Tab */}
                            <TabsContent value="all" className="space-y-8 pt-4">
                                {/* Stocks preview */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Stocks</h3>
                                        <Button variant="link" onClick={() => setActiveTab('stocks')} className="flex items-center text-muted-foreground">
                                            See All <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {searchResults.quotes.slice(0, 3).map((stock: any) => (
                                            <Link href={`/stocks/${stock.symbol}`} key={stock.symbol}>
                                                <Card className="h-full hover:shadow-md transition-shadow">
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold">{stock.symbol}</h4>
                                                                <p className="text-sm text-muted-foreground">{stock.name}</p>
                                                                <p className="text-xs text-muted-foreground mt-1">{stock.exchange}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold">${stock.price.toFixed(2)}</p>
                                                                <p className={`text-sm flex items-center justify-end ${stock.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                    {stock.percentChange >= 0 ? (
                                                                        <ArrowUp className="h-3 w-3 mr-1" />
                                                                    ) : (
                                                                        <ArrowDown className="h-3 w-3 mr-1" />
                                                                    )}
                                                                    {stock.percentChange >= 0 ? '+' : ''}{stock.percentChange.toFixed(2)}%
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Sectors preview */}
                                {searchResults.sectors.length > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold">Sectors</h3>
                                            <Button variant="link" onClick={() => setActiveTab('sectors')} className="flex items-center text-muted-foreground">
                                                See All <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {searchResults.sectors.slice(0, 3).map((sector: any, index: number) => (
                                                <Card key={index} className="hover:shadow-md transition-shadow h-full">
                                                    <CardContent className="p-4">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-start mb-2">
                                                                <Building2 className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                                                                <div>
                                                                    <h4 className="font-bold">{sector.name}</h4>
                                                                    <p className="text-sm text-muted-foreground">{sector.description}</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm">
                                                                <span className="font-medium">{sector.stockCount}</span> stocks in this sector
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* News preview */}
                                {searchResults.news.length > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold">News</h3>
                                            <Button variant="link" onClick={() => setActiveTab('news')} className="flex items-center text-muted-foreground">
                                                See All <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                        <Card>
                                            <CardContent className="p-4">
                                                <ul className="divide-y">
                                                    {searchResults.news.slice(0, 3).map((news: any, index: number) => (
                                                        <li key={index} className="py-3 first:pt-0 last:pb-0">
                                                            <h4 className="font-medium">{news.title}</h4>
                                                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                                <span>{news.source}</span>
                                                                <span className="mx-2">•</span>
                                                                <span>{new Date(news.date).toLocaleDateString()}</span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Stocks Tab */}
                            <TabsContent value="stocks" className="pt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Stocks</CardTitle>
                                        <CardDescription>
                                            Matching stocks for your search query
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="divide-y">
                                            {searchResults.quotes.map((stock: any) => (
                                                <Link
                                                    href={`/stocks/${stock.symbol}`}
                                                    key={stock.symbol}
                                                    className="block py-4 first:pt-0 hover:bg-muted/20 transition-colors rounded-sm px-2 -mx-2"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="flex items-center">
                                                                <div className="font-bold">{stock.symbol}</div>
                                                                <div className="text-sm text-muted-foreground ml-2">{stock.exchange}</div>
                                                            </div>
                                                            <div className="text-sm mt-0.5">{stock.name}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold">${stock.price.toFixed(2)}</div>
                                                            <div className={`text-sm flex items-center justify-end ${stock.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                {stock.percentChange >= 0 ? (
                                                                    <ArrowUp className="h-3 w-3 mr-1" />
                                                                ) : (
                                                                    <ArrowDown className="h-3 w-3 mr-1" />
                                                                )}
                                                                {stock.percentChange >= 0 ? '+' : ''}{stock.percentChange.toFixed(2)}%
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Sectors Tab */}
                            <TabsContent value="sectors" className="pt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Sectors</CardTitle>
                                        <CardDescription>
                                            Industry sectors related to your search
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {searchResults.sectors.map((sector: any, index: number) => (
                                                <Card key={index} className="hover:shadow-md transition-shadow">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start">
                                                            <Building2 className="h-5 w-5 mr-3 mt-0.5 text-primary" />
                                                            <div>
                                                                <h4 className="font-bold">{sector.name}</h4>
                                                                <p className="text-sm text-muted-foreground">{sector.description}</p>
                                                                <p className="text-sm mt-2">
                                                                    <span className="font-medium">{sector.stockCount}</span> stocks in this sector
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* News Tab */}
                            <TabsContent value="news" className="pt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Market News</CardTitle>
                                        <CardDescription>
                                            Recent news related to your search
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {searchResults.news.map((news: any, index: number) => (
                                                <div key={index} className="border-b pb-4 last:border-none last:pb-0">
                                                    <h4 className="font-medium text-lg">{news.title}</h4>
                                                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                        <span>{news.source}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>{new Date(news.date).toLocaleDateString()} {new Date(news.date).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}

                {/* Popular searches (show when no query) */}
                {!searchQuery && !searchResults && !isLoading && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">Popular Searches</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {['AAPL', 'TSLA', 'MSFT', 'NVDA', 'AMZN', 'GOOGL'].map((symbol) => (
                                <Card key={symbol} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRecentSearchClick(symbol)}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                                            <div>
                                                <h3 className="font-bold">{symbol}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {symbol === 'AAPL' && 'Apple Inc.'}
                                                    {symbol === 'TSLA' && 'Tesla Inc.'}
                                                    {symbol === 'MSFT' && 'Microsoft Corporation'}
                                                    {symbol === 'NVDA' && 'NVIDIA Corporation'}
                                                    {symbol === 'AMZN' && 'Amazon.com Inc.'}
                                                    {symbol === 'GOOGL' && 'Alphabet Inc.'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <h2 className="text-xl font-bold mt-8">Popular Sectors</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { name: 'Technology', description: 'Tech companies', count: 238 },
                                { name: 'Financial', description: 'Banks and financial services', count: 185 },
                                { name: 'Healthcare', description: 'Medical and health companies', count: 164 },
                            ].map((sector, index) => (
                                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRecentSearchClick(sector.name)}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start">
                                            <Building2 className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                                            <div>
                                                <h3 className="font-bold">{sector.name}</h3>
                                                <p className="text-sm text-muted-foreground">{sector.description}</p>
                                                <p className="text-sm mt-1">
                                                    <span className="font-medium">{sector.count}</span> companies
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}