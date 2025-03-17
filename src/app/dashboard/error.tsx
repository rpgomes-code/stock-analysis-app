'use client';
// src/app/dashboard/error.tsx
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Dashboard error:', error);
    }, [error]);

    return (
        <div className="container max-w-screen-xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Something went wrong
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error.message || 'An unexpected error occurred while loading your dashboard.'}
                        </AlertDescription>
                    </Alert>
                    <p className="text-sm text-muted-foreground">
                        This could be due to connection issues or a temporary server problem. You can try reloading the dashboard or return to the home page.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={reset}>
                        Try again
                    </Button>
                    <Link href="/">
                        <Button>Return Home</Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}