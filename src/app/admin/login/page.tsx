'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check session on load, if already logged in redirect to dashboard
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => {
        if (res.ok) {
          router.push('/admin');
        }
      })
      .catch(err => console.log('Session check failed:', err));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin');
      } else {
        setError(data.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Decorative Gold Sparkles */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-gold-200/10 blur-2xl"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-gold-300/10 blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gold-200/40 p-8 z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold-50 border border-gold-200 text-gold-600 mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-gray-800">Wedding Admin</h2>
          <p className="text-gray-400 text-xs mt-1">Đăng nhập để quản lý trang thiệp cưới</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Tên đăng nhập</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input 
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Tên đăng nhập"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Mật khẩu</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 rounded-full text-white font-medium bg-gold-600 transition hover:bg-gold-500 shadow-md hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50 text-sm mt-8"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
