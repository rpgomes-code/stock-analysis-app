// src/app/dashboard/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard | Stock Analysis',
    description: 'Your personal stock market dashboard with real-time data and insights.',
};

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <section>
            {children}
        </section>
    );
}