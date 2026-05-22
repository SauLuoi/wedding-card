import { NextResponse } from 'next/server';
import { checkApiAuth } from '@/lib/api-auth';

// Route Segment Config
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

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
      return NextResponse.json(
        { error: 'File quá lớn. Tối đa 20MB.' },
        { status: 413 }
      );
    }

    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${timestamp}_${cleanFileName}`;

    // ── Vercel Blob (production) ──────────────────────────────────────────
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');

      const blob = await put(`uploads/${fileName}`, file, {
        access: 'public',
        contentType: file.type || 'application/octet-stream',
      });

      return NextResponse.json({ success: true, url: blob.url });
    }

    // ── Local disk fallback (development) ────────────────────────────────
    const { promises: fs } = await import('fs');
    const path = await import('path');

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${fileName}`;
    return NextResponse.json({ success: true, url: relativeUrl });
  } catch (error) {
    console.error('File Upload Error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tải ảnh lên. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
