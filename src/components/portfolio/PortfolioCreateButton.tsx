'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    const [isCreating, setIsCreating] = useState(false);

    const handleCreatePortfolio = async () => {
        if (!portfolioName.trim()) {
            toast.error('Portfolio name is required');
            return;
        }

        setIsCreating(true);
        try {
            // This would be an API call to create a new portfolio
            const response = await fetch('/api/portfolio', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId,
                name: portfolioName,
                description: portfolioDescription,
              }),
            });

            // const data = await response.json();

            // Uncomment the actual API call to use userId and remove the mock code below
                    const data = await response.json();
                    const mockPortfolioId = data.id;

            // Reset form and close dialog
            setPortfolioName('');
            setPortfolioDescription('');
            setIsOpen(false);

            // Show success toast
            toast.success('Success',{
                description: 'Portfolio created successfully',
            });

            // Navigate to the newly created portfolio page
            // In a real app, you would navigate to the actual portfolio ID returned from the API
            router.push(`/portfolio/${mockPortfolioId}`);
            router.refresh();
        } catch (error) {
            console.error('Failed to create portfolio:', error);
            toast.error('Error',{
                description: 'Failed to create portfolio. Please try again.'
            });
        } finally {
            setIsCreating(false);
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