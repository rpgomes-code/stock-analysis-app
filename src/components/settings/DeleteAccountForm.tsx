// In each component file (e.g., DeleteAccountForm.tsx)
import React from 'react';

interface DeleteAccountFormProps {
    user: any;
}

const DeleteAccountForm: React.FC<DeleteAccountFormProps> = ({ user }) => {
    return (
        <div className="p-4 text-center bg-muted rounded-lg">
            <p className="text-muted-foreground">This feature is coming soon.</p>
        </div>
    );
};

export default DeleteAccountForm;