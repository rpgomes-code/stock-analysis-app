// In each component file (e.g., ConnectedAccountsForm.tsx)
import React from 'react';

interface ConnectedAccountsFormProps {
    user: any;
}

const ConnectedAccountsForm: React.FC<ConnectedAccountsFormProps> = ({ user }) => {
    return (
        <div className="p-4 text-center bg-muted rounded-lg">
            <p className="text-muted-foreground">This feature is coming soon.</p>
        </div>
    );
};

export default ConnectedAccountsForm;