import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import WeddingInvitationClient from './WeddingInvitationClient';

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate SEO Metadata dynamically
export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params;
  const config = await prisma.weddingConfig.findUnique({
    where: { slug },
  });

  if (!config) {
    return {
      title: 'Thiệp Cưới Online',
      description: 'Lời mời thành hôn từ cô dâu và chú rể.',
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const ogImageUrl = config.seoImage || config.heroImage;
  const faviconUrl = (config as { faviconUrl?: string }).faviconUrl;

  return {
    title: config.seoTitle,
    description: config.seoDescription,
    icons: faviconUrl
      ? {
          icon: faviconUrl,
          shortcut: faviconUrl,
          apple: faviconUrl,
        }
      : undefined,
    openGraph: {
      title: config.seoTitle,
      description: config.seoDescription,
      url: `${appUrl}/thiep/${slug}`,
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: `${config.groomShortName} & ${config.brideShortName}`,
            },
          ]
        : [],
      type: 'website',
      siteName: config.seoTitle,
    },
    twitter: {
      card: 'summary_large_image',
      title: config.seoTitle,
      description: config.seoDescription,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

export default async function WeddingPage({ params }: Props) {
  const { slug } = await params;

  // Retrieve Config with associations
  const config = await prisma.weddingConfig.findUnique({
    where: { slug },
    include: {
      timeline: {
        orderBy: { sortOrder: 'asc' },
      },
      gallery: {
        orderBy: { sortOrder: 'asc' },
      },
      wishes: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!config) {
    return notFound();
  }

  // Increment views count asynchronously (fire and forget on load)
  prisma.weddingConfig.update({
    where: { id: config.id },
    data: { viewsCount: { increment: 1 } },
  }).catch(err => console.error('Failed to increment views:', err));

  return <WeddingInvitationClient data={config} />;
}
