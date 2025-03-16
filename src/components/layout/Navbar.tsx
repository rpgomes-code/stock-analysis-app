'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { LineChart, Search, LogOut, Home, BarChart3, Briefcase, Settings, Menu, User } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu';

interface NavbarProps {
    session: Session | null;
}

export default function Navbar({ session }: NavbarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Skip rendering Navbar on auth pages
    if (pathname?.startsWith('/auth/')) {
        return null;
    }

    const isActive = (path: string) => {
        return pathname === path;
    };

    const closeSheet = () => {
        setIsOpen(false);
    };

    const navItems = [
        { href: '/', label: 'Home', icon: <Home className="h-4 w-4 mr-2" /> },
        { href: '/markets', label: 'Markets', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
        { href: '/search', label: 'Search', icon: <Search className="h-4 w-4 mr-2" /> },
    ];

    const authNavItems = [
        { href: '/portfolio', label: 'Portfolio', icon: <Briefcase className="h-4 w-4 mr-2" /> },
        { href: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4 mr-2" /> },
    ];

    return (
        <header className="border-b bg-background">
            <div className="container flex h-16 items-center justify-between py-4">
                <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <LineChart className="h-6 w-6 text-primary" />
                        <span className="font-bold text-xl hidden md:inline-block">StockAnalysis</span>
                    </Link>

                    {/* Desktop Navigation using NavigationMenu */}
                    <NavigationMenu className="hidden md:flex">
                        <NavigationMenuList>
                            {navItems.map((item) => (
                                <NavigationMenuItem key={item.href}>
                                    <Link href={item.href} legacyBehavior passHref>
                                        <NavigationMenuLink
                                            className={navigationMenuTriggerStyle()}
                                            active={isActive(item.href)}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                            ))}

                            {session?.user && (
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>
                                        <Briefcase className="h-4 w-4 mr-2" />
                                        Portfolio
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                                            <li className="row-span-3">
                                                <NavigationMenuLink asChild>
                                                    <a
                                                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                                        href="/portfolio"
                                                    >
                                                    <Briefcase className="h-6 w-6" />
                                                    <div className="mb-2 mt-4 text-lg font-medium">
                                                        Portfolio Dashboard
                                                    </div>
                                                    <p className="text-sm leading-tight text-muted-foreground">
                                                        View and manage your investment portfolios
                                                    </p>
                                                </a>
                                            </NavigationMenuLink>
                                        </li>
                                        <li>
                                            <Link href="/portfolio/create" legacyBehavior passHref>
                                                <NavigationMenuLink>
                                                    Create New Portfolio
                                                </NavigationMenuLink>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/portfolio/analysis" legacyBehavior passHref>
                                                <NavigationMenuLink>
                                                    Portfolio Analysis
                                                </NavigationMenuLink>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/portfolio/performance" legacyBehavior passHref>
                                                <NavigationMenuLink>
                                                    Performance Overview
                                                </NavigationMenuLink>
                                            </Link>
                                        </li>
                                    </ul>
                                </NavigationMenuContent>
                                </NavigationMenuItem>
                                )}

                            {session?.user && (
                                <NavigationMenuItem>
                                    <Link href="/settings" legacyBehavior passHref>
                                        <NavigationMenuLink
                                            className={navigationMenuTriggerStyle()}
                                            active={isActive('/settings')}
                                        >
                                            <Settings className="h-4 w-4 mr-2" />
                                            Settings
                                        </NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                            )}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <div className="flex flex-col gap-6 py-4">
                                <Link
                                    href="/"
                                    className="flex items-center space-x-2"
                                    onClick={closeSheet}
                                >
                                    <LineChart className="h-6 w-6 text-primary" />
                                    <span className="font-bold text-xl">StockAnalysis</span>
                                </Link>
                                <nav className="flex flex-col gap-4">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`text-sm font-medium flex items-center rounded-md p-2 transition-colors ${
                                                isActive(item.href)
                                                    ? 'text-primary bg-primary/10'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                            }`}
                                            onClick={closeSheet}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </Link>
                                    ))}
                                    {session?.user && authNavItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`text-sm font-medium flex items-center rounded-md p-2 transition-colors ${
                                                isActive(item.href)
                                                    ? 'text-primary bg-primary/10'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                            }`}
                                            onClick={closeSheet}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </Link>
                                    ))}
                                </nav>

                                <div className="mt-auto">
                                    {session?.user ? (
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'User'} />
                                                    <AvatarFallback>{getInitials(session.user.name || 'User')}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-medium">{session.user.name}</div>
                                                    <div className="text-xs text-muted-foreground">{session.user.email}</div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="flex items-center"
                                                onClick={() => {
                                                    signOut({callbackUrl: '/'}).then(() => {
                                                        closeSheet();
                                                    });
                                                }}
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Sign out
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <Link href="/auth/signin" onClick={closeSheet}>
                                                <Button variant="default" className="w-full">Sign in</Button>
                                            </Link>
                                            <Link href="/auth/signup" onClick={closeSheet}>
                                                <Button variant="outline" className="w-full">Sign up</Button>
                                            </Link>
                                        </div>
                                    )}
                                    <div className="mt-4 flex justify-center">
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop Right Side */}
                <div className="hidden md:flex gap-4 items-center">
                    <ThemeToggle />

                    {session?.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'User'} />
                                        <AvatarFallback>{getInitials(session.user.name || 'User')}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer">
                                        <User className="h-4 w-4 mr-2" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/portfolio" className="cursor-pointer">
                                        <Briefcase className="h-4 w-4 mr-2" />
                                        Portfolio
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings" className="cursor-pointer">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex gap-2">
                            <Link href="/auth/signin">
                                <Button variant="default">Sign in</Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button variant="outline">Sign up</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

// Helper function to get initials from name
function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}