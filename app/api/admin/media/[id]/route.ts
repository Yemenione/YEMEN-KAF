
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Correct type for Next.js 15+ dynamic params
) {
    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // 1. Find record to get path
        const media = await prisma.media.findUnique({
            where: { id }
        });

        if (!media) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // 2. Delete from Database first (avoid orphan DB records if FS fails, though transactional ideally better)
        await prisma.media.delete({
            where: { id }
        });

        // 3. Delete from Disk
        try {
            const absolutePath = join(process.cwd(), 'public', media.path);
            await unlink(absolutePath);
        } catch (fsError) {
            console.warn(`Failed to delete file from disk: ${media.path}`, fsError);
            // We still return success because DB record is gone
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Delete failed', details: error.message },
            { status: 500 }
        );
    }
}
