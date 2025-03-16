import { redirect } from 'next/navigation';
import { Settings, User, Mail, Bell, Shield, Trash2, Github, Key, LineChart } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { requireAuth, getCurrentUser } from '@/lib/auth';
import ProfileForm from '@/components/settings/ProfileForm';
import EmailForm from '@/components/settings/EmailForm';
import PasswordForm from '@/components/settings/PasswordForm';
import NotificationSettings from '@/components/settings/NotificationSettings';
import DeleteAccountForm from '@/components/settings/DeleteAccountForm';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import ApiKeySettings from '@/components/settings/ApiKeySettings';
import ConnectedAccounts from '@/components/settings/ConnectedAccounts';
import ChartPreferences from '@/components/settings/ChartPreferences';

export const metadata = {
    title: 'Settings | Stock Analysis',
    description: 'Manage your account settings and preferences',
};

export default async function SettingsPage() {
    // Require authentication for this page
    await requireAuth();

    // Get current user
    const user = await getCurrentUser();

    if (!user) {
        redirect('/auth/signin');
    }

    return (
        <div className="container max-w-screen-xl mx-auto p-6">
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center">
                        <Settings className="mr-2 h-7 w-7" />
                        Settings
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences
                    </p>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/4">
                            <TabsList className="grid grid-cols-2 md:grid-cols-1 gap-2">
                                <TabsTrigger value="profile" className="justify-start">
                                    <User className="h-4 w-4 mr-2" />
                                    Profile
                                </TabsTrigger>
                                <TabsTrigger value="account" className="justify-start">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Account
                                </TabsTrigger>
                                <TabsTrigger value="notifications" className="justify-start">
                                    <Bell className="h-4 w-4 mr-2" />
                                    Notifications
                                </TabsTrigger>
                                <TabsTrigger value="security" className="justify-start">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Security
                                </TabsTrigger>
                                <TabsTrigger value="appearance" className="justify-start">
                                    <LineChart className="h-4 w-4 mr-2" />
                                    Appearance
                                </TabsTrigger>
                                <TabsTrigger value="api" className="justify-start">
                                    <Key className="h-4 w-4 mr-2" />
                                    API
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 space-y-6">
                            {/* Profile Settings */}
                            <TabsContent value="profile" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Personal Information</CardTitle>
                                        <CardDescription>
                                            Update your personal information and profile settings
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ProfileForm user={user} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Chart Preferences</CardTitle>
                                        <CardDescription>
                                            Customize how charts and data are displayed
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ChartPreferences user={user} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Account Settings */}
                            <TabsContent value="account" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Email Address</CardTitle>
                                        <CardDescription>
                                            Change the email address associated with your account
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EmailForm user={user} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Password</CardTitle>
                                        <CardDescription>
                                            Update your password to keep your account secure
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <PasswordForm user={user} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Connected Accounts</CardTitle>
                                        <CardDescription>
                                            Connect or disconnect third-party accounts
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ConnectedAccounts user={user} />
                                    </CardContent>
                                </Card>

                                <Card className="border-destructive">
                                    <CardHeader>
                                        <CardTitle className="text-destructive">Delete Account</CardTitle>
                                        <CardDescription>
                                            Permanently delete your account and all associated data
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <DeleteAccountForm user={user} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Notification Settings */}
                            <TabsContent value="notifications">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Notification Preferences</CardTitle>
                                        <CardDescription>
                                            Manage how and when you receive notifications
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <NotificationSettings user={user} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Security Settings */}
                            <TabsContent value="security" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Password</CardTitle>
                                        <CardDescription>
                                            Update your password to keep your account secure
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <PasswordForm user={user} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Two-Factor Authentication</CardTitle>
                                        <CardDescription>
                                            Add an additional layer of security to your account
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="p-6 text-center text-muted-foreground">
                                            Two-factor authentication is coming soon.
                                            Check back for updates.
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Appearance Settings */}
                            <TabsContent value="appearance">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Appearance</CardTitle>
                                        <CardDescription>
                                            Customize the appearance of the application
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <AppearanceSettings user={user} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* API Settings */}
                            <TabsContent value="api">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>API Keys</CardTitle>
                                        <CardDescription>
                                            Manage your API keys for programmatic access
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ApiKeySettings user={user} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}