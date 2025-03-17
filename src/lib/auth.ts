// src/lib/auth.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import db from "./db"; // Updated to use the server-only db instance

export async function getSession() {
    return await getServerSession(authOptions);
}

export async function getCurrentUser() {
    const session = await getSession();

    if (!session?.user?.email) {
        return null;
    }

    const currentUser = await db.user.findUnique({
        where: {
            email: session.user.email
        }
    });

    if (!currentUser) {
        return null;
    }

    return {
        ...currentUser,
        createdAt: currentUser.createdAt.toISOString(),
        updatedAt: currentUser.updatedAt.toISOString(),
        emailVerified: currentUser.emailVerified?.toISOString() || null
    };
}

export async function requireAuth() {
    const session = await getSession();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    return session;
}