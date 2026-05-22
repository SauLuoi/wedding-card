import { NextResponse } from 'next/server';
import { checkApiAuth } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

// GET all gallery images
export async function GET() {
  try {
    const config = await prisma.weddingConfig.findFirst();
    if (!config) {
      return NextResponse.json([]);
    }

    const images = await prisma.galleryImage.findMany({
      where: { weddingConfigId: config.id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Gallery GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST add image url
export async function POST(request: Request) {
  const auth = await checkApiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const config = await prisma.weddingConfig.findFirst();
    if (!config) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    const count = await prisma.galleryImage.count({
      where: { weddingConfigId: config.id },
    });

    const image = await prisma.galleryImage.create({
      data: {
        weddingConfigId: config.id,
        url,
        sortOrder: count + 1,
      },
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error('Gallery POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT bulk sort reorder
export async function PUT(request: Request) {
  const auth = await checkApiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const items = await request.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Array of items expected' }, { status: 400 });
    }

    for (const item of items) {
      await prisma.galleryImage.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Gallery PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE an image
export async function DELETE(request: Request) {
  const auth = await checkApiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    await prisma.galleryImage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Gallery DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
