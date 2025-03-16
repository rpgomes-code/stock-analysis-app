'use client';

import React from 'react';

interface ChartPreferencesProps {
    user: any;
}

const ChartPreferences: React.FC<ChartPreferencesProps> = ({ user }) => {
    return (
        <div className="p-4 text-center bg-muted rounded-lg">
            <p className="text-muted-foreground">Chart preferences settings coming soon.</p>
        </div>
    );
};

export default ChartPreferences;