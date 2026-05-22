import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminSidebar from './AdminSidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const payload = verifyToken(token);
  if (!payload) {
    redirect('/admin/login');
  }

  // Get current wedding config slug to create a live preview link
  const config = await prisma.weddingConfig.findFirst();
  const slug = config?.slug || 'demo-couple';

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex">
      {/* Sidebar navigation */}
      <AdminSidebar slug={slug} username={payload.username} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden min-h-screen">
        <header className="h-16 border-b border-gold-200/20 bg-white flex items-center justify-between px-8 select-none">
          <h1 className="font-serif text-lg font-bold text-gray-800">Hệ Thống Quản Trị Thiệp Cưới</h1>
          
          <div className="flex items-center gap-4">
            <a 
              href={`/thiep/${slug}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-semibold px-4 py-2 border border-gold-300 rounded-full text-gold-700 bg-gold-50/50 hover:bg-gold-50 transition"
            >
              Xem Trang Thiệp ↗
            </a>
            <div className="text-xs text-gray-500">
              Xin chào, <span className="font-bold text-gray-700">{payload.username}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
