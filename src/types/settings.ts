export interface UserProps {
    id: string;
    name?: string;
    username?: string;
    bio?: string;
    email?: string;
    image?: string;
    createdAt?: string;
    updatedAt?: string;
    emailVerified?: string | null;
    preferences?: Record<string, unknown>;
}