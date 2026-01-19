
import { NextRequest, NextResponse } from 'next/server';
import { importProductsFromCSV } from '@/lib/services/import-service';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const text = await file.text();
        const result = await importProductsFromCSV(text);

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: 'Import failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
