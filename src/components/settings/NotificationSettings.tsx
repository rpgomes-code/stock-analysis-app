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
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import {UserProps} from "@/types/settings";

// Form schema validation
const notificationFormSchema = z.object({
    emailNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    marketAlerts: z.boolean().default(true),
    priceAlerts: z.boolean().default(true),
    newsAlerts: z.boolean().default(true),
    earningsAlerts: z.boolean().default(true),
    portfolioAlerts: z.boolean().default(true),
    watchlistAlerts: z.boolean().default(true),
    marketSummaries: z.enum(['none', 'daily', 'weekly']).default('daily'),
    portfolioSummaries: z.enum(['none', 'daily', 'weekly']).default('daily'),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

interface NotificationSettingsProps {
    user: UserProps;
}

export default function NotificationSettings({ user }: NotificationSettingsProps) {
    const [isLoading, setIsLoading] = useState(false);

    console.log(user); // Use the user prop for debugging or remove if unnecessary

    // Mock existing user notification settings
    const defaultValues: Partial<NotificationFormValues> = {
        emailNotifications: true,
        pushNotifications: true,
        marketAlerts: true,
        priceAlerts: true,
        newsAlerts: false,
        earningsAlerts: true,
        portfolioAlerts: true,
        watchlistAlerts: true,
        marketSummaries: 'daily',
        portfolioSummaries: 'weekly',
    };

    // Initialize form
    const form = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationFormSchema),
        defaultValues,
    });

    // Form submission handler
    async function onSubmit() {
        setIsLoading(true);

        try {
            // In a real app, this would be an API call
            // await fetch('/api/user/notifications', {
            //   method: 'PATCH',
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify(form.getValues()),
            // });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Notification settings updated', {
                description: 'Your notification preferences have been saved.',
            });
        } catch (error) {
            console.error('Error updating notification settings:', error);
            toast.error('Error', {
                description: 'Failed to update notification settings. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Channels</h3>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="emailNotifications"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Email Notifications</FormLabel>
                                        <FormDescription>
                                            Receive notifications via email
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="pushNotifications"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Push Notifications</FormLabel>
                                        <FormDescription>
                                            Receive notifications on your device
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Alert Types</h3>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="marketAlerts"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Market Alerts</FormLabel>
                                        <FormDescription>
                                            Get notified about major market movements
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="priceAlerts"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Price Alerts</FormLabel>
                                        <FormDescription>
                                            Get notified when stocks hit your price targets
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="newsAlerts"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">News Alerts</FormLabel>
                                        <FormDescription>
                                            Get notified about important news for your stocks
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="earningsAlerts"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Earnings Alerts</FormLabel>
                                        <FormDescription>
                                            Get notified about upcoming earnings reports
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="portfolioAlerts"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Portfolio Alerts</FormLabel>
                                        <FormDescription>
                                            Get notified about significant changes in your portfolio
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="watchlistAlerts"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Watchlist Alerts</FormLabel>
                                        <FormDescription>
                                            Get notified about significant movements in your watchlists
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Summary Reports</h3>

                    <FormField
                        control={form.control}
                        name="marketSummaries"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Market Summary Emails</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="daily" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Daily
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="weekly" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Weekly
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="none" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                None
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormDescription>
                                    How often you want to receive market summary emails
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="portfolioSummaries"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Portfolio Summary Emails</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="daily" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Daily
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="weekly" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Weekly
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="none" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                None
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormDescription>
                                    How often you want to receive portfolio summary emails
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save notification settings
                </Button>
            </form>
        </Form>
    );
}