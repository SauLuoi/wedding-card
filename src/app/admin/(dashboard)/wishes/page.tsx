'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Trash, Clock, CheckCircle } from 'lucide-react';

interface Wish {
  id: string;
  name: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
}

export default function WishesPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all wishes list
  const fetchWishes = () => {
    setLoading(true);
    fetch('/api/admin/wishes')
      .then((res) => res.json())
      .then((data) => {
        setWishes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  // Toggle approval state of a wish
  const toggleApprove = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/wishes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved: !currentStatus }),
      });

      if (res.ok) {
        setWishes(
          wishes.map((w) => (w.id === id ? { ...w, isApproved: !currentStatus } : w))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete wish
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá lời chúc này?')) return;
    try {
      const res = await fetch(`/api/admin/wishes?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setWishes(wishes.filter((w) => w.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      <div>
        <h2 className="font-serif text-2xl font-bold text-gray-800">Quản lý lời chúc</h2>
        <p className="text-gray-500 text-xs mt-1">Duyệt hiển thị hoặc ẩn lời chúc từ khách mời gửi tới đám cưới</p>
      </div>

      {/* Wishes Moderation List */}
      <div className="p-6 bg-white rounded-2xl border border-gold-200/20 shadow-xs">
        {wishes.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-xs italic">
            Chưa có lời chúc nào được gửi đến.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wishes.map((wish) => (
              <div 
                key={wish.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between h-44 hover:shadow-md transition bg-gray-50/50 ${
                  wish.isApproved ? 'border-gold-200/30' : 'border-gray-200 opacity-70'
                }`}
              >
                <div>
                  {/* Top Bar info */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                    <span className="font-serif font-bold text-gray-800 text-sm">{wish.name}</span>
                    
                    <span className="text-[9px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(wish.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {/* Message body */}
                  <p className="text-gray-600 text-xs italic leading-relaxed">
                    "{wish.content}"
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className={`w-2 h-2 rounded-full ${wish.isApproved ? 'bg-green-500' : 'bg-amber-400'}`}></span>
                    <span className={`font-semibold ${wish.isApproved ? 'text-green-600' : 'text-amber-500'}`}>
                      {wish.isApproved ? 'Đang hiển thị công khai' : 'Đang ẩn tạm thời'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleApprove(wish.id, wish.isApproved)}
                      className={`flex items-center justify-center p-2 rounded-xl border transition cursor-pointer ${
                        wish.isApproved 
                          ? 'border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100'
                          : 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100'
                      }`}
                      title={wish.isApproved ? 'Ẩn lời chúc' : 'Duyệt hiển thị'}
                    >
                      {wish.isApproved ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => handleDelete(wish.id)}
                      className="flex items-center justify-center p-2 rounded-xl border border-red-100 text-red-500 bg-red-50 hover:bg-red-100 transition cursor-pointer"
                      title="Xoá lời chúc"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
