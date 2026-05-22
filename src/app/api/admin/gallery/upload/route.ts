import { NextResponse } from 'next/server';
import { checkApiAuth } from '@/lib/api-auth';
import { promises as fs } from 'fs';
import path from 'path';

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
