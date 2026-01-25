import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file received" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name.replaceAll(" ", "_");
        const uniqueFilename = `${uuidv4()}-${filename}`;

        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads/reviews");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore error if directory already exists
            console.log("Directory might exist", e);
        }

        const filePath = path.join(uploadDir, uniqueFilename);

        await writeFile(filePath, buffer);

        return NextResponse.json({
            url: `/uploads/reviews/${uniqueFilename}`,
            success: true
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
