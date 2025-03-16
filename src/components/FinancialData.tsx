import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { stockService } from '@/services/api';
import { DollarSign, TrendingUp, BarChart2, BarChart } from 'lucide-react';

interface FinancialDataProps {
    symbol: string;
}

const FinancialData: React.FC<FinancialDataProps> = ({ symbol }) => {
    const [activeTab, setActiveTab] = useState('income');
    const [incomeData, setIncomeData] = useState<any[]>([]);
    const [balanceData, setBalanceData] = useState<any[]>([]);
    const [cashFlowData, setCashFlowData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnnual, setIsAnnual] = useState(true);

    useEffect(() => {
        const fetchFinancialData = async () => {
            setIsLoading(true);
            try {
                // Fetch income statement data
                const incomeStatementAnnual = await stockService.getTickerIncomeStatement(symbol);
                const incomeStatementQuarterly = await stockService.getTickerIncomeStatement(symbol); // In real app, use quarterly endpoint

                // Fetch balance sheet data
                const balanceSheetAnnual = await stockService.getTickerBalanceSheet(symbol);
                const balanceSheetQuarterly = await stockService.getTickerBalanceSheet(symbol); // In real app, use quarterly endpoint

                // Fetch cash flow data
                const cashFlowAnnual = await stockService.getTickerCashFlow(symbol);
                const cashFlowQuarterly = await stockService.getTickerCashFlow(symbol); // In real app, use quarterly endpoint

                // Process and set data
                setIncomeData({
                    annual: processFinancialData(incomeStatementAnnual),
                    quarterly: processFinancialData(incomeStatementQuarterly),
                });

                setBalanceData({
                    annual: processFinancialData(balanceSheetAnnual),
                    quarterly: processFinancialData(balanceSheetQuarterly),
                });

                setCashFlowData({
                    annual: processFinancialData(cashFlowAnnual),
                    quarterly: processFinancialData(cashFlowQuarterly),
                });
            } catch (error) {
                console.error('Error fetching financial data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (symbol) {
            fetchFinancialData();
        }
    }, [symbol]);

    // Helper function to process financial data
    const processFinancialData = (data: any) => {
        if (!data || !Array.isArray(data)) return [];

        // Convert to array format with proper date sorting
        const processed = Object.entries(data).map(([key, value]) => ({
            date: key,
            ...value,
        }));

        // Sort by date (most recent first)
        return processed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    // Helper to format financial numbers
    const formatNumber = (num: number | string | undefined) => {
        if (num === undefined || num === null) return '—';

        const value = typeof num === 'string' ? parseFloat(num) : num;

        if (isNaN(value)) return '—';

        // Convert to millions or billions for readability
        if (Math.abs(value) >= 1e9) {
            return `$${(value / 1e9).toFixed(2)}B`;
        } else if (Math.abs(value) >= 1e6) {
            return `$${(value / 1e6).toFixed(2)}M`;
        } else if (Math.abs(value) >= 1e3) {
            return `$${(value / 1e3).toFixed(2)}K`;
        }

        return `$${value.toFixed(2)}`;
    };

    // Get current data based on activeTab and isAnnual
    const getCurrentData = () => {
        if (isLoading) return [];

        const period = isAnnual ? 'annual' : 'quarterly';

        switch (activeTab) {
            case 'income':
                return incomeData && incomeData[period] ? incomeData[period] : [];
            case 'balance':
                return balanceData && balanceData[period] ? balanceData[period] : [];
            case 'cashflow':
                return cashFlowData && cashFlowData[period] ? cashFlowData[period] : [];
            default:
                return [];
        }
    };

    // Get columns based on activeTab
    const getColumns = () => {
        if (isLoading) return [];

        const data = getCurrentData();
        if (data.length === 0) return [];

        const commonColumns = ['date']; // Always show date

        // Define important metrics for each statement type
        const keyMetrics = {
            income: [
                'TotalRevenue',
                'GrossProfit',
                'OperatingIncome',
                'NetIncome',
                'EPS',
                'EBITDA'
            ],
            balance: [
                'TotalAssets',
                'TotalCurrentAssets',
                'CashAndCashEquivalents',
                'TotalLiabilities',
                'TotalCurrentLiabilities',
                'TotalStockholderEquity',
                'RetainedEarnings'
            ],
            cashflow: [
                'OperatingCashFlow',
                'InvestingCashFlow',
                'FinancingCashFlow',
                'FreeCashFlow',
                'CapitalExpenditures',
                'CashAndCashEquivalentsChanges'
            ]
        };

        // Get available columns from data and filter to only show important ones
        const availableColumns = Object.keys(data[0] || {});
        const filteredColumns = availableColumns.filter(col =>
            keyMetrics[activeTab as keyof typeof keyMetrics].includes(col) || commonColumns.includes(col)
        );

        return filteredColumns;
    };

    // Get human-readable column names
    const getColumnName = (column: string) => {
        const nameMap: { [key: string]: string } = {
            TotalRevenue: 'Total Revenue',
            GrossProfit: 'Gross Profit',
            OperatingIncome: 'Operating Income',
            NetIncome: 'Net Income',
            EPS: 'Earnings Per Share',
            EBITDA: 'EBITDA',
            TotalAssets: 'Total Assets',
            TotalCurrentAssets: 'Current Assets',
            CashAndCashEquivalents: 'Cash & Equivalents',
            TotalLiabilities: 'Total Liabilities',
            TotalCurrentLiabilities: 'Current Liabilities',
            TotalStockholderEquity: 'Stockholder Equity',
            RetainedEarnings: 'Retained Earnings',
            OperatingCashFlow: 'Operating Cash Flow',
            InvestingCashFlow: 'Investing Cash Flow',
            FinancingCashFlow: 'Financing Cash Flow',
            FreeCashFlow: 'Free Cash Flow',
            CapitalExpenditures: 'Capital Expenditures',
            CashAndCashEquivalentsChanges: 'Cash Changes',
            date: 'Period'
        };

        return nameMap[column] || column;
    };

    const columns = getColumns();
    const data = getCurrentData();

    return (
        <Card className="w-full shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <BarChart2 className="mr-2 h-5 w-5" />
                    Financial Data
                </CardTitle>
                <CardDescription>
                    {symbol} financial statements and metrics
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="flex justify-between items-center mb-4">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="grid grid-cols-3 mb-4">
                            <TabsTrigger value="income" className="flex items-center">
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Income
                            </TabsTrigger>
                            <TabsTrigger value="balance" className="flex items-center">
                                <BarChart className="mr-2 h-4 w-4" />
                                Balance
                            </TabsTrigger>
                            <TabsTrigger value="cashflow" className="flex items-center">
                                <DollarSign className="mr-2 h-4 w-4" />
                                Cash Flow
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex space-x-2">
                        <Button
                            variant={isAnnual ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsAnnual(true)}
                        >
                            Annual
                        </Button>
                        <Button
                            variant={!isAnnual ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsAnnual(false)}
                        >
                            Quarterly
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No financial data available</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableHead key={column} className={column === 'date' ? '' : 'text-right'}>
                                            {getColumnName(column)}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row, index) => (
                                    <TableRow key={index}>
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column}
                                                className={column === 'date' ? 'font-medium' : 'text-right'}
                                            >
                                                {column === 'date'
                                                    ? new Date(row[column]).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })
                                                    : column === 'EPS'
                                                        ? formatNumber(row[column]).replace('$', '')
                                                        : formatNumber(row[column])}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <div className="mt-4 text-sm text-muted-foreground">
                    <p>
                        Note: Financial data is shown in USD unless otherwise specified.
                        {isAnnual
                            ? ' Annual data represents the fiscal year end.'
                            : ' Quarterly data represents the most recent quarters.'}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default FinancialData;