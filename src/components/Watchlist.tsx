'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
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
import { Plus, Trash2, ChevronUp, ChevronDown, RefreshCw, Star, AlertTriangle, InfoIcon } from 'lucide-react';
import { stockService } from '@/services/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StockSearch from './StockSearch';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
    Alert,
    AlertTitle,
    AlertDescription,
} from '@/components/ui/alert';
import {
    ScrollArea,
    ScrollBar,
} from '@/components/ui/scroll-area';

interface WatchlistProps {
    userId: string;
}

interface WatchlistItem {
    id: string;
    name: string;
    stocks: StockItem[];
    createdAt: string;
    updatedAt: string;
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
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [stockToDelete, setStockToDelete] = useState<string | null>(null);
    const [listToDelete, setListToDelete] = useState<string | null>(null);
    const [, setError] = useState<string | null>(null);

    // Fetch user's watchlists
    useEffect(() => {
        const fetchWatchlists = async () => {
            setIsLoading(true);
            try {
                // Real API call to fetch watchlists
                const response = await axios.get('/api/watchlists');
                const data = response.data;

                setWatchlists(data);
                if (data.length > 0 && !activeWatchlist) {
                    setActiveWatchlist(data[0].id);
                }
            } catch (error) {
                console.error('Error fetching watchlists:', error);
                setError('Failed to load watchlists. Please try again later.');
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
    }, [userId, activeWatchlist]);

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

    const handleCreateWatchlist = async () => {
        if (!newWatchlistName.trim()) {
            toast.error('Error',{
                description: 'Please enter a watchlist name',
            });
            return;
        }

        try {
            // Create a new watchlist via API
            const response = await axios.post('/api/watchlists', {
                name: newWatchlistName
            });

            const newWatchlist = response.data.watchlist;

            setWatchlists(prev => [...prev, newWatchlist]);
            setActiveWatchlist(newWatchlist.id);
            setNewWatchlistName('');

            toast.success('Success',{
                description: `Watchlist "${newWatchlistName}" created`,
            });
        } catch (error) {
            console.error('Error creating watchlist:', error);
            toast.error('Error', {
                description: 'Failed to create watchlist'
            });
        }
    };

    const handleAddStock = async (symbol: string) => {
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

        try {
            // Add stock to watchlist via API
            await axios.post(`/api/watchlists/${activeWatchlist}/stocks`, {
                symbol: symbol.toUpperCase()
            });

            // Refresh watchlists to get updated data
            const response = await axios.get('/api/watchlists');
            setWatchlists(response.data);

            setIsAddingStock(false);
            toast.success('Success',{
                description: `Added ${symbol} to watchlist`,
            });
        } catch (error) {
            console.error('Error adding stock:', error);
            toast.error('Error', {
                description: 'Failed to add stock to watchlist'
            });
            setIsAddingStock(false);
        }
    };

    const handleRemoveStock = async (stockId: string) => {
        if (!activeWatchlist) return;

        try {
            // Remove stock from watchlist via API
            await axios.delete(`/api/watchlists/${activeWatchlist}/stocks/${stockId}`);

            // Update local state
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

            setStockToDelete(null);
            toast.success('Success',{
                description: 'Stock removed from watchlist'
            });
        } catch (error) {
            console.error('Error removing stock:', error);
            toast.error('Error', {
                description: 'Failed to remove stock from watchlist'
            });
        }
    };

    const handleDeleteWatchlist = async (watchlistId: string) => {
        try {
            // Delete watchlist via API
            await axios.delete(`/api/watchlists/${watchlistId}`);

            setListToDelete(null);
            setWatchlists(prev => prev.filter(list => list.id !== watchlistId));

            // If the deleted watchlist was active, select another one
            if (activeWatchlist === watchlistId) {
                const remaining = watchlists.filter(list => list.id !== watchlistId);
                setActiveWatchlist(remaining.length > 0 ? remaining[0].id : null);
            }

            toast.success('Success',{
                description: 'Watchlist deleted'
            });
        } catch (error) {
            console.error('Error deleting watchlist:', error);
            toast.error('Error', {
                description: 'Failed to delete watchlist'
            });
        }
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

    const currentWatchlist = watchlists.find(list => list.id === activeWatchlist);

    const renderLoadingSkeleton = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-9 w-28" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    );

    const formatVolume = (volume?: number) => {
        if (!volume) return '—';

        if (volume >= 1_000_000) {
            return `${(volume / 1_000_000).toFixed(2)}M`;
        } else if (volume >= 1_000) {
            return `${(volume / 1_000).toFixed(2)}K`;
        }

        return volume.toString();
    };

    return (
        <TooltipProvider>
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
                                    <DialogDescription>
                                        Enter a name for your new watchlist to keep track of stocks you&#39;re interested in.
                                    </DialogDescription>
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
                                <DialogFooter>
                                    <Button onClick={handleCreateWatchlist} disabled={!newWatchlistName.trim()}>
                                        Create Watchlist
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <CardDescription>
                        Track your favorite stocks
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {isLoading ? (
                        renderLoadingSkeleton()
                    ) : watchlists.length === 0 ? (
                        <div className="text-center py-8">
                            <Alert variant="default" className="max-w-md mx-auto mb-6">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>No Watchlists</AlertTitle>
                                <AlertDescription>You don&#39;t have any watchlists yet. Create your first one to start tracking stocks.</AlertDescription>
                            </Alert>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" /> Create your first watchlist
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create a new watchlist</DialogTitle>
                                        <DialogDescription>
                                            Enter a name for your first watchlist.
                                        </DialogDescription>
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
                                    <DialogFooter>
                                        <Button onClick={handleCreateWatchlist} disabled={!newWatchlistName.trim()}>
                                            Create Watchlist
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ) : (
                        <>
                            <ScrollArea className="w-full">
                                <Tabs value={activeWatchlist || ''} onValueChange={setActiveWatchlist} className="w-full">
                                    <TabsList className="flex grid-flow-col auto-cols-max gap-2 overflow-x-auto justify-start mb-4 w-full">
                                        {watchlists.map((list) => (
                                            <TabsTrigger key={list.id} value={list.id} className="flex items-center gap-2">
                                                <Star className="h-4 w-4" /> {list.name}
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 ml-1 text-muted-foreground"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setListToDelete(list.id);
                                                                setDeleteConfirmOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Delete watchlist</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    <ScrollBar orientation="horizontal" />

                                    {watchlists.map((list) => (
                                        <TabsContent key={list.id} value={list.id} className="mt-0">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-medium">{list.name}</h3>
                                                <div className="flex space-x-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleRefresh}
                                                                disabled={isRefreshing}
                                                            >
                                                                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                                                                Refresh
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Update stock prices</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Dialog open={isAddingStock} onOpenChange={setIsAddingStock}>
                                                        <DialogTrigger asChild>
                                                            <Button size="sm">
                                                                <Plus className="h-4 w-4 mr-1" /> Add Stock
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Add a stock to {list.name}</DialogTitle>
                                                                <DialogDescription>
                                                                    Search for a stock by name or symbol to add it to your watchlist.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="py-4">
                                                                <StockSearch onSelect={handleAddStock} />
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>

                                            {list.stocks.length === 0 ? (
                                                <Alert className="mb-4">
                                                    <InfoIcon className="h-4 w-4" />
                                                    <AlertTitle>Empty Watchlist</AlertTitle>
                                                    <AlertDescription>
                                                        No stocks in this watchlist yet. Click &#34;Add Stock&#34; to get started.
                                                    </AlertDescription>
                                                </Alert>
                                            ) : isRefreshing ? (
                                                <div className="space-y-2 py-4">
                                                    <Skeleton className="h-10 w-full" />
                                                    {list.stocks.map((_, index) => (
                                                        <Skeleton key={index} className="h-12 w-full" />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="rounded-md border overflow-hidden">
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
                                                                <TableRow
                                                                    key={stock.id}
                                                                    className="cursor-pointer hover:bg-muted/50"
                                                                    onClick={() => handleStockClick(stock.symbol)}
                                                                >
                                                                    <TableCell className="font-medium">
                                                                        <HoverCard>
                                                                            <HoverCardTrigger className="cursor-pointer">
                                                                                {stock.symbol}
                                                                            </HoverCardTrigger>
                                                                            <HoverCardContent className="w-80">
                                                                                <div className="flex justify-between">
                                                                                    <div>
                                                                                        <h4 className="font-bold">{stock.symbol}</h4>
                                                                                        <p className="text-sm text-muted-foreground mt-1">Click to view detailed stock data</p>
                                                                                    </div>
                                                                                    <Button variant="outline" size="sm" onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        router.push(`/stocks/${stock.symbol}`);
                                                                                    }}>
                                                                                        View Details
                                                                                    </Button>
                                                                                </div>
                                                                            </HoverCardContent>
                                                                        </HoverCard>
                                                                    </TableCell>
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
                                                                            <Badge variant={stock.percentChange >= 0 ? "default" : "destructive"} className="ml-auto">
                                                                                {stock.percentChange >= 0 ? (
                                                                                    <ChevronUp className="h-4 w-4 mr-1" />
                                                                                ) : (
                                                                                    <ChevronDown className="h-4 w-4 mr-1" />
                                                                                )}
                                                                                {Math.abs(stock.percentChange).toFixed(2)}%
                                                                            </Badge>
                                                                        ) : '—'}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        {formatVolume(stock.volume)}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="opacity-50 hover:opacity-100"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setStockToDelete(stock.id);
                                                                                        setDeleteConfirmOpen(true);
                                                                                    }}
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Remove from watchlist</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </ScrollArea>

                            {currentWatchlist && currentWatchlist.stocks.length > 0 && (
                                <div className="mt-6">
                                    <Separator className="my-2" />
                                    <div className="flex justify-between items-center py-2 text-sm text-muted-foreground">
                                        <span>Total stocks: {currentWatchlist.stocks.length}</span>
                                        <span>Last refreshed: {new Date().toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>

                {/* Confirmation Dialogs */}
                <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                                {stockToDelete
                                    ? "Are you sure you want to remove this stock from your watchlist?"
                                    : "Are you sure you want to delete this watchlist? This action cannot be undone."}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setDeleteConfirmOpen(false);
                                setStockToDelete(null);
                                setListToDelete(null);
                            }}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (stockToDelete) {
                                        handleRemoveStock(stockToDelete);
                                    } else if (listToDelete) {
                                        handleDeleteWatchlist(listToDelete);
                                    }
                                    setDeleteConfirmOpen(false);
                                }}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Card>
        </TooltipProvider>
    );
};

export default Watchlist;