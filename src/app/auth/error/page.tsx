import { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
    title: "Authentication Error | Stock Analysis",
    description: "There was an error with authentication",
};

export default function AuthErrorPage({ searchParams }: {
    searchParams: { error: string } | Promise<{ error: string }>;
}) {
    const { error } = searchParams as { error: string };

    let errorMessage: string;
    let errorTitle: string;

    switch (error) {
        case "OAuthSignin":
        case "OAuthCallback":
        case "OAuthCreateAccount":
        case "EmailCreateAccount":
            errorTitle = "OAuth Error";
            errorMessage = "There was an error during the OAuth sign in process.";
            break;
        case "Callback":
            errorTitle = "Callback Error";
            errorMessage = "There was an error during the authentication callback.";
            break;
        case "OAuthAccountNotLinked":
            errorTitle = "Account Not Linked";
            errorMessage =
                "This email is already associated with another account. Please sign in using the original provider.";
            break;
        case "EmailSignin":
            errorTitle = "Email Sign In Error";
            errorMessage = "The email sign in link is invalid or has expired.";
            break;
        case "CredentialsSignin":
            errorTitle = "Invalid Credentials";
            errorMessage = "The email or password you entered is incorrect.";
            break;
        case "SessionRequired":
            errorTitle = "Authentication Required";
            errorMessage = "You must be signed in to access this page.";
            break;
        default:
            errorTitle = "Authentication Error";
            errorMessage = "An unknown error occurred during authentication.";
            break;
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
                    <CardTitle className="text-2xl text-center text-destructive">
                        {errorTitle}
                    </CardTitle>
                    <CardDescription className="text-center">
                        There was a problem with the authentication process
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{errorTitle}</AlertTitle>
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/auth/signin">
                        <Button>Back to Sign In</Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}