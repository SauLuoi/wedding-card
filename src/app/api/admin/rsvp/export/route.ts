import { NextResponse } from 'next/server';
import { checkApiAuth } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const auth = await checkApiAuth();
  if (!auth) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const config = await prisma.weddingConfig.findFirst();
    if (!config) {
      return new Response('Config not found', { status: 404 });
    }

    const rsvps = await prisma.rsvp.findMany({
      where: { weddingConfigId: config.id },
      orderBy: { createdAt: 'desc' },
    });

    // Define CSV Headers
    const headers = ['Họ và Tên', 'Số Điện Thoại', 'Số Lượng Đi Cùng', 'Lời Chúc / Ghi Chú', 'Thời Gian Gửi'];
    
    // Generate CSV lines
    const csvRows = rsvps.map(r => [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.phone.replace(/"/g, '""')}"`,
      r.guestsCount,
      `"${r.wishes.replace(/"/g, '""')}"`,
      `"${new Date(r.createdAt).toLocaleString('vi-VN')}"`
    ]);

    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    
    // Add UTF-8 BOM (\ufeff) to make Excel parse Vietnamese characters correctly
    const bom = '\ufeff';
    const csvData = bom + csvContent;

    return new Response(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="danh-sach-rsvp.csv"',
      },
    });
  } catch (error) {
    console.error('Export RSVP Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
