// In each component file (e.g., ApiKeySettingsForm.tsx)
import React from 'react';
import {UserProps} from "@/types/settings";

interface ApiKeySettingsFormProps {
    user: UserProps;
}

const ApiKeySettingsForm: React.FC<ApiKeySettingsFormProps> = ({ user }) => {
    console.log(user);
    return (
        <div className="p-4 text-center bg-muted rounded-lg">
            <p className="text-muted-foreground">This feature is coming soon.</p>
        </div>
    );
};

export default ApiKeySettingsForm;