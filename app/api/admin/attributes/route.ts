import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPermission } from '@/lib/admin-auth';
import { Permission } from '@/lib/rbac';

export async function GET() {
    try {
        const { authorized, response } = await verifyPermission(Permission.MANAGE_ATTRIBUTES);
        if (!authorized) return response;
        const attributes = await prisma!.attribute.findMany({
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: Record<string, any>;
}

export async function POST(req: NextRequest) {
    try {
        const { authorized, response } = await verifyPermission(Permission.MANAGE_ATTRIBUTES);
        if (!authorized) return response;

        const body = await req.json();
        const { name, publicName, type, values, translations } = body;

        const attribute = await prisma!.attribute.create({
            data: {
                name,
                publicName,
                type,
                translations: (translations || {}) as any,
                values: {
                    create: (values || []).map((v: AttributeValueInput) => ({
                        name: v.name,
                        value: v.value,
                        position: v.position || 0,
                        translations: v.translations || {}
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
