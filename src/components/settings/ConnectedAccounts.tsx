// In each component file (e.g., ConnectedAccountsForm.tsx)
import React from 'react';
import {UserProps} from "@/types/settings";

interface ConnectedAccountsFormProps {
    user: UserProps;
}

const ConnectedAccountsForm: React.FC<ConnectedAccountsFormProps> = ({ user }) => {
    console.log(user);
    return (
        <div className="p-4 text-center bg-muted rounded-lg">
            <p className="text-muted-foreground">This feature is coming soon.</p>
        </div>
    );
};

export default ConnectedAccountsForm;