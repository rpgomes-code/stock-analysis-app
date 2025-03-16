import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Briefcase, PlusCircle, TrendingUp } from 'lucide-react';

import { getCurrentUser, requireAuth } from '@/lib/auth';
import PortfolioOverview from '@/components/portfolio/PortfolioOverview';
import PortfolioList from '@/components/portfolio/PortfolioList';
import PortfolioCreateButton from '@/components/portfolio/PortfolioCreateButton';
import PortfolioPerformance from '@/components/portfolio/PortfolioPerformance';

export const metadata = {
    title: 'Portfolio Management | Stock Analysis',
    description: 'Manage and track your stock portfolios',
};

export default async function PortfolioPage() {
    // Require authentication for this page
    await requireAuth();

    // Get current user
    const user = await getCurrentUser();

    if (!user) {
        redirect('/auth/signin');
    }

    return (
        <div className="container max-w-screen-xl mx-auto p-6">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center">
                            <Briefcase className="mr-2 h-7 w-7" />
                            Portfolio Management
                        </h1>
                        <p className="text-muted-foreground">
                            Track, analyze and manage your stock portfolios
                        </p>
                    </div>
                    <PortfolioCreateButton userId={user.id} />
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="portfolios">All Portfolios</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 py-4">
                        <PortfolioOverview userId={user.id} />
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-6 py-4">
                        <PortfolioPerformance userId={user.id} />
                    </TabsContent>

                    <TabsContent value="portfolios" className="space-y-6 py-4">
                        <PortfolioList userId={user.id} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}