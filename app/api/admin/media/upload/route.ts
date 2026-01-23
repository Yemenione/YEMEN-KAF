
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const folderContext = formData.get('folder') as string || 'general';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Create directory structure: public/uploads/YYYY/MM
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const relativeDir = `/uploads/${year}/${month}`;
        const uploadDir = join(process.cwd(), 'public', relativeDir);

        // Check if we are running in a serverless environment (e.g. Vercel) where FS might be read-only.
        // We log a warning but attempt to proceed if not explicitly on Vercel.
        if (process.env.VERCEL) {
            console.warn("Uploads to local filesystem may not be supported on Vercel. Ensure a persistent disk or cloud storage is configured.");
        }

        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename to prevent collisions
        // sanitize original name
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const uniqueFilename = `${Date.now()}-${Math.floor(Math.random() * 1000)}-${safeName}`;
        const filePath = join(uploadDir, uniqueFilename);
        const relativePath = `${relativeDir}/${uniqueFilename}`;

        // Write file to disk
        await writeFile(filePath, buffer);

        // Save to Database
        const media = await prisma.media.create({
            data: {
                filename: uniqueFilename,
                originalName: file.name,
                path: relativePath,
                mimeType: file.type,
                size: file.size,
                altText: '',
                folder: folderContext
            }
        });

        return NextResponse.json({
            ...media,
            url: media.path
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed', details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
