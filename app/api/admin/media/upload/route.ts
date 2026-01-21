
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

        // Check if we are running in a serverless environment (Vercel) where FS is read-only
        if (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV) {
            console.error("Uploads to local filesystem are not supported on Vercel. Please configure S3/Blob storage.");
            return NextResponse.json(
                { error: 'Configuration Error', details: "Local file uploads not supported in production. Please configure S3 or Cloudinary." },
                { status: 501 } // Not Implemented
            );
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

        return NextResponse.json(media);

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed', details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
