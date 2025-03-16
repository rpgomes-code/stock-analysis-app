import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import logger from "@/lib/logger";

const prisma = new PrismaClient();

// User registration schema
const userSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    name: z.string().min(1, { message: "Name is required" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate input data
        const result = userSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { message: "Invalid input data", errors: result.error.errors },
                { status: 400 }
            );
        }

        const { email, name, password } = result.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Hash the password
        const hashedPassword = await hash(password, 10);

        // Create a new user
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        logger.info(`New user registered: ${email}`);

        return NextResponse.json(
            {
                message: "User registered successfully",
                user,
            },
            { status: 201 }
        );
    } catch (error: any) {
        logger.error(`Registration error: ${error.message}`, { error });
        return NextResponse.json(
            { message: "An error occurred during registration" },
            { status: 500 }
        );
    }
}