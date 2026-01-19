import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const attributes = await prisma.attribute.findMany({
            include: {
                values: true
            },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(attributes);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch attributes' }, { status: 500 });
    }
}

interface AttributeValueInput {
    name: string;
    value: string;
    position?: number;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, publicName, type, values } = body;

        const attribute = await prisma.attribute.create({
            data: {
                name,
                publicName,
                type,
                values: {
                    create: values.map((v: AttributeValueInput) => ({
                        name: v.name,
                        value: v.value,
                        position: v.position || 0
                    }))
                }
            },
            include: { values: true }
        });

        return NextResponse.json(attribute);
    } catch (error) {
        console.error('Create Attribute Error:', error);
        return NextResponse.json({ error: 'Failed to create attribute' }, { status: 500 });
    }
}
