'use client';

import React, { useState, useEffect } from 'react';
import { Download, Search, Trash, Clock, Users } from 'lucide-react';

interface Rsvp {
  id: string;
  name: string;
  phone: string;
  guestsCount: number;
  wishes: string;
  createdAt: string;
}

export default function RsvpPage() {
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch RSVPs list
  const fetchRsvps = () => {
    setLoading(true);
    fetch('/api/admin/rsvp')
      .then((res) => res.json())
      .then((data) => {
        setRsvps(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRsvps();
  }, []);

  // Delete RSVP item
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá khách mời này khỏi danh sách RSVP?')) return;
    try {
      const res = await fetch(`/api/admin/rsvp?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRsvps(rsvps.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter list based on search query
  const filteredRsvps = rsvps.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery)
  );

  // Stats
  const totalRsvps = rsvps.length;
  const totalGuests = rsvps.reduce((acc, r) => acc + r.guestsCount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-800">Danh sách khách mời RSVP</h2>
          <p className="text-gray-500 text-xs mt-1">
            Tổng cộng: <span className="font-bold text-gray-700">{totalRsvps} lượt đăng ký</span> • Tổng số khách: <span className="font-bold text-gold-600">{totalGuests} người tham dự</span>
          </p>
        </div>

        {/* CSV Download Trigger */}
        <a 
          href="/api/admin/rsvp/export"
          target="_blank"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-semibold bg-gold-600 transition hover:bg-gold-500 shadow-md hover:scale-102 active:scale-98"
        >
          <Download className="w-4 h-4" />
          <span>Xuất File Excel/CSV</span>
        </a>
      </div>

      {/* Filter and Table Card */}
      <div className="p-6 bg-white rounded-2xl border border-gold-200/20 shadow-xs space-y-6">
        
        {/* Search Input */}
        <div className="relative flex items-center max-w-sm">
          <span className="absolute left-4 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2 rounded-xl border border-gray-200 outline-none text-xs focus:border-gold-400 bg-[#FDFBF7]"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase tracking-widest font-semibold border-b border-gray-100">
                <th className="px-6 py-4">Tên khách mời</th>
                <th className="px-6 py-4">Số điện thoại</th>
                <th className="px-6 py-4 text-center">Số người</th>
                <th className="px-6 py-4">Lời chúc / Ghi chú</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRsvps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 italic">
                    Không tìm thấy thông tin đăng ký RSVP phù hợp.
                  </td>
                </tr>
              ) : (
                filteredRsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-gold-50/10 transition">
                    <td className="px-6 py-4 font-bold text-gray-800">{rsvp.name}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{rsvp.phone}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-50 text-gold-700 font-bold border border-gold-200/30">
                        <Users className="w-3 h-3" />
                        {rsvp.guestsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={rsvp.wishes}>
                      {rsvp.wishes || <span className="text-gray-300 italic">Không có</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-400 flex items-center gap-1.5 pt-4">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(rsvp.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDelete(rsvp.id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
