import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronUp, ChevronDown, RefreshCw, Star } from 'lucide-react';
import { stockService } from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StockSearch from './StockSearch';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WatchlistProps {
    userId: string;
}

interface WatchlistItem {
    id: string;
    name: string;
    stocks: StockItem[];
}

interface StockItem {
    id: string;
    symbol: string;
    currentPrice?: number;
    priceChange?: number;
    percentChange?: number;
    volume?: number;
}

const Watchlist: React.FC<WatchlistProps> = ({ userId }) => {
    const router = useRouter();
    const [watchlists, setWatchlists] = useState<WatchlistItem[]>([]);
    const [activeWatchlist, setActiveWatchlist] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [newWatchlistName, setNewWatchlistName] = useState('');
    const [isAddingStock, setIsAddingStock] = useState(false);

    // Fetch user's watchlists
    useEffect(() => {
        const fetchWatchlists = async () => {
            setIsLoading(true);
            try {
                // This would typically be an API call to your backend
                // For now, we'll mock some data
                const mockWatchlists = [
                    {
                        id: '1',
                        name: 'Tech Stocks',
                        stocks: [
                            { id: '1', symbol: 'AAPL' },
                            { id: '2', symbol: 'MSFT' },
                            { id: '3', symbol: 'GOOGL' },
                        ],
                    },
                    {
                        id: '2',
                        name: 'Energy Stocks',
                        stocks: [
                            { id: '4', symbol: 'XOM' },
                            { id: '5', symbol: 'CVX' },
                        ],
                    },
                ];

                setWatchlists(mockWatchlists);
                if (mockWatchlists.length > 0 && !activeWatchlist) {
                    setActiveWatchlist(mockWatchlists[0].id);
                }
            } catch (error) {
                console.error('Error fetching watchlists:', error);
                toast.error('Error',{
                    description: 'Failed to load watchlists',
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchWatchlists().then(() => {});
        }
    }, [userId]);

    // Get current stock data for the active watchlist
    useEffect(() => {
        const fetchStockData = async () => {
            if (!activeWatchlist) return;

            const watchlist = watchlists.find(w => w.id === activeWatchlist);
            if (!watchlist || watchlist.stocks.length === 0) return;

            setIsRefreshing(true);
            try {
                // Get symbols for the current watchlist
                const symbols = watchlist.stocks.map(stock => stock.symbol);

                // Fetch multi-ticker data
                const tickerData = await stockService.getMultiTicker(symbols);

                // Update watchlist with current prices
                setWatchlists(prev =>
                    prev.map(list => {
                        if (list.id === activeWatchlist) {
                            return {
                                ...list,
                                stocks: list.stocks.map(stock => {
                                    const data = tickerData[stock.symbol];
                                    return {
                                        ...stock,
                                        currentPrice: data?.regularMarketPrice || data?.currentPrice,
                                        priceChange: data?.regularMarketChange || data?.regularMarketDayHigh - data?.regularMarketDayLow,
                                        percentChange: data?.regularMarketChangePercent || data?.regularMarketPercentChange,
                                        volume: data?.regularMarketVolume || data?.volume,
                                    };
                                }),
                            };
                        }
                        return list;
                    })
                );
            } catch (error) {
                console.error('Error fetching stock data:', error);
                toast.error('Error',{
                    description: 'Failed to update stock prices',
                });
            } finally {
                setIsRefreshing(false);
            }
        };

        fetchStockData().then(() => {});
    }, [activeWatchlist, watchlists]);

    const handleCreateWatchlist = () => {
        if (!newWatchlistName.trim()) {
            toast.error('Error',{
                description: 'Please enter a watchlist name',
            });
            return;
        }

        // Create a new watchlist (in a real app, this would be an API call)
        const newWatchlist = {
            id: Date.now().toString(),
            name: newWatchlistName,
            stocks: [],
        };

        setWatchlists([...watchlists, newWatchlist]);
        setActiveWatchlist(newWatchlist.id);
        setNewWatchlistName('');

        toast.success('Success',{
            description: `Watchlist "${newWatchlistName}" created`,
        });
    };

    const handleAddStock = (symbol: string) => {
        if (!activeWatchlist) return;

        // Check if the stock is already in the watchlist
        const watchlist = watchlists.find(w => w.id === activeWatchlist);
        if (watchlist?.stocks.some(s => s.symbol.toUpperCase() === symbol.toUpperCase())) {
            toast.info('Info',{
                description: `${symbol} is already in this watchlist`,
            });

            setIsAddingStock(false);
            return;
        }

        // Add the stock to the watchlist
        setWatchlists(prev =>
            prev.map(list => {
                if (list.id === activeWatchlist) {
                    return {
                        ...list,
                        stocks: [
                            ...list.stocks,
                            { id: Date.now().toString(), symbol: symbol.toUpperCase() }
                        ],
                    };
                }
                return list;
            })
        );

        setIsAddingStock(false);

        toast.success('Success',{
            description: `Added ${symbol} to watchlist`,
        });
    };

    const handleRemoveStock = (stockId: string) => {
        if (!activeWatchlist) return;

        setWatchlists(prev =>
            prev.map(list => {
                if (list.id === activeWatchlist) {
                    return {
                        ...list,
                        stocks: list.stocks.filter(stock => stock.id !== stockId),
                    };
                }
                return list;
            })
        );

        toast.success('Success',{
            description: 'Stock removed from watchlist'
        });
    };

    const handleDeleteWatchlist = (watchlistId: string) => {
        setWatchlists(prev => prev.filter(list => list.id !== watchlistId));

        // If the deleted watchlist was active, select another one
        if (activeWatchlist === watchlistId) {
            const remaining = watchlists.filter(list => list.id !== watchlistId);
            setActiveWatchlist(remaining.length > 0 ? remaining[0].id : null);
        }

        toast.success('Success',{
            description: 'Watchlist deleted'
        });
    };

    const handleRefresh = () => {
        // This will trigger the useEffect to refetch stock data
        const current = activeWatchlist;
        setActiveWatchlist(null);
        setTimeout(() => setActiveWatchlist(current), 100);
    };

    const handleStockClick = (symbol: string) => {
        router.push(`/stocks/${symbol}`);
    };
    watchlists.find(list => list.id === activeWatchlist);
    return (
        <Card className="w-full shadow-md">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle>Watchlists</CardTitle>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-1" /> New List
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create a new watchlist</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={newWatchlistName}
                                        onChange={(e) => setNewWatchlistName(e.target.value)}
                                        className="col-span-3"
                                        placeholder="My Watchlist"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleCreateWatchlist}>Create Watchlist</Button>
                        </DialogContent>
                    </Dialog>
                </div>
                <CardDescription>
                    Track your favorite stocks
                </CardDescription>
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">Loading watchlists...</div>
                ) : watchlists.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">You don&#39;t have any watchlists yet</p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" /> Create your first watchlist
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create a new watchlist</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={newWatchlistName}
                                            onChange={(e) => setNewWatchlistName(e.target.value)}
                                            className="col-span-3"
                                            placeholder="My Watchlist"
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleCreateWatchlist}>Create Watchlist</Button>
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : (
                    <>
                        <Tabs value={activeWatchlist || ''} onValueChange={setActiveWatchlist} className="w-full">
                            <TabsList className="grid grid-flow-col auto-cols-max gap-2 overflow-x-auto justify-start mb-4 w-full">
                                {watchlists.map((list) => (
                                    <TabsTrigger key={list.id} value={list.id} className="flex items-center gap-2">
                                        <Star className="h-4 w-4" /> {list.name}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 ml-1 text-muted-foreground"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteWatchlist(list.id);
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {watchlists.map((list) => (
                                <TabsContent key={list.id} value={list.id} className="mt-0">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium">{list.name}</h3>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRefresh}
                                                disabled={isRefreshing}
                                            >
                                                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                                                Refresh
                                            </Button>
                                            <Dialog open={isAddingStock} onOpenChange={setIsAddingStock}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm">
                                                        <Plus className="h-4 w-4 mr-1" /> Add Stock
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Add a stock to {list.name}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="py-4">
                                                        <StockSearch onSelect={handleAddStock} />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>

                                    {list.stocks.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground mb-4">No stocks in this watchlist yet</p>
                                            <Button onClick={() => setIsAddingStock(true)}>
                                                <Plus className="h-4 w-4 mr-2" /> Add your first stock
                                            </Button>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Symbol</TableHead>
                                                    <TableHead className="text-right">Price</TableHead>
                                                    <TableHead className="text-right">Change</TableHead>
                                                    <TableHead className="text-right">% Change</TableHead>
                                                    <TableHead className="text-right">Volume</TableHead>
                                                    <TableHead></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {list.stocks.map((stock) => (
                                                    <TableRow key={stock.id} className="cursor-pointer" onClick={() => handleStockClick(stock.symbol)}>
                                                        <TableCell className="font-medium">{stock.symbol}</TableCell>
                                                        <TableCell className="text-right">
                                                            ${stock.currentPrice?.toFixed(2) || '—'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {stock.priceChange ? (
                                                                <span className={stock.priceChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                                  {stock.priceChange >= 0 ? '+' : ''}
                                                                    {stock.priceChange.toFixed(2)}
                                </span>
                                                            ) : '—'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {stock.percentChange ? (
                                                                <span className={stock.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                                  {stock.percentChange >= 0 ? (
                                      <ChevronUp className="h-4 w-4 inline" />
                                  ) : (
                                      <ChevronDown className="h-4 w-4 inline" />
                                  )}
                                                                    {Math.abs(stock.percentChange).toFixed(2)}%
                                </span>
                                                            ) : '—'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {stock.volume ? (
                                                                stock.volume >= 1000000 ?
                                                                    `${(stock.volume / 1000000).toFixed(2)}M` :
                                                                    stock.volume >= 1000 ?
                                                                        `${(stock.volume / 1000).toFixed(2)}K` :
                                                                        stock.volume
                                                            ) : '—'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="opacity-50 hover:opacity-100"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveStock(stock.id);
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default Watchlist;