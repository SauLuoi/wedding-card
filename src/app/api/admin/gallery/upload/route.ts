import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; //2GB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          error: 'Không tìm thấy file',
        },
        {
          status: 400,
        }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'Ảnh vượt quá 10MB',
        },
        {
          status: 400,
        }
      );
    }

    // Validate image type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Chỉ hỗ trợ JPG, PNG, WEBP',
        },
        {
          status: 400,
        }
      );
    }

    // Convert file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload folder
    const uploadDir = path.join(process.cwd(), 'public/uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, {
        recursive: true,
      });
    }

    // Generate file name
    const timestamp = Date.now();

    const originalName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/\s+/g, '-')
      .toLowerCase();

    const fileName = `${timestamp}-${originalName}.webp`;

    const filePath = path.join(uploadDir, fileName);

    // Convert -> WEBP + resize
    await sharp(buffer)
      .rotate()
      .resize({
        width: 2000,
        withoutEnlargement: true,
      })
      .webp({
        quality: 80,
      })
      .toFile(filePath);

    return NextResponse.json({
      success: true,
      url: `/uploads/${fileName}`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: 'Upload thất bại',
      },
      {
        status: 500,
      }
    );
  }
}