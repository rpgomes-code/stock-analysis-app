// src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import {
    LineChart, Search, LogOut, Home, BarChart3, Briefcase,
    Settings, Menu, User, Bell, Mail,
    HelpCircle, Book, Github, ExternalLink
} from 'lucide-react';
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
    DropdownMenuGroup,
    DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";

interface NavbarProps {
    session: Session | null;
}

export default function Navbar({ session }: NavbarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [commandOpen, setCommandOpen] = useState(false);

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

    // Helper to get initials from name
    function getInitials(name: string): string {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    return (
        <TooltipProvider>
            <header className="border-b bg-background sticky top-0 z-50">
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
                                            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
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
                                        <HoverCard>
                                            <HoverCardTrigger asChild>
                                                <Link href="/settings" legacyBehavior passHref>
                                                    <NavigationMenuLink
                                                        className={navigationMenuTriggerStyle()}
                                                        active={isActive('/settings')}
                                                    >
                                                        <Settings className="h-4 w-4 mr-2" />
                                                        Settings
                                                    </NavigationMenuLink>
                                                </Link>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="w-80">
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-semibold">User Settings</h4>
                                                    <p className="text-sm">
                                                        Manage your profile, notification preferences, security settings, and more.
                                                    </p>
                                                    <div className="flex items-center pt-2">
                                                        <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">
                                                            Customize your experience
                                                        </span>
                                                    </div>
                                                </div>
                                            </HoverCardContent>
                                        </HoverCard>
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
                                <SheetHeader>
                                    <SheetTitle>
                                        <Link
                                            href="/"
                                            className="flex items-center space-x-2"
                                            onClick={closeSheet}
                                        >
                                            <LineChart className="h-6 w-6 text-primary" />
                                            <span className="font-bold text-xl">StockAnalysis</span>
                                        </Link>
                                    </SheetTitle>
                                    <SheetDescription>
                                        Navigate the stock analysis platform
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="flex flex-col gap-6 py-4">
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

                                        {session?.user && (
                                            <>
                                                <Separator />
                                                {authNavItems.map((item) => (
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
                                            </>
                                        )}
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
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div>
                                                        <ThemeToggle />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Toggle theme</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                                <SheetFooter className="text-xs text-muted-foreground text-center mt-4">
                                    StockAnalysis © {new Date().getFullYear()}
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop Right Side */}
                    <div className="hidden md:flex gap-4 items-center">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => setCommandOpen(true)}>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Quick search (Ctrl+K)</p>
                            </TooltipContent>
                        </Tooltip>

                        <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
                            <CommandInput placeholder="Search stocks, markets, or commands..." />
                            <CommandList>
                                <CommandEmpty>No results found.</CommandEmpty>
                                <CommandGroup heading="Suggestions">
                                    <CommandItem onSelect={() => {
                                        setCommandOpen(false);
                                        window.location.href = '/stocks/AAPL';
                                    }}>
                                        <LineChart className="mr-2 h-4 w-4" />
                                        <span>Apple Inc. (AAPL)</span>
                                    </CommandItem>
                                    <CommandItem onSelect={() => {
                                        setCommandOpen(false);
                                        window.location.href = '/stocks/MSFT';
                                    }}>
                                        <LineChart className="mr-2 h-4 w-4" />
                                        <span>Microsoft Corporation (MSFT)</span>
                                    </CommandItem>
                                    <CommandItem onSelect={() => {
                                        setCommandOpen(false);
                                        window.location.href = '/markets';
                                    }}>
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        <span>Markets Overview</span>
                                    </CommandItem>
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup heading="Pages">
                                    <CommandItem onSelect={() => {
                                        setCommandOpen(false);
                                        window.location.href = '/';
                                    }}>
                                        <Home className="mr-2 h-4 w-4" />
                                        <span>Home</span>
                                        <CommandShortcut>Alt+H</CommandShortcut>
                                    </CommandItem>
                                    <CommandItem onSelect={() => {
                                        setCommandOpen(false);
                                        window.location.href = '/markets';
                                    }}>
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        <span>Markets</span>
                                        <CommandShortcut>Alt+M</CommandShortcut>
                                    </CommandItem>
                                    {session?.user && (
                                        <>
                                            <CommandItem onSelect={() => {
                                                setCommandOpen(false);
                                                window.location.href = '/portfolio';
                                            }}>
                                                <Briefcase className="mr-2 h-4 w-4" />
                                                <span>Portfolio</span>
                                                <CommandShortcut>Alt+P</CommandShortcut>
                                            </CommandItem>
                                            <CommandItem onSelect={() => {
                                                setCommandOpen(false);
                                                window.location.href = '/settings';
                                            }}>
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>Settings</span>
                                                <CommandShortcut>Alt+S</CommandShortcut>
                                            </CommandItem>
                                        </>
                                    )}
                                </CommandGroup>
                            </CommandList>
                        </CommandDialog>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <ThemeToggle />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Toggle theme</p>
                            </TooltipContent>
                        </Tooltip>

                        {session?.user ? (
                            <DropdownMenu>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'User'} />
                                                    <AvatarFallback>{getInitials(session.user.name || 'User')}</AvatarFallback>
                                                </Avatar>
                                                <Badge className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 bg-primary" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Account menu</p>
                                    </TooltipContent>
                                </Tooltip>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{session.user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
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
                                                <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/settings" className="cursor-pointer">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Settings
                                                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem asChild>
                                            <Link href="/notifications" className="cursor-pointer">
                                                <Bell className="h-4 w-4 mr-2" />
                                                Notifications
                                                <Badge className="ml-auto h-4 px-1 text-[10px]">5</Badge>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/messages" className="cursor-pointer">
                                                <Mail className="h-4 w-4 mr-2" />
                                                Messages
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem asChild>
                                            <Link href="/support" className="cursor-pointer">
                                                <HelpCircle className="h-4 w-4 mr-2" />
                                                Support
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/docs" className="cursor-pointer">
                                                <Book className="h-4 w-4 mr-2" />
                                                Documentation
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a
                                                href="https://github.com/yourusername/stock-analysis-app"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="cursor-pointer"
                                            >
                                                <Github className="h-4 w-4 mr-2" />
                                                GitHub
                                                <ExternalLink className="ml-auto h-3 w-3" />
                                            </a>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sign out
                                        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
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
        </TooltipProvider>
    );
}