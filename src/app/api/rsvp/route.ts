import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { slug, name, phone, guestsCount, wishes } = await request.json();

    if (!slug || !name || !phone) {
      return NextResponse.json({ error: 'Slug, name, and phone are required' }, { status: 400 });
    }

    const config = await prisma.weddingConfig.findUnique({
      where: { slug },
    });

    if (!config) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    // Create RSVP
    const rsvp = await prisma.rsvp.create({
      data: {
        weddingConfigId: config.id,
        name,
        phone,
        guestsCount: Number(guestsCount) || 1,
        wishes: wishes || '',
      },
    });

    // If wishes is provided, also create a Wish
    if (wishes && wishes.trim()) {
      await prisma.wish.create({
        data: {
          weddingConfigId: config.id,
          name,
          content: wishes,
          isApproved: true, // Default to approved, admin can hide/delete later
        },
      });
    }

    return NextResponse.json({ success: true, rsvp });
  } catch (error) {
    console.error('Public RSVP Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
