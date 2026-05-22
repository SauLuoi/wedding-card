'use client';

import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { Save, Upload, Link as LinkIcon, Heart, Calendar, Image as ImageIcon, Globe, QrCode } from 'lucide-react';

interface WeddingConfig {
  slug: string;
  brideName: string;
  brideShortName: string;
  groomName: string;
  groomShortName: string;
  weddingDate: string;
  locationName: string;
  locationAddress: string;
  googleMapsEmbedUrl: string;
  googleMapsDirectionUrl: string;
  musicUrl: string;
  themeColor: string;
  fontFamily: string;
  seoTitle: string;
  seoDescription: string;
  seoImage: string;
  faviconUrl: string;
  heroImage: string;
  aboutTitle: string;
  aboutText: string;
  brideAbout: string;
  groomAbout: string;
  brideImage: string;
  groomImage: string;
  groomQrUrl: string;
  groomBankName: string;
  groomAccountNumber: string;
  groomAccountName: string;
  brideQrUrl: string;
  brideBankName: string;
  brideAccountNumber: string;
  brideAccountName: string;
}

export default function ConfigPage() {
  const [config, setConfig] = useState<WeddingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetch('/api/admin/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.weddingDate) {
          // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
          const date = new Date(data.weddingDate);
          const tzoffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
          const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
          data.weddingDate = localISOTime;
        }
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!config) return;
    const { name, value } = e.target;
    setConfig({ ...config, [name]: value });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof WeddingConfig
  ) => {
    const file = e.target.files?.[0];

    if (!file || !config) return;

    try {
      // Compress + convert webp
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
      });

      const formData = new FormData();

      formData.append(
        'file',
        compressedFile,
        `${Date.now()}.webp`
      );

      const res = await fetch('/api/admin/gallery/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setConfig({
          ...config,
          [fieldName]: data.url,
        });

        setMessage({
          text: 'Tải ảnh lên thành công!',
          type: 'success',
        });
      } else {
        setMessage({
          text: data.error || 'Upload thất bại',
          type: 'error',
        });
      }
    } catch (err) {
      console.error(err);

      setMessage({
        text: 'Lỗi upload',
        type: 'error',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setMessage({ text: 'Lưu cấu hình thiệp cưới thành công!', type: 'success' });
      } else {
        const data = await res.json();
        setMessage({ text: data.error || 'Lưu cấu hình thất bại.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Lỗi máy chủ khi lưu cấu hình.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (!config) {
    return <div className="p-6 text-center text-red-500">Không tìm thấy cấu hình thiệp cưới.</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl select-none">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-800">Thông tin & Giao diện</h2>
          <p className="text-gray-500 text-xs mt-1">Cấu hình các chi tiết, màu sắc và thông điệp hiển thị trên thiệp cưới</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 border rounded-2xl text-xs font-semibold ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 pb-12">
        {/* Section 1: Couple Details */}
        <div className="p-6 bg-white rounded-2xl border border-gold-200/20 shadow-xs space-y-6">
          <h3 className="font-serif text-md font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Heart className="w-5 h-5 text-gold-500" />
            <span>Thông tin cô dâu & chú rể</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Groom Name */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Họ tên chú rể</label>
              <input
                type="text"
                name="groomName"
                required
                value={config.groomName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
              />
            </div>

            {/* Bride Name */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Họ tên cô dâu</label>
              <input
                type="text"
                name="brideName"
                required
                value={config.brideName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
              />
            </div>

            {/* Groom Short Name */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Tên gọi ngắn chú rể (VD: Hoàng Minh)</label>
              <input
                type="text"
                name="groomShortName"
                required
                value={config.groomShortName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
              />
            </div>

            {/* Bride Short Name */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Tên gọi ngắn cô dâu (VD: Thảo Vy)</label>
              <input
                type="text"
                name="brideShortName"
                required
                value={config.brideShortName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
              />
            </div>

            {/* Groom Image upload */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Ảnh đại diện chú rể</label>
              <div className="flex items-center gap-4">
                {config.groomImage && (
                  <img src={config.groomImage} className="w-16 h-16 rounded-xl object-cover border border-gold-200" />
                )}
                <div className="relative flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'groomImage')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full border border-dashed border-gray-300 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-xs text-gray-500 hover:bg-gold-50/20">
                    <Upload className="w-4 h-4" />
                    <span>Tải ảnh lên</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bride Image upload */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Ảnh đại diện cô dâu</label>
              <div className="flex items-center gap-4">
                {config.brideImage && (
                  <img src={config.brideImage} className="w-16 h-16 rounded-xl object-cover border border-gold-200" />
                )}
                <div className="relative flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'brideImage')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full border border-dashed border-gray-300 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-xs text-gray-500 hover:bg-gold-50/20">
                    <Upload className="w-4 h-4" />
                    <span>Tải ảnh lên</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Groom bio text */}
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Giới thiệu về chú rể</label>
              <textarea
                name="groomAbout"
                rows={3}
                value={config.groomAbout}
                onChange={handleChange}
                placeholder="Câu tự giới thiệu ngắn của chú rể..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7] resize-none"
              />
            </div>

            {/* Bride bio text */}
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Giới thiệu về cô dâu</label>
              <textarea
                name="brideAbout"
                rows={3}
                value={config.brideAbout}
                onChange={handleChange}
                placeholder="Câu tự giới thiệu ngắn của cô dâu..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Venue and Date */}
        <div className="p-6 bg-white rounded-2xl border border-gold-200/20 shadow-xs space-y-6">
          <h3 className="font-serif text-md font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Calendar className="w-5 h-5 text-gold-500" />
            <span>Thời gian & địa điểm tổ chức</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wedding Date Picker */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Ngày giờ tổ chức tiệc</label>
              <input
                type="datetime-local"
                name="weddingDate"
                required
                value={config.weddingDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
              />
            </div>

            {/* Venue name */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Tên nhà hàng/Địa điểm (VD: The Log Restaurant)</label>
              <input
                type="text"
                name="locationName"
                required
                value={config.locationName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Địa chỉ cụ thể</label>
              <input
                type="text"
                name="locationAddress"
                required
                value={config.locationAddress}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
              />
            </div>

            {/* Google map iframe embed */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Google Map Embed Link (Iframe src URL)</label>
              <input
                type="text"
                name="googleMapsEmbedUrl"
                value={config.googleMapsEmbedUrl}
                onChange={handleChange}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
              />
            </div>

            {/* Direction link */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Đường link chỉ đường Google Map (Navigation Link)</label>
              <input
                type="text"
                name="googleMapsDirectionUrl"
                value={config.googleMapsDirectionUrl}
                onChange={handleChange}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Layout Aesthetics and Music */}
        <div className="p-6 bg-white rounded-2xl border border-gold-200/20 shadow-xs space-y-6">
          <h3 className="font-serif text-md font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
            <ImageIcon className="w-5 h-5 text-gold-500" />
            <span>Hình ảnh & Giao diện thiệp</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hero Banner Upload */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Ảnh bìa Fullscreen (Hero Image)</label>
              <div className="flex items-center gap-4">
                {config.heroImage && (
                  <img src={config.heroImage} className="w-16 h-16 rounded-xl object-cover border border-gold-200" />
                )}
                <div className="relative flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'heroImage')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full border border-dashed border-gray-300 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-xs text-gray-500 hover:bg-gold-50/20">
                    <Upload className="w-4 h-4" />
                    <span>Tải ảnh lên</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Color selector */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Màu chủ đạo thiệp cưới</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  name="themeColor"
                  value={config.themeColor}
                  onChange={handleChange}
                  className="w-16 h-11 rounded-xl cursor-pointer border border-gray-200 outline-none bg-white p-1"
                />
                <input
                  type="text"
                  name="themeColor"
                  value={config.themeColor}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
                />
              </div>
            </div>

            {/* Background Music Link - YouTube */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Nhạc nền (Link YouTube)</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400"><LinkIcon className="w-4 h-4" /></span>
                <input
                  type="text"
                  name="musicUrl"
                  value={config.musicUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">Dán link YouTube bất kỳ — hệ thống sẽ tự động lấy âm thanh để phát nền.</p>
            </div>

            {/* Custom font selector */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Font chữ Serif tiêu đề</label>
              <select
                name="fontFamily"
                value={config.fontFamily}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm bg-[#FDFBF7] focus:border-gold-400"
              >
                <option value="Playfair Display">Playfair Display (Luxury, Serif)</option>
                <option value="Cormorant Garamond">Cormorant Garamond (Premium, Serif)</option>
                <option value="Montserrat">Montserrat (Modern, Sans-Serif)</option>
              </select>
            </div>

            {/* Slug Configuration */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Địa chỉ đường dẫn thiệp (Slug URL)</label>
              <div className="flex items-center">
                <span className="text-xs text-gray-400 px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl select-all">/thiep/</span>
                <input
                  type="text"
                  name="slug"
                  required
                  value={config.slug}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2.5 rounded-r-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-2 border-t border-gray-100">
            {/* Story Text Title */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Tiêu đề phần Giới thiệu (Love Story Title)</label>
              <input
                type="text"
                name="aboutTitle"
                value={config.aboutTitle}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
              />
            </div>
            {/* Story Text Description */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Đoạn văn giới thiệu chung câu chuyện tình yêu</label>
              <textarea
                name="aboutText"
                rows={4}
                value={config.aboutText}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: SEO Configurations */}
        <div className="p-6 bg-white rounded-2xl border border-gold-200/20 shadow-xs space-y-6">
          <h3 className="font-serif text-md font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Globe className="w-5 h-5 text-gold-500" />
            <span>Cấu hình SEO & Chia sẻ link</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SEO Title */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Tiêu đề SEO (Meta Title)</label>
              <input
                type="text"
                name="seoTitle"
                required
                value={config.seoTitle}
                onChange={handleChange}
                placeholder="VD: Hoàng Minh & Thảo Vy - Lời Mời Thành Hôn"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
              />
            </div>

            {/* SEO Description */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Mô tả SEO (Meta Description)</label>
              <input
                type="text"
                name="seoDescription"
                required
                value={config.seoDescription}
                onChange={handleChange}
                placeholder="Đoạn mô tả hiển thị khi gửi link qua Zalo/Facebook..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
              />
            </div>

            {/* SEO Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Ảnh xem trước khi chia sẻ link (OG Image 1200×630)</label>
              <div className="flex items-center gap-4">
                {config.seoImage && (
                  <img src={config.seoImage} className="w-24 h-16 rounded-xl object-cover border border-gold-200" />
                )}
                <div className="relative flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'seoImage')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full border border-dashed border-gray-300 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-xs text-gray-500 hover:bg-gold-50/20">
                    <Upload className="w-4 h-4" />
                    <span>Tải ảnh OG lên</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">Ảnh hiển thị khi chia sẻ link qua Zalo, Facebook, iMessage... Nên dùng ảnh ngang tỷ lệ 1200×630px.</p>
            </div>

            {/* Favicon Upload */}
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Favicon (icon tab trình duyệt)</label>
              <div className="flex items-center gap-4">
                {config.faviconUrl ? (
                  <img src={config.faviconUrl} className="w-10 h-10 rounded-lg object-contain border border-gold-200 bg-gray-50" />
                ) : (
                  <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300">
                    <Globe className="w-5 h-5" />
                  </div>
                )}
                <div className="relative flex-1">
                  <input
                    type="file"
                    accept="image/*,.ico"
                    onChange={(e) => handleFileUpload(e, 'faviconUrl')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full border border-dashed border-gray-300 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-xs text-gray-500 hover:bg-gold-50/20">
                    <Upload className="w-4 h-4" />
                    <span>Tải favicon lên (.ico / .png / .jpg)</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">Icon hiển thị ở tab trình duyệt và khi bookmark trang. Nên dùng ảnh vuông 32×32px hoặc 64×64px.</p>
            </div>
          </div>
        </div>

        {/* Section 5: Hộp Mừng Cưới & Mã QR */}
        <div className="p-6 bg-white rounded-2xl border border-gold-200/20 shadow-xs space-y-6">
          <h3 className="font-serif text-md font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
            <QrCode className="w-5 h-5 text-gold-500" />
            <span>Cấu hình Hộp Mừng Cưới & Mã QR</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Chú rể */}
            <div className="space-y-4 p-4 border border-gray-100 rounded-xl bg-gray-50/30">
              <h4 className="font-semibold text-sm text-gray-800 border-b border-gray-100 pb-2">Mừng cưới Chú rể</h4>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Tên ngân hàng</label>
                <input
                  type="text"
                  name="groomBankName"
                  value={config.groomBankName}
                  onChange={handleChange}
                  placeholder="VD: Vietcombank (VCB)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Số tài khoản</label>
                <input
                  type="text"
                  name="groomAccountNumber"
                  value={config.groomAccountNumber}
                  onChange={handleChange}
                  placeholder="VD: 1012345678"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Tên chủ tài khoản</label>
                <input
                  type="text"
                  name="groomAccountName"
                  value={config.groomAccountName}
                  onChange={handleChange}
                  placeholder="VD: LÊ HOÀNG MINH"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Mã QR ngân hàng</label>
                <div className="flex items-center gap-4">
                  {config.groomQrUrl && (
                    <img src={config.groomQrUrl} className="w-16 h-16 rounded-xl object-cover border border-gold-200 bg-white" />
                  )}
                  <div className="relative flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'groomQrUrl')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-full border border-dashed border-gray-300 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-xs text-gray-500 hover:bg-gold-50/20 bg-white">
                      <Upload className="w-4 h-4" />
                      <span>Tải QR lên</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cô dâu */}
            <div className="space-y-4 p-4 border border-gray-100 rounded-xl bg-gray-50/30">
              <h4 className="font-semibold text-sm text-gray-800 border-b border-gray-100 pb-2">Mừng cưới Cô dâu</h4>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Tên ngân hàng</label>
                <input
                  type="text"
                  name="brideBankName"
                  value={config.brideBankName}
                  onChange={handleChange}
                  placeholder="VD: Techcombank (TCB)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Số tài khoản</label>
                <input
                  type="text"
                  name="brideAccountNumber"
                  value={config.brideAccountNumber}
                  onChange={handleChange}
                  placeholder="VD: 19012345678910"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Tên chủ tài khoản</label>
                <input
                  type="text"
                  name="brideAccountName"
                  value={config.brideAccountName}
                  onChange={handleChange}
                  placeholder="VD: NGUYỄN THẢO VY"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Mã QR ngân hàng</label>
                <div className="flex items-center gap-4">
                  {config.brideQrUrl && (
                    <img src={config.brideQrUrl} className="w-16 h-16 rounded-xl object-cover border border-gold-200 bg-white" />
                  )}
                  <div className="relative flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'brideQrUrl')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-full border border-dashed border-gray-300 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-xs text-gray-500 hover:bg-gold-50/20 bg-white">
                      <Upload className="w-4 h-4" />
                      <span>Tải QR lên</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium bg-gold-600 transition hover:bg-gold-500 shadow-md hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50 text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
