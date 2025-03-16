import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { Toaster } from "@/components/ui/sonner";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/Providers';
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stock Analysis App",
  description: "Comprehensive stock analysis and portfolio management",
};

export default async function  RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
      <Providers>
          <Navbar session={session} />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
      </Providers>
      </body>
    </html>
  );
}