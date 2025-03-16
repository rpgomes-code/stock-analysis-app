import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
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
    const [open, setOpen] = useState(false);

    // Create a debounced search function
    const debouncedSearch = useCallback(
        debounce(async (query: string) => {
            if (!query || query.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const results = await stockService.searchQuotes(query);

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
            } finally {
                setIsLoading(false);
            }
        }, 300),
        []
    );

    // Effect to trigger search when query changes
    useEffect(() => {
        debouncedSearch(searchQuery);

        return () => {
            debouncedSearch.cancel();
        };
    }, [searchQuery, debouncedSearch]);

    const handleSelectStock = (stock: SearchResult) => {
        setSearchQuery(stock.symbol);
        onSelect(stock.symbol);
        setOpen(false);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <div className="w-full max-w-md">
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
                        {searchQuery && (
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
                        <CommandEmpty>
                            {isLoading ? 'Searching...' : 'No stocks found.'}
                        </CommandEmpty>
                        <CommandGroup>
                            {searchResults.map((stock) => (
                                <CommandItem
                                    key={stock.symbol}
                                    onSelect={() => handleSelectStock(stock)}
                                    className="flex justify-between"
                                >
                                    <div className="flex items-center">
                                        <span className="font-bold">{stock.symbol}</span>
                                        <span className="ml-2 text-muted-foreground">{stock.shortname}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {stock.exchDisp}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default StockSearch;