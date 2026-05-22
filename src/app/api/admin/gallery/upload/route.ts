// app/api/admin/gallery/upload/route.ts

import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public/uploads');

    await mkdir(uploadDir, { recursive: true });

    const fileName =
      Date.now() + '-' + Math.random().toString(36).substring(2) + '.webp';

    const outputPath = path.join(uploadDir, fileName);

    await sharp(buffer)
      .resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: 85,
      })
      .toFile(outputPath);

    return NextResponse.json({
      url: `/uploads/${fileName}`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: String(error),
      },
      { status: 500 }
    );
  }
}