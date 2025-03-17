'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Sun, Moon, Laptop } from 'lucide-react';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/components/theme/ThemeProvider';
import {UserProps} from "@/types/settings";

// Form schema validation
const appearanceFormSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']),
    fontSize: z.enum(['sm', 'md', 'lg', 'xl']),
    colorScheme: z.enum(['default', 'blue', 'green', 'purple', 'orange']),
    dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
    numberFormat: z.enum(['en-US', 'en-GB', 'de-DE', 'fr-FR', 'ja-JP']),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

interface AppearanceSettingsProps {
    user: UserProps;
}

export default function AppearanceSettings({ user }: AppearanceSettingsProps) {
    const { theme, setTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);

    console.log(user); // Placeholder usage of the `user` prop

    // Default form values
    const defaultValues: Partial<AppearanceFormValues> = {
        theme: theme as 'light' | 'dark' | 'system',
        fontSize: 'md',
        colorScheme: 'default',
        dateFormat: 'MM/DD/YYYY',
        numberFormat: 'en-US',
    };

    // Initialize form
    const form = useForm<AppearanceFormValues>({
        resolver: zodResolver(appearanceFormSchema),
        defaultValues,
    });

    // Form submission handler
    async function onSubmit(data: AppearanceFormValues) {
        setIsLoading(true);

        try {
            // Update theme
            setTheme(data.theme);

            // In a real app, this would be an API call to save other preferences
            // await fetch('/api/user/appearance', {
            //   method: 'PATCH',
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify(data),
            // });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Appearance settings updated');
        } catch (error) {
            console.error('Error updating appearance settings:', error);
            toast.error('Failed to update appearance settings.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel>Theme</FormLabel>
                            <FormDescription>
                                Select the theme for the application
                            </FormDescription>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        setTheme(value as 'light' | 'dark' | 'system');
                                    }}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                >
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <RadioGroupItem
                                                value="light"
                                                id="theme-light"
                                                className="peer sr-only"
                                            />
                                            <label
                                                htmlFor="theme-light"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                            >
                                                <Sun className="mb-3 h-6 w-6" />
                                                <span className="text-sm font-medium">Light</span>
                                            </label>
                                        </div>
                                        <div>
                                            <RadioGroupItem
                                                value="dark"
                                                id="theme-dark"
                                                className="peer sr-only"
                                            />
                                            <label
                                                htmlFor="theme-dark"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                            >
                                                <Moon className="mb-3 h-6 w-6" />
                                                <span className="text-sm font-medium">Dark</span>
                                            </label>
                                        </div>
                                        <div>
                                            <RadioGroupItem
                                                value="system"
                                                id="theme-system"
                                                className="peer sr-only"
                                            />
                                            <label
                                                htmlFor="theme-system"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                            >
                                                <Laptop className="mb-3 h-6 w-6" />
                                                <span className="text-sm font-medium">System</span>
                                            </label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="fontSize"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Font Size</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select font size" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="sm">Small</SelectItem>
                                        <SelectItem value="md">Medium</SelectItem>
                                        <SelectItem value="lg">Large</SelectItem>
                                        <SelectItem value="xl">Extra Large</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Adjust the text size throughout the application
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="colorScheme"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Color Scheme</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select color scheme" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="default">Default</SelectItem>
                                        <SelectItem value="blue">Blue</SelectItem>
                                        <SelectItem value="green">Green</SelectItem>
                                        <SelectItem value="purple">Purple</SelectItem>
                                        <SelectItem value="orange">Orange</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Choose the primary color scheme for the interface
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Format Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="dateFormat"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date Format</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select date format" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        How dates will be displayed throughout the application
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="numberFormat"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Number Format</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select number format" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="en-US">US (1,234.56)</SelectItem>
                                            <SelectItem value="en-GB">UK (1,234.56)</SelectItem>
                                            <SelectItem value="de-DE">German (1.234,56)</SelectItem>
                                            <SelectItem value="fr-FR">French (1 234,56)</SelectItem>
                                            <SelectItem value="ja-JP">Japanese (1,234.56)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        How numbers will be formatted throughout the application
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Preview</h3>
                    <Tabs defaultValue="light" className="w-full">
                        <TabsList>
                            <TabsTrigger value="light">Light</TabsTrigger>
                            <TabsTrigger value="dark">Dark</TabsTrigger>
                        </TabsList>
                        <TabsContent value="light" className="p-4 rounded-md border mt-4 bg-white">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-black">Light Theme Preview</h4>
                                <div className="flex space-x-4">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                                    <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                                    <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
                                    <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                                </div>
                                <div className="p-2 bg-gray-100 text-black rounded-md">
                                    Sample text in different sizes:
                                    <div className="text-sm my-1">Small text</div>
                                    <div className="text-base my-1">Medium text</div>
                                    <div className="text-lg my-1">Large text</div>
                                    <div className="text-xl my-1">Extra large text</div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="dark" className="p-4 rounded-md border mt-4 bg-gray-900">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-white">Dark Theme Preview</h4>
                                <div className="flex space-x-4">
                                    <div className="w-8 h-8 bg-blue-400 rounded-full"></div>
                                    <div className="w-8 h-8 bg-green-400 rounded-full"></div>
                                    <div className="w-8 h-8 bg-purple-400 rounded-full"></div>
                                    <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
                                </div>
                                <div className="p-2 bg-gray-800 text-white rounded-md">
                                    Sample text in different sizes:
                                    <div className="text-sm my-1">Small text</div>
                                    <div className="text-base my-1">Medium text</div>
                                    <div className="text-lg my-1">Large text</div>
                                    <div className="text-xl my-1">Extra large text</div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save appearance settings
                </Button>
            </form>
        </Form>
    );
}