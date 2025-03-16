// In each component file (e.g., PasswordForm.tsx)
import React from 'react';

interface PasswordFormProps {
    user: any;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ user }) => {
    return (
        <div className="p-4 text-center bg-muted rounded-lg">
            <p className="text-muted-foreground">This feature is coming soon.</p>
        </div>
    );
};

export default PasswordForm;