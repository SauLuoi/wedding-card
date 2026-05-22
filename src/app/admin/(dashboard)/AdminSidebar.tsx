'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Settings, 
  Heart, 
  Image as ImageIcon, 
  Users, 
  MessageSquare,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  slug: string;
  username: string;
}

export default function AdminSidebar({ slug, username }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (res.ok) {
        router.push('/admin/login');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { label: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
    { label: 'Thông tin & Giao diện', href: '/admin/config', icon: Settings },
    { label: 'Câu chuyện tình yêu', href: '/admin/story', icon: Heart },
    { label: 'Album ảnh cưới', href: '/admin/gallery', icon: ImageIcon },
    { label: 'Khách mời RSVP', href: '/admin/rsvp', icon: Users },
    { label: 'Lời chúc của khách', href: '/admin/wishes', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-[#1a1a1a] text-[#efefef] flex flex-col justify-between border-r border-gold-800/20 select-none">
      <div className="flex flex-col">
        {/* Logo brand */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-white/5">
          <Heart className="w-5 h-5 text-gold-400 fill-current" />
          <span className="font-serif text-md font-bold tracking-wider gold-text-gradient">Wedding Admin</span>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                  isActive 
                    ? 'bg-gold-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout / User Info bottom block */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-2">
        <div className="px-4 py-2 bg-white/5 rounded-xl text-center text-xs text-gray-500">
          Tài khoản: <span className="font-bold text-gray-300">{username}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
