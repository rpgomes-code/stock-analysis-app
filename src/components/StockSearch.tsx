import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Search, X } from 'lucide-react';
import { stockService } from '@/services/api';
import debounce from 'lodash/debounce';

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
                    const formattedResults = results.map((item: any) => ({
                        symbol: item.symbol,
                        shortname: item.shortname || item.symbol,
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (e.target.value.length > 0) {
            setOpen(true);
        }
    };

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
                        <Input
                            type="text"
                            placeholder="Search for a stock..."
                            value={searchQuery}
                            onChange={handleInputChange}
                            className="w-full pr-8"
                        />
                        {searchQuery ? (
                            <X
                                className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
                                onClick={clearSearch}
                            />
                        ) : (
                            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        )}
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search for a stock..." value={searchQuery} onValueChange={setSearchQuery} />
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
                                    <div>
                                        <span className="font-bold">{stock.symbol}</span>
                                        <span className="ml-2 text-sm">{stock.shortname}</span>
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