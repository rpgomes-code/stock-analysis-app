'use client';

import React from 'react';
import {UserProps} from "@/types/settings";

interface ChartPreferencesProps {
    user: UserProps;
}

const ChartPreferences: React.FC<ChartPreferencesProps> = ({ user }) => {
    console.log(user);
    return (
        <div className="p-4 text-center bg-muted rounded-lg">
            <p className="text-muted-foreground">Chart preferences settings coming soon.</p>
        </div>
    );
};

export default ChartPreferences;