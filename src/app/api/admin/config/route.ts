import { NextResponse } from 'next/server';
import { checkApiAuth } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

// GET the first config
export async function GET() {
  try {
    const config = await prisma.weddingConfig.findFirst({
      include: {
        timeline: { orderBy: { sortOrder: 'asc' } },
        gallery: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Config API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST to update or create config
export async function POST(request: Request) {
  const auth = await checkApiAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const config = await prisma.weddingConfig.findFirst();

    const data = {
      slug: body.slug || 'hoang-minh-thao-vy',
      brideName: body.brideName || '',
      brideShortName: body.brideShortName || '',
      groomName: body.groomName || '',
      groomShortName: body.groomShortName || '',
      weddingDate: body.weddingDate ? new Date(body.weddingDate) : new Date(),
      locationName: body.locationName || '',
      locationAddress: body.locationAddress || '',
      googleMapsEmbedUrl: body.googleMapsEmbedUrl || '',
      googleMapsDirectionUrl: body.googleMapsDirectionUrl || '',
      musicUrl: body.musicUrl || '',
      themeColor: body.themeColor || '#d4af37',
      fontFamily: body.fontFamily || 'Playfair Display',
      seoTitle: body.seoTitle || '',
      seoDescription: body.seoDescription || '',
      seoImage: body.seoImage || '',
      heroImage: body.heroImage || '',
      aboutTitle: body.aboutTitle || 'Love Story',
      aboutText: body.aboutText || '',
      brideAbout: body.brideAbout || '',
      groomAbout: body.groomAbout || '',
      brideImage: body.brideImage || '',
      groomImage: body.groomImage || '',
      groomQrUrl: body.groomQrUrl || '',
      groomBankName: body.groomBankName || '',
      groomAccountNumber: body.groomAccountNumber || '',
      groomAccountName: body.groomAccountName || '',
      brideQrUrl: body.brideQrUrl || '',
      brideBankName: body.brideBankName || '',
      brideAccountNumber: body.brideAccountNumber || '',
      brideAccountName: body.brideAccountName || '',
    };

    let updatedConfig;

    if (config) {
      updatedConfig = await prisma.weddingConfig.update({
        where: { id: config.id },
        data,
      });
    } else {
      updatedConfig = await prisma.weddingConfig.create({
        data,
      });
    }

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('Config Update API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
