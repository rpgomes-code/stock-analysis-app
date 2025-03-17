// In each component file (e.g., EmailForm.tsx)
import React from 'react';
import {UserProps} from "@/types/settings";

interface EmailFormProps {
    user: UserProps;
}

const EmailForm: React.FC<EmailFormProps> = ({ user }) => {
    console.log(user);
    return (
        <div className="p-4 text-center bg-muted rounded-lg">
            <p className="text-muted-foreground">This feature is coming soon.</p>
        </div>
    );
};

export default EmailForm;