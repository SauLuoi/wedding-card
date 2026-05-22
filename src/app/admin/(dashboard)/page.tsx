'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Users, MessageSquare, Heart, Clock } from 'lucide-react';

interface Rsvp {
  id: string;
  name: string;
  phone: string;
  guestsCount: number;
  wishes: string;
  createdAt: string;
}

interface Wish {
  id: string;
  name: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalRsvps: number;
  totalGuests: number;
  totalWishes: number;
  viewsCount: number;
  recentRsvps: Rsvp[];
  recentWishes: Wish[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard statistics:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-red-500">
        Không thể tải dữ liệu thống kê tổng quan.
      </div>
    );
  }

  const statCards = [
    { title: 'Lượt xem thiệp', value: stats.viewsCount, icon: Eye, color: 'bg-blue-50 text-blue-600 border-blue-200/50' },
    { title: 'Khách xác nhận RSVP', value: stats.totalRsvps, icon: Users, color: 'bg-green-50 text-green-600 border-green-200/50' },
    { title: 'Tổng số người tham gia', value: stats.totalGuests, icon: Heart, color: 'bg-red-50 text-red-600 border-red-200/50' },
    { title: 'Lời chúc đã nhận', value: stats.totalWishes, icon: MessageSquare, color: 'bg-purple-50 text-purple-600 border-purple-200/50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* Page Title */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-gray-800">Tổng quan báo cáo</h2>
        <p className="text-gray-500 text-xs mt-1">Dữ liệu thống kê thời gian thực của trang thiệp cưới</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`p-6 rounded-2xl bg-white border shadow-xs flex items-center justify-between ${card.color}`}>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{card.value}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/60 border border-current/10">
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent RSVPs */}
        <div className="p-6 bg-white rounded-2xl border border-gold-200/20 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <h3 className="font-serif text-md font-bold text-gray-800">Xác nhận RSVP gần đây</h3>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Mới nhất</span>
          </div>

          <div className="space-y-4">
            {stats.recentRsvps.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs italic">Chưa có ai gửi xác nhận RSVP</div>
            ) : (
              stats.recentRsvps.map((rsvp) => (
                <div key={rsvp.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl hover:bg-gold-50/20 transition">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{rsvp.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">SĐT: {rsvp.phone} • {rsvp.guestsCount} khách</p>
                    {rsvp.wishes && (
                      <p className="text-xs text-gray-600 italic mt-1.5 border-l-2 border-gold-200 pl-2">
                        "{rsvp.wishes}"
                      </p>
                    )}
                  </div>
                  <span className="text-[9px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(rsvp.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Wishes */}
        <div className="p-6 bg-white rounded-2xl border border-gold-200/20 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <h3 className="font-serif text-md font-bold text-gray-800">Lời chúc mới nhận</h3>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Mới nhất</span>
          </div>

          <div className="space-y-4">
            {stats.recentWishes.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs italic">Chưa nhận được lời chúc nào</div>
            ) : (
              stats.recentWishes.map((wish) => (
                <div key={wish.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl hover:bg-gold-50/20 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-800 text-sm">{wish.name}</h4>
                      <span className={`px-2 py-0.5 text-[8px] rounded-full font-bold uppercase tracking-wider ${
                        wish.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {wish.isApproved ? 'Hiển thị' : 'Chờ duyệt'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 italic mt-2">"{wish.content}"</p>
                  </div>
                  <span className="text-[9px] text-gray-400 flex items-center gap-1 ml-2">
                    <Clock className="w-3 h-3" />
                    {new Date(wish.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
