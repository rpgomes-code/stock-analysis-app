// In each component file (e.g., EmailForm.tsx)
import React from 'react';

interface EmailFormProps {
    user: any;
}

const EmailForm: React.FC<EmailFormProps> = ({ user }) => {
    return (
        <div className="p-4 text-center bg-muted rounded-lg">
            <p className="text-muted-foreground">This feature is coming soon.</p>
        </div>
    );
};

export default EmailForm;