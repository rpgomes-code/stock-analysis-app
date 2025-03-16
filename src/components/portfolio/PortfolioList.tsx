'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
    Briefcase,
    Pencil,
    Trash2,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    CircleDollarSign,
    CalendarClock,
    AlertTriangle,
    Plus
} from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { stockService } from '@/services/api';

interface PortfolioListProps {
    userId: string;
}

interface Portfolio {
    id: string;
    name: string;
    description?: string;
    initialInvestment: number;
    userId: string;
    stocks: Stock[];
    createdAt: string;
    updatedAt: string;
    totalValue?: number;
    returnAmount?: number;
    returnPercent?: number;
    dailyChange?: number;
    dailyChangePercent?: number;
}

interface Stock {
    id: string;
    symbol: string;
    [key: string]: any;
}

export default function PortfolioList({ userId }: PortfolioListProps) {
    const router = useRouter();
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [portfolioToDelete, setPortfolioToDelete] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRenamingPortfolio, setIsRenamingPortfolio] = useState<string | null>(null);
    const [newPortfolioName, setNewPortfolioName] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);

    // Fetch user's portfolios on component mount
    useEffect(() => {
        const fetchPortfolios = async () => {
            setIsLoading(true);
            try {
                // Fetch portfolios from the API
                const response = await axios.get('/api/portfolios');
                const portfoliosData = response.data;

                if (!portfoliosData || portfoliosData.length === 0) {
                    setPortfolios([]);
                    setIsLoading(false);
                    return;
                }

                // Fetch current prices for stocks in all portfolios
                const allStockSymbols = new Set<string>();
                portfoliosData.forEach((portfolio: Portfolio) => {
                    portfolio.stocks.forEach((stock: Stock) => {
                        allStockSymbols.add(stock.symbol);
                    });
                });

                const symbols = Array.from(allStockSymbols);
                const stocksData = symbols.length > 0 ?
                    await stockService.getMultiTicker(symbols) :
                    {};

                // Calculate portfolio values and returns
                const enrichedPortfolios = await Promise.all(portfoliosData.map(async (portfolio: Portfolio) => {
                    // For each portfolio, we need to get transactions to calculate average cost
                    let transactions = [];
                    try {
                        const transactionsResponse = await axios.get(`/api/portfolios/${portfolio.id}/transactions`);
                        transactions = transactionsResponse.data;
                    } catch (err) {
                        console.error(`Error fetching transactions for portfolio ${portfolio.id}:`, err);
                        transactions = [];
                    }

                    // Calculate portfolio value and metrics
                    let totalValue = 0;
                    let dailyChange = 0;

                    portfolio.stocks.forEach((stock: Stock) => {
                        const stockData = stocksData[stock.symbol];
                        if (!stockData) return;

                        // Calculate shares and cost basis from transactions
                        let totalShares = 0;
                        let totalCost = 0;

                        transactions
                            .filter((t: any) => t.stockSymbol === stock.symbol)
                            .forEach((transaction: any) => {
                                if (transaction.type === 'BUY') {
                                    totalShares += transaction.quantity;
                                    totalCost += transaction.quantity * transaction.price;
                                } else if (transaction.type === 'SELL') {
                                    totalShares -= transaction.quantity;
                                }
                            });

                        if (totalShares <= 0) return; // Skip if no shares

                        const stockValue = totalShares * (stockData.regularMarketPrice || 0);
                        totalValue += stockValue;

                        // Calculate daily change contribution
                        dailyChange += (stockData.regularMarketChange || 0) * totalShares;
                    });

                    const initialInvestment = portfolio.initialInvestment || 0;
                    const returnAmount = totalValue - initialInvestment;
                    const returnPercent = initialInvestment > 0 ? (returnAmount / initialInvestment) * 100 : 0;
                    const dailyChangePercent = totalValue > 0 ? (dailyChange / totalValue) * 100 : 0;

                    return {
                        ...portfolio,
                        totalValue,
                        returnAmount,
                        returnPercent,
                        dailyChange,
                        dailyChangePercent
                    };
                }));

                setPortfolios(enrichedPortfolios);
            } catch (err) {
                console.error('Error fetching portfolios:', err);
                setError('Failed to load portfolios. Please try again later.');
                toast.error('Error', {
                    description: 'Failed to load portfolios'
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchPortfolios().then(() => {});
        }
    }, [userId]);

    // Handle portfolio deletion
    const handleDeletePortfolio = async () => {
        if (!portfolioToDelete) return;

        setIsDeleting(true);
        try {
            // Call API to delete portfolio
            await axios.delete(`/api/portfolios/${portfolioToDelete}`);

            // Update local state to remove the deleted portfolio
            setPortfolios(prevPortfolios =>
                prevPortfolios.filter(p => p.id !== portfolioToDelete)
            );

            setIsDeleteDialogOpen(false);
            setPortfolioToDelete(null);

            toast.success('Success', {
                description: 'Portfolio deleted successfully'
            });
        } catch (err) {
            console.error('Error deleting portfolio:', err);
            toast.error('Error', {
                description: 'Failed to delete portfolio. Please try again.'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle portfolio renaming
    const handleRenamePortfolio = async () => {
        if (!isRenamingPortfolio || !newPortfolioName.trim()) return;

        setIsRenaming(true);
        try {
            // Call API to update portfolio name
            await axios.put(`/api/portfolios/${isRenamingPortfolio}`, {
                name: newPortfolioName
            });

            // Update local state with the new name
            setPortfolios(prevPortfolios =>
                prevPortfolios.map(p =>
                    p.id === isRenamingPortfolio
                        ? { ...p, name: newPortfolioName }
                        : p
                )
            );

            setIsRenamingPortfolio(null);
            setNewPortfolioName('');

            toast.success('Success', {
                description: 'Portfolio renamed successfully'
            });
        } catch (err) {
            console.error('Error renaming portfolio:', err);
            toast.error('Error', {
                description: 'Failed to rename portfolio. Please try again.'
            });
        } finally {
            setIsRenaming(false);
        }
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="w-full">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-72" />
                        </CardHeader>
                        <CardContent className="pb-2">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-9 w-24" />
                        </CardFooter>
                    </Card>
                ))}
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

    // Render empty state
    if (portfolios.length === 0) {
        return (
            <Card className="w-full">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No Portfolios Yet</h2>
                    <p className="text-muted-foreground max-w-md mb-6">
                        Create your first portfolio to start tracking your investments and analyzing performance.
                    </p>
                    <Button asChild>
                        <Link href="/portfolio/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Your First Portfolio
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Portfolios list */}
            <div className="space-y-4">
                {portfolios.map((portfolio) => (
                    <Card key={portfolio.id} className="w-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex justify-between items-center">
                                {isRenamingPortfolio === portfolio.id ? (
                                    <div className="flex items-center space-x-2 w-full">
                                        <Input
                                            value={newPortfolioName}
                                            onChange={(e) => setNewPortfolioName(e.target.value)}
                                            placeholder="Portfolio name"
                                            className="max-w-sm"
                                            autoFocus
                                        />
                                        <Button
                                            size="sm"
                                            onClick={handleRenamePortfolio}
                                            disabled={isRenaming || !newPortfolioName.trim()}
                                        >
                                            {isRenaming ? 'Saving...' : 'Save'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setIsRenamingPortfolio(null);
                                                setNewPortfolioName('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="flex items-center">
                                          <Briefcase className="h-5 w-5 mr-2" />
                                            {portfolio.name}
                                        </span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical">
                                                        <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                                                    </svg>
                                                    <span className="sr-only">More</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setIsRenamingPortfolio(portfolio.id);
                                                        setNewPortfolioName(portfolio.name);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => {
                                                        setPortfolioToDelete(portfolio.id);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </>
                                )}
                            </CardTitle>
                            <CardDescription>
                                {portfolio.description || `Created ${format(new Date(portfolio.createdAt), 'MMMM d, yyyy')}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="flex flex-col">
                                  <span className="text-xs text-muted-foreground mb-1 flex items-center">
                                    <CircleDollarSign className="h-3 w-3 mr-1" />
                                    Value
                                  </span>
                                    <span className="text-lg font-semibold">
                                        ${(portfolio.totalValue || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </span>
                                    <span className="text-xs text-muted-foreground mt-1">
                                        {portfolio.stocks.length} {portfolio.stocks.length === 1 ? 'stock' : 'stocks'}
                                    </span>
                                </div>

                                <div className="flex flex-col">
                                  <span className="text-xs text-muted-foreground mb-1 flex items-center">
                                    <CalendarClock className="h-3 w-3 mr-1" />
                                    Daily Change
                                  </span>
                                    <span className={`text-lg font-semibold flex items-center ${(portfolio.dailyChange || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {(portfolio.dailyChange || 0) >= 0 ?
                                            <TrendingUp className="h-4 w-4 mr-1" /> :
                                            <TrendingDown className="h-4 w-4 mr-1" />
                                        }
                                        ${Math.abs(portfolio.dailyChange || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </span>
                                    <span className={`text-xs ${(portfolio.dailyChangePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {(portfolio.dailyChangePercent || 0) >= 0 ? '+' : ''}{(portfolio.dailyChangePercent || 0).toFixed(2)}%
                                    </span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground mb-1">Initial Investment</span>
                                    <span className="text-lg font-semibold">
                                        ${(portfolio.initialInvestment || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </span>
                                    <span className="text-xs text-muted-foreground mt-1">
                                        Total cost basis
                                    </span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground mb-1">Total Return</span>
                                    <span className={`text-lg font-semibold ${(portfolio.returnAmount || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        ${(portfolio.returnAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </span>
                                    <span className={`text-xs ${(portfolio.returnPercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {(portfolio.returnPercent || 0) >= 0 ? '+' : ''}{(portfolio.returnPercent || 0).toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Button
                                variant="default"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => router.push(`/portfolio/${portfolio.id}`)}
                            >
                                View Details
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Delete confirmation dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Portfolio</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this portfolio? This action cannot be undone
                            and all portfolio data will be permanently removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setPortfolioToDelete(null);
                            }}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeletePortfolio}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Portfolio'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}