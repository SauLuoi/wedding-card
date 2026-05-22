import { NextResponse } from 'next/server';
import { checkApiAuth } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const auth = await checkApiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // We assume there's a default wedding config. In a multi-tenant system we'd check by slug,
    // but here we grab the first config.
    const config = await prisma.weddingConfig.findFirst();
    if (!config) {
      return NextResponse.json({
        totalRsvps: 0,
        totalGuests: 0,
        totalWishes: 0,
        viewsCount: 0,
        recentRsvps: [],
        recentWishes: [],
      });
    }

    const totalRsvps = await prisma.rsvp.count({
      where: { weddingConfigId: config.id },
    });

    const guestsAgg = await prisma.rsvp.aggregate({
      _sum: { guestsCount: true },
      where: { weddingConfigId: config.id },
    });
    const totalGuests = guestsAgg._sum.guestsCount || 0;

    const totalWishes = await prisma.wish.count({
      where: { weddingConfigId: config.id },
    });

    const recentRsvps = await prisma.rsvp.findMany({
      where: { weddingConfigId: config.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentWishes = await prisma.wish.findMany({
      where: { weddingConfigId: config.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      totalRsvps,
      totalGuests,
      totalWishes,
      viewsCount: config.viewsCount,
      recentRsvps,
      recentWishes,
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
