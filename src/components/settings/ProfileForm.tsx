'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {UserProps} from "@/types/settings";

// Form schema validation
const profileFormSchema = z.object({
    name: z
        .string()
        .min(2, {
            message: 'Name must be at least 2 characters.',
        })
        .max(50, {
            message: 'Name must not be longer than 50 characters.',
        }),
    username: z
        .string()
        .min(3, {
            message: 'Username must be at least 3 characters.',
        })
        .max(30, {
            message: 'Username must not be longer than 30 characters.',
        })
        .regex(/^[a-zA-Z0-9_]+$/, {
            message: 'Username can only include letters, numbers, and underscores.',
        }),
    bio: z.string().max(500, {
        message: 'Bio must not be longer than 500 characters.',
    }).optional(),
});

interface ProfileFormProps {
    user: UserProps;
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Default form values
    const defaultValues = {
        name: user?.name || '',
        username: user?.username || '',
        bio: user?.bio || '',
    };

    // Initialize form
    const form = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues,
    });

    // Form submission handler
    async function onSubmit(data: z.infer<typeof profileFormSchema>) {
        setIsLoading(true);

        try {
            console.log('Form data submitted:', data);

            // In a real app, this would be an API call
            // await fetch('/api/user/profile', {
            //   method: 'PATCH',
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify(data),
            // });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Profile updated', {
                description: 'Your profile has been updated successfully.',
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error', {
                description: 'Failed to update profile. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Helper to get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="space-y-6">
            {/* Profile picture */}
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                    <AvatarFallback className="text-xl">{getInitials(user?.name || 'User')}</AvatarFallback>
                </Avatar>
                <div>
                    <Button size="sm" variant="outline">
                        Change avatar
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                        JPG, GIF or PNG. Max size 2MB.
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your name" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is your public display name.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="username" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Your unique username for your profile.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Tell us a little about yourself"
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Brief description for your profile. Max 500 characters.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update profile
                    </Button>
                </form>
            </Form>
        </div>
    );
}