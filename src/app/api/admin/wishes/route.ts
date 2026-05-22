import { NextResponse } from 'next/server';
import { checkApiAuth } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

// GET all wishes for moderation
export async function GET() {
  const auth = await checkApiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const config = await prisma.weddingConfig.findFirst();
    if (!config) {
      return NextResponse.json([]);
    }

    const wishes = await prisma.wish.findMany({
      where: { weddingConfigId: config.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(wishes);
  } catch (error) {
    console.error('Wishes GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH toggle isApproved
export async function PATCH(request: Request) {
  const auth = await checkApiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, isApproved } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Wish ID is required' }, { status: 400 });
    }

    const updated = await prisma.wish.update({
      where: { id },
      data: { isApproved: Boolean(isApproved) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Wishes PATCH Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE a wish
export async function DELETE(request: Request) {
  const auth = await checkApiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Wish ID is required' }, { status: 400 });
    }

    await prisma.wish.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wishes DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
