import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        const attribute = await prisma.attribute.findUnique({
            where: { id },
            include: { values: { orderBy: { position: 'asc' } } }
        });

        if (!attribute) {
            return NextResponse.json({ error: 'Attribute not found' }, { status: 404 });
        }

        return NextResponse.json(attribute);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch attribute' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        const body = await req.json();
        const { name, publicName, type, values, translations } = body;

        // Transaction to handle updates and nested values
        const updatedAttribute = await prisma.$transaction(async (tx) => {
            // Update parent
            await tx.attribute.update({
                where: { id },
                data: {
                    name,
                    publicName,
                    type,
                    translations: translations || {}
                }
            });

            // Handle values:
            // 1. Delete values not in the new list (if they have IDs)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const keepIds = values.filter((v: any) => v.id).map((v: any) => v.id);
            await tx.attributeValue.deleteMany({
                where: {
                    attributeId: id,
                    id: { notIn: keepIds }
                }
            });

            // 2. Upsert (Update existing, Create new)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const val of values as any[]) {
                if (val.id) {
                    await tx.attributeValue.update({
                        where: { id: val.id },
                        data: {
                            name: val.name,
                            value: val.value,
                            position: val.position,
                            translations: val.translations || {}
                        }
                    });
                } else {
                    await tx.attributeValue.create({
                        data: {
                            attributeId: id,
                            name: val.name,
                            value: val.value,
                            position: val.position,
                            translations: val.translations || {}
                        }
                    });
                }
            }

            return tx.attribute.findUnique({
                where: { id },
                include: { values: true }
            });
        });

        return NextResponse.json(updatedAttribute);

    } catch (error) {
        console.error("Update Attribute Error:", error);
        return NextResponse.json({ error: 'Failed to update attribute' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        await prisma.attribute.delete({ where: { id } });
        return NextResponse.json({ success: true, message: 'Attribute deleted' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete attribute' }, { status: 500 });
    }
}
