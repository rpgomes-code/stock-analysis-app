import axios from 'axios';

// Create an axios instance
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// API methods
export const stockService = {
    // Ticker information
    async getTickerInfo(ticker: string) {
        const response = await apiClient.get(`/v1/ticker/${ticker}/info`);
        return response.data;
    },

    // Ticker historical data with optional parameters
    async getTickerHistory(
        ticker: string,
        params: {
            period?: string;
            interval?: string;
            start?: string;
            end?: string;
            prepost?: boolean;
            actions?: boolean;
        } = {}
    ) {
        const response = await apiClient.get(`/v1/ticker/${ticker}/history`, { params });
        return response.data;
    },

    // Ticker finance data
    async getTickerFinancials(ticker: string) {
        const response = await apiClient.get(`/v1/ticker/${ticker}/financials`);
        return response.data;
    },

    async getTickerBalanceSheet(ticker: string) {
        const response = await apiClient.get(`/v1/ticker/${ticker}/balance-sheet`);
        return response.data;
    },

    async getTickerCashFlow(ticker: string) {
        const response = await apiClient.get(`/v1/ticker/${ticker}/cash-flow`);
        return response.data;
    },

    async getTickerIncomeStatement(ticker: string) {
        const response = await apiClient.get(`/v1/ticker/${ticker}/income-stmt`);
        return response.data;
    },

    // Earnings and Dividends
    async getTickerEarnings(ticker: string) {
        const response = await apiClient.get(`/v1/ticker/${ticker}/earnings`);
        return response.data;
    },

    async getTickerDividends(ticker: string) {
        const response = await apiClient.get(`/v1/ticker/${ticker}/dividends`);
        return response.data;
    },

    // News
    async getTickerNews(ticker: string) {
        const response = await apiClient.get(`/v1/ticker/${ticker}/news`);
        return response.data;
    },

    // Recommendations and Analysis
    async getTickerRecommendations(ticker: string) {
        const response = await apiClient.get(`/v1/ticker/${ticker}/recommendations`);
        return response.data;
    },

    async getTickerAnalystPriceTargets(ticker: string) {
        const response = await apiClient.get(`/v1/ticker/${ticker}/analyst-price-targets`);
        return response.data;
    },

    // Search
    async searchQuotes(query: string) {
        const response = await apiClient.get(`/v1/search/${query}/quotes`);
        return response.data;
    },

    // Market data
    async getMarketStatus(market: string = 'us') {
        const response = await apiClient.get(`/v1/market/${market}/status`);
        return response.data;
    },

    async getMarketSummary(market: string = 'us') {
        const response = await apiClient.get(`/v1/market/${market}/summary`);
        return response.data;
    },

    // Options data
    async getTickerOptions(ticker: string, date?: string) {
        const params = date ? { date } : {};
        const response = await apiClient.get(`/v1/ticker/${ticker}/option-chain`, { params });
        return response.data;
    },

    // Multi-ticker data
    async getMultiTicker(tickers: string[]) {
        const symbols = tickers.join(',');
        const response = await apiClient.get(`/v1/multi-ticker?symbols=${symbols}`);
        return response.data;
    }
};

// Export default for convenience
export default apiClient;