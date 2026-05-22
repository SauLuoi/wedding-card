import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const config = await prisma.weddingConfig.findUnique({
      where: { slug },
    });

    if (!config) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    const wishes = await prisma.wish.findMany({
      where: {
        weddingConfigId: config.id,
        isApproved: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(wishes);
  } catch (error) {
    console.error('Public Wishes GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
