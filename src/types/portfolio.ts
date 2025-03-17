export interface Portfolio {
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

export interface Stock {
    id: string;
    symbol: string;
    watchlistId?: string;
    portfolioId?: string;
    currentPrice?: number;
    priceChange?: number;
    percentChange?: number;
    volume?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Transaction {
    id: string;
    stockSymbol: string;
    quantity: number;
    price: number;
    type: 'BUY' | 'SELL';
    timestamp: string | Date;
    portfolioId: string;
}

export interface TransactionData {
    stockSymbol: string;
    quantity: number;
    price: number;
    type: 'BUY' | 'SELL';
    timestamp: Date | string;
}