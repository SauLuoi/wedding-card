import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const config = await prisma.weddingConfig.findUnique({
      where: { slug },
    });

    if (!config) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    const updated = await prisma.weddingConfig.update({
      where: { id: config.id },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true, viewsCount: updated.viewsCount });
  } catch (error) {
    console.error('Increment Views Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
