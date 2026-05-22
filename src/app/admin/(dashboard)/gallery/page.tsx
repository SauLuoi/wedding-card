'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Trash, ArrowLeft, ArrowRight, ImageIcon, Check } from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  sortOrder: number;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch images list
  const fetchImages = () => {
    setLoading(true);
    fetch('/api/admin/gallery')
      .then((res) => res.json())
      .then((data) => {
        setImages(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Upload new image file
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage(null);

    let successCount = 0;
    
    // Support multiple files upload in sequence
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const uploadRes = await fetch('/api/admin/gallery/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (uploadRes.ok && uploadData.url) {
          // Add Image URL to Gallery Database
          const saveRes = await fetch('/api/admin/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: uploadData.url }),
          });

          if (saveRes.ok) {
            successCount++;
          }
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    setUploading(false);
    if (successCount > 0) {
      setMessage({ text: `Đã tải lên thành công ${successCount} bức ảnh!`, type: 'success' });
      fetchImages();
    } else {
      setMessage({ text: 'Tải ảnh lên thất bại.', type: 'error' });
    }
  };

  // Delete image
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá ảnh này khỏi album?')) return;

    try {
      const res = await fetch(`/api/admin/gallery?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setImages(images.filter((img) => img.id !== id));
        setMessage({ text: 'Xoá ảnh thành công!', type: 'success' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Lỗi không thể xoá ảnh.', type: 'error' });
    }
  };

  // Reorder sort position left/right in array
  const swapPosition = async (idx: number, targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const items = [...images];
    
    // Swap sortOrder value
    const temp = items[idx].sortOrder;
    items[idx].sortOrder = items[targetIdx].sortOrder;
    items[targetIdx].sortOrder = temp;

    // Swap elements in state
    [items[idx], items[targetIdx]] = [items[targetIdx], items[idx]];
    setImages(items);

    // Save to DB
    try {
      await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items.map((img) => ({ id: img.id, sortOrder: img.sortOrder }))),
      });
    } catch (err) {
      console.error('Reorder save failed:', err);
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-800">Album ảnh cưới</h2>
          <p className="text-gray-500 text-xs mt-1">Tải ảnh lên và sắp xếp thứ tự hiển thị trong bộ sưu tập gallery</p>
        </div>

        {/* Upload Buttons */}
        <div className="relative">
          <input 
            type="file" 
            multiple
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <button 
            disabled={uploading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-semibold bg-gold-600 transition hover:bg-gold-500 shadow-md hover:scale-102 active:scale-98 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Đang tải lên...' : 'Tải Lên Ảnh Mới'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 border rounded-2xl text-xs font-semibold ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Grid gallery */}
      <div className="p-6 bg-white rounded-2xl border border-gold-200/20 shadow-xs">
        {images.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center text-gray-400 text-xs italic space-y-4">
            <ImageIcon className="w-12 h-12 text-gray-300" />
            <span>Chưa có bức ảnh nào trong album. Hãy bắt đầu tải lên!</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {images.map((image, idx) => (
              <div key={image.id} className="group relative rounded-xl overflow-hidden border border-gold-100 shadow-xs bg-gray-50 flex flex-col transition hover:shadow-md">
                
                {/* Photo Display */}
                <div className="aspect-[3/4] overflow-hidden bg-gray-100 border-b border-gray-100">
                  <img 
                    src={image.url} 
                    alt="Gallery item" 
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Info & Sorting Footer */}
                <div className="p-2 flex items-center justify-between bg-white text-gray-400 text-xs">
                  <span className="font-semibold text-gray-500 text-[10px]"># {idx + 1}</span>
                  
                  {/* Sorting Buttons */}
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => swapPosition(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1 hover:text-gold-600 hover:bg-gray-100 rounded disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => swapPosition(idx, idx + 1)}
                      disabled={idx === images.length - 1}
                      className="p-1 hover:text-gold-600 hover:bg-gray-100 rounded disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(image.id)}
                      className="p-1 hover:text-red-500 hover:bg-red-50 rounded ml-2 cursor-pointer"
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
