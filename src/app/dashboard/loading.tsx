// src/app/dashboard/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
    return (
        <div className="container max-w-screen-xl mx-auto p-6">
            <div className="space-y-8">
                <div>
                    <Skeleton className="h-12 w-64 mb-2" />
                    <Skeleton className="h-4 w-80" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <Skeleton className="h-96 w-full" />
                    </div>
                    <div className="md:col-span-3">
                        <Skeleton className="h-96 w-full mb-6" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}