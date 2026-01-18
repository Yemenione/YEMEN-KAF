import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

// GET /api/products/[slug]/reviews
export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const product = await prisma.product.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const reviews = await prisma.review.findMany({
            where: {
                productId: product.id,
                isActive: true // Only show approved/active reviews
            },
            include: {
                patient: { // Using 'patient' as per schema relation name for customer
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate average
        const aggregations = await prisma.review.aggregate({
            where: { productId: product.id, isActive: true },
            _avg: { rating: true },
            _count: { rating: true }
        });

        return NextResponse.json({
            reviews,
            average: aggregations._avg.rating || 0,
            count: aggregations._count.rating || 0
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST /api/products/[slug]/reviews
export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token");

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let userId: number;
        try {
            const decoded = jwt.verify(token.value, JWT_SECRET) as any;
            userId = decoded.userId;
        } catch (e) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const body = await request.json();
        const { rating, comment } = body;

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
        }

        const product = await prisma.product.findUnique({
            where: { slug: slug },
            select: { id: true }
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Check verification (has user bought this item?)
        // simplified check: look for any order item with this product for this user
        const purchase = await prisma.orderItem.findFirst({
            where: {
                order: { customerId: userId },
                productId: product.id
            }
        });

        const isVerified = !!purchase;

        const review = await prisma.review.create({
            data: {
                rating,
                comment,
                isVerified,
                customerId: userId,
                productId: product.id,
                isActive: true
            }
        });

        return NextResponse.json(review);

    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
