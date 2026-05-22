import { NextResponse } from 'next/server';
import { checkApiAuth } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

// GET all RSVPs
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

    const rsvps = await prisma.rsvp.findMany({
      where: { weddingConfigId: config.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rsvps);
  } catch (error) {
    console.error('RSVP GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE RSVP
export async function DELETE(request: Request) {
  const auth = await checkApiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'RSVP ID is required' }, { status: 400 });
    }

    await prisma.rsvp.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('RSVP DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
