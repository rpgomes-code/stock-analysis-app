'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Info } from 'lucide-react';
import { stockService } from '@/services/api';
import debounce from 'lodash/debounce';

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StockSearchProps {
    onSelect: (symbol: string) => void;
}

interface SearchResult {
    symbol: string;
    shortname: string;
    longname?: string;
    exchDisp?: string;
    typeDisp?: string;
}

const StockSearch: React.FC<StockSearchProps> = ({ onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Create a function to save recent searches
    const saveToRecentSearches = useCallback((query: string) => {
        if (!query.trim()) return;

        // Add to recent searches (avoiding duplicates)
        setRecentSearches(prev => {
            if (prev.includes(query)) return prev;
            return [query, ...prev].slice(0, 5); // Keep most recent 5
        });
    }, []);

    // Create a debounced search function
    const debouncedSearch = useCallback((searchTerm: string) => {
        const handler = async (term: string) => {
            if (!term || term.length < 2) {
                setSearchResults([]);
                setError(null);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Call the real API to search for stocks
                const results = await stockService.searchQuotes(term);

                if (results && Array.isArray(results)) {
                    const formattedResults = results.map((item: Partial<SearchResult>) => ({
                        symbol: item.symbol || '',
                        shortname: item.shortname || item.symbol || '',
                        longname: item.longname,
                        exchDisp: item.exchDisp,
                        typeDisp: item.typeDisp,
                    }));
                    setSearchResults(formattedResults);
                } else {
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Error searching stocks:', error);
                setSearchResults([]);
                setError('Failed to fetch search results. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        const debouncedFn = debounce(handler, 300);
        debouncedFn(searchTerm);
    }, []);

    // Effect to trigger search when query changes
    useEffect(() => {
        debouncedSearch(searchQuery);

        return () => {
            debouncedSearch.cancel();
        };
    }, [searchQuery, debouncedSearch]);

    const handleSelectStock = (stock: SearchResult) => {
        setSearchQuery(stock.symbol);
        saveToRecentSearches(stock.symbol);
        onSelect(stock.symbol);
        setOpen(false);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setError(null);
    };

    const getResultTypeColor = (type?: string) => {
        if (!type) return "default";
        switch (type.toLowerCase()) {
            case 'equity': return "default";
            case 'etf': return "secondary";
            case 'index': return "outline";
            default: return "default";
        }
    };

    return (
        <div className="w-full max-w-md">
            <TooltipProvider>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search for a stock..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (e.target.value.length > 0) {
                                        setOpen(true);
                                    }
                                }}
                                className="pl-9 pr-10"
                            />
                            {searchQuery ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1 h-7 w-7 p-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearSearch();
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Clear</span>
                                </Button>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1 h-7 w-7 p-0 opacity-70"
                                        >
                                            <Info className="h-4 w-4" />
                                            <span className="sr-only">Search Tips</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Search by company name or ticker symbol</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                        <Command>
                            <CommandInput
                                placeholder="Search for a stock..."
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                            />
                            {isLoading ? (
                                <div className="p-4 flex items-center justify-center">
                                    <div className="space-y-2 w-full">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="p-2">
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                </div>
                            ) : (
                                <>
                                    <CommandEmpty>
                                        No stocks found. Try a different search term.
                                    </CommandEmpty>
                                    <CommandGroup heading="Search Results">
                                        {searchResults.map((stock) => (
                                            <HoverCard key={stock.symbol}>
                                                <HoverCardTrigger asChild>
                                                    <CommandItem
                                                        onSelect={() => handleSelectStock(stock)}
                                                        className="flex justify-between"
                                                    >
                                                        <div className="flex items-center">
                                                            <span className="font-bold">{stock.symbol}</span>
                                                            <span className="ml-2 text-muted-foreground truncate max-w-[150px]">
                                                                {stock.shortname}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            {stock.typeDisp && (
                                                                <Badge variant={getResultTypeColor(stock.typeDisp)} className="mr-2">
                                                                    {stock.typeDisp}
                                                                </Badge>
                                                            )}
                                                            <span className="text-xs text-muted-foreground">
                                                                {stock.exchDisp}
                                                            </span>
                                                        </div>
                                                    </CommandItem>
                                                </HoverCardTrigger>
                                                <HoverCardContent className="w-80">
                                                    <div className="space-y-2">
                                                        <h4 className="text-sm font-semibold">{stock.symbol} - {stock.shortname}</h4>
                                                        {stock.longname && stock.longname !== stock.shortname && (
                                                            <p className="text-sm">{stock.longname}</p>
                                                        )}
                                                        <Separator />
                                                        <div className="flex justify-between">
                                                            <span className="text-xs text-muted-foreground">Exchange</span>
                                                            <span className="text-xs font-medium">{stock.exchDisp || 'Unknown'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-xs text-muted-foreground">Type</span>
                                                            <span className="text-xs font-medium">{stock.typeDisp || 'Stock'}</span>
                                                        </div>
                                                    </div>
                                                </HoverCardContent>
                                            </HoverCard>
                                        ))}
                                    </CommandGroup>
                                    {searchResults.length > 0 && (
                                        <>
                                            <Separator className="my-1" />
                                            <div className="p-2 text-xs text-center text-muted-foreground">
                                                Press Enter to select
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </Command>
                    </PopoverContent>
                </Popover>
            </TooltipProvider>
        </div>
    );
};

export default StockSearch;