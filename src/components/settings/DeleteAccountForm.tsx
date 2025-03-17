// In each component file (e.g., DeleteAccountForm.tsx)
import React from 'react';
import {UserProps} from "@/types/settings";

interface DeleteAccountFormProps {
    user: UserProps;
}

const DeleteAccountForm: React.FC<DeleteAccountFormProps> = ({ user }) => {
    console.log(user);
    return (
        <div className="p-4 text-center bg-muted rounded-lg">
            <p className="text-muted-foreground">This feature is coming soon.</p>
        </div>
    );
};

export default DeleteAccountForm;