import { NextResponse } from 'next/server';
import { checkApiAuth } from '@/lib/api-auth';
import { promises as fs } from 'fs';
import path from 'path';

// Increase body size limit to 20MB for image uploads
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// Next.js App Router body size config
export const fetchCache = 'force-no-store';

// Route config: increase body limit to 20MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
    responseLimit: '20mb',
  },
};

export async function POST(request: Request) {
  const auth = await checkApiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file size: max 20MB
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File quá lớn. Tối đa 20MB.' }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique file name
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${timestamp}_${cleanFileName}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save to disk
    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: relativeUrl 
    });
  } catch (error) {
    console.error('File Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
