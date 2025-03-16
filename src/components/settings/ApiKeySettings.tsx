// In each component file (e.g., ApiKeySettingsForm.tsx)
import React from 'react';

interface ApiKeySettingsFormProps {
    user: any;
}

const ApiKeySettingsForm: React.FC<ApiKeySettingsFormProps> = ({ user }) => {
    return (
        <div className="p-4 text-center bg-muted rounded-lg">
            <p className="text-muted-foreground">This feature is coming soon.</p>
        </div>
    );
};

export default ApiKeySettingsForm;