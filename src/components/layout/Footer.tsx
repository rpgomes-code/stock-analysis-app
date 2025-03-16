import Link from 'next/link';
import { LineChart } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();

    // Skip rendering Footer on auth pages
    if (pathname?.startsWith('/auth/')) {
        return null;
    }

    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t bg-background">
            <div className="container py-8 md:py-12">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center space-x-2">
                            <LineChart className="h-6 w-6 text-primary" />
                            <span className="font-bold text-xl">StockAnalysis</span>
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Advanced stock analysis and portfolio management tools to help you make informed investment decisions.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-base font-medium">Resources</h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li>
                                <Link href="/learn" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Learning Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/glossary" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Financial Glossary
                                </Link>
                            </li>
                            <li>
                                <Link href="/calculators" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Investment Calculators
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-base font-medium">Company</h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Pricing
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-base font-medium">Legal</h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li>
                                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/disclaimer" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Disclaimer
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t pt-8 flex flex-col md:flex-row items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        &copy; {currentYear} StockAnalysis. All rights reserved.
                    </p>
                    <p className="text-xs text-muted-foreground mt-4 md:mt-0">
                        All stock data provided by YFinance. Not financial advice.
                    </p>
                </div>
            </div>
        </footer>
    );
}