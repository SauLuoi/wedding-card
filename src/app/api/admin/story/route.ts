import { NextResponse } from 'next/server';
import { checkApiAuth } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

// GET all stories
export async function GET() {
  try {
    const config = await prisma.weddingConfig.findFirst();
    if (!config) {
      return NextResponse.json([]);
    }

    const stories = await prisma.storyTimeline.findMany({
      where: { weddingConfigId: config.id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error('Story GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create story
export async function POST(request: Request) {
  const auth = await checkApiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const config = await prisma.weddingConfig.findFirst();
    if (!config) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    const count = await prisma.storyTimeline.count({
      where: { weddingConfigId: config.id },
    });

    const story = await prisma.storyTimeline.create({
      data: {
        weddingConfigId: config.id,
        dateString: body.dateString || '',
        title: body.title || '',
        description: body.description || '',
        imageUrl: body.imageUrl || '',
        sortOrder: body.sortOrder ?? (count + 1),
      },
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error('Story POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT edit story or bulk reorder
export async function PUT(request: Request) {
  const auth = await checkApiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // If it's an array, it's a bulk reorder
    if (Array.isArray(body)) {
      for (const item of body) {
        await prisma.storyTimeline.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        });
      }
      return NextResponse.json({ success: true });
    }

    // Otherwise it is an edit of a single story
    const { id, dateString, title, description, imageUrl, sortOrder } = body;
    if (!id) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    const updated = await prisma.storyTimeline.update({
      where: { id },
      data: {
        dateString,
        title,
        description,
        imageUrl,
        sortOrder,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Story PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE a story
export async function DELETE(request: Request) {
  const auth = await checkApiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    await prisma.storyTimeline.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Story DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
