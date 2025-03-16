import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
    title: "Sign In | Stock Analysis",
    description: "Sign in to your Stock Analysis account",
};

export default async function SignInPage() {
    // Check if user is already signed in
    const session = await getServerSession(authOptions);

    if (session?.user) {
        redirect("/");
    }

    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-6 w-6 text-primary"
                            >
                                <path d="M5 22h14"></path>
                                <path d="M5 2h14"></path>
                                <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
                                <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
                            </svg>
                            <span className="font-bold text-xl">StockAnalysis</span>
                        </Link>
                    </div>
                    <CardTitle className="text-2xl text-center">Sign In</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email below to sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <SignInForm />
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-center text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/auth/signup"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}