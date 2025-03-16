'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { PlusCircle, Briefcase, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner"

interface PortfolioCreateButtonProps {
    userId: string;
}

export default function PortfolioCreateButton({ userId }: PortfolioCreateButtonProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [portfolioName, setPortfolioName] = useState('');
    const [portfolioDescription, setPortfolioDescription] = useState('');
    const [initialInvestment, setInitialInvestment] = useState('0');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreatePortfolio = async () => {
        if (!portfolioName.trim()) {
            toast.error('Portfolio name is required');
            return;
        }

        setIsCreating(true);
        try {
            // Convert initialInvestment to a number
            const investmentValue = parseFloat(initialInvestment) || 0;

            // Real API call to create a new portfolio
            const response = await axios.post('/api/portfolios', {
                name: portfolioName,
                description: portfolioDescription,
                initialInvestment: investmentValue
            });

            // Get the new portfolio data from the response
            const data = response.data;
            const newPortfolioId = data.portfolio?.id;

            // Reset form and close dialog
            setPortfolioName('');
            setPortfolioDescription('');
            setInitialInvestment('0');
            setIsOpen(false);

            // Show success toast
            toast.success('Success', {
                description: 'Portfolio created successfully',
            });

            // Navigate to the newly created portfolio page
            if (newPortfolioId) {
                router.push(`/portfolio/${newPortfolioId}`);
            } else {
                router.push('/portfolio'); // Fallback to the portfolio list
            }

            router.refresh();
        } catch (error) {
            console.error('Failed to create portfolio:', error);
            toast.error('Error', {
                description: 'Failed to create portfolio. Please try again.'
            });
        } finally {
            setIsCreating(false);
        }
    };

    // Validate that the initial investment is a valid number
    const validateInvestment = (value: string) => {
        // Allow empty string (will default to 0)
        if (value === '') {
            setInitialInvestment('');
            return;
        }

        // Only allow numbers with up to 2 decimal places
        const regex = /^\d+(\.\d{0,2})?$/;
        if (regex.test(value)) {
            setInitialInvestment(value);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Portfolio
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Briefcase className="h-5 w-5 mr-2" />
                        Create New Portfolio
                    </DialogTitle>
                    <DialogDescription>
                        Create a new portfolio to track your investments and analyze performance.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="portfolio-name">Portfolio Name</Label>
                        <Input
                            id="portfolio-name"
                            placeholder="e.g., Growth Stocks, Dividend Portfolio"
                            value={portfolioName}
                            onChange={(e) => setPortfolioName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="initial-investment">Initial Investment ($)</Label>
                        <Input
                            id="initial-investment"
                            placeholder="Initial investment amount"
                            value={initialInvestment}
                            onChange={(e) => validateInvestment(e.target.value)}
                            type="text"
                            inputMode="decimal"
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter the total amount you&#39;ve already invested (optional)
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="portfolio-description">Description (Optional)</Label>
                        <Textarea
                            id="portfolio-description"
                            placeholder="Describe the strategy or focus of this portfolio"
                            value={portfolioDescription}
                            onChange={(e) => setPortfolioDescription(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isCreating}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreatePortfolio} disabled={isCreating || !portfolioName.trim()}>
                        {isCreating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Portfolio'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}