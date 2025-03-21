"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

// Form validation schema
const formSchema = z
    .object({
        name: z.string().min(1, { message: "Name is required" }),
        email: z
            .string()
            .min(1, { message: "Email is required" })
            .email({ message: "Invalid email address" }),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters" }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type FormValues = z.infer<typeof formSchema>;

export function SignUpForm() {

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    // Initialize form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    // Form submission handler
    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            // Make API call to register user
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error(data);
                toast.error('Error',{ description: "Failed to create account" });
                return;
            }

            // Show success message or redirect
            setSuccess(true);
            toast.success('Account created',{
                description: 'Your account has been created successfully. Redirecting to login...'
            });

            // Sign in the user automatically
            setTimeout(() => {
                signIn("credentials", {
                    redirect: true,
                    email: values.email,
                    password: values.password,
                    callbackUrl: "/",
                });
            }, 1500);

        } catch (error) {
            if (error instanceof Error) {
                setError(error.message || "An unexpected error occurred");
            } else {
                setError("An unexpected error occurred");
            }
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Social sign-in handlers
    const handleGoogleSignIn = () => {
        setIsLoading(true);
        signIn("google", {callbackUrl: "/"}).then(() => {});
    };

    const handleGithubSignIn = () => {
        setIsLoading(true);
        signIn("github", {callbackUrl: "/"}).then(() => {});
    };

    return (
        <div className="grid gap-6">
            {/* Error alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Success message */}
            {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>
                        Account created successfully! Signing you in...
                    </AlertDescription>
                </Alert>
            )}

            {/* Social sign-in buttons */}
            <div className="grid gap-3">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={handleGoogleSignIn}
                    className="bg-white text-black hover:text-black hover:bg-gray-100 border-gray-300"
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                            <path
                                d="M12.48 10.92v3.28h4.92c-.2 1.28-1.52 3.76-4.92 3.76-3 0-5.36-2.44-5.36-5.48s2.4-5.48 5.36-5.48c1.68 0 2.8.72 3.44 1.32l2.36-2.24C16.64 4.8 14.68 4 12.48 4 7.92 4 4.32 7.52 4.32 12s3.6 8 8.16 8c4.72 0 7.84-3.28 7.84-7.92 0-.52-.08-1-.2-1.44H12.48z"
                                fill="currentColor"
                            />
                        </svg>
                    )}
                    Sign up with Google
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={handleGithubSignIn}
                    className="border-gray-300"
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <svg viewBox="0 0 438.549 438.549" className="mr-2 h-4 w-4">
                            <path
                                fill="currentColor"
                                d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
                            ></path>
                        </svg>
                    )}
                    Sign up with GitHub
                </Button>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or with email</span>
                </div>
            </div>

            {/* Registration form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="John Doe"
                                        disabled={isLoading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="name@example.com"
                                        disabled={isLoading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </Button>
                </form>
            </Form>
        </div>
    );
}