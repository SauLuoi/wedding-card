'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Plus, Trash, Edit, ArrowUp, ArrowDown, Upload, Save, X, Image as ImageIcon } from 'lucide-react';

interface Story {
  id: string;
  dateString: string;
  title: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
}

export default function StoryPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Partial<Story> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch timeline stories on load
  const fetchStories = () => {
    setLoading(true);
    fetch('/api/admin/story')
      .then(res => res.json())
      .then(data => {
        setStories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Show modal for new story
  const handleAddClick = () => {
    setEditingStory({
      dateString: '',
      title: '',
      description: '',
      imageUrl: '',
      sortOrder: stories.length + 1
    });
    setShowModal(true);
  };

  // Show modal for editing
  const handleEditClick = (story: Story) => {
    setEditingStory(story);
    setShowModal(true);
  };

  // Delete story
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá cột mốc này?')) return;
    try {
      const res = await fetch(`/api/admin/story?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setStories(stories.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Move up in sort order
  const moveUp = async (idx: number) => {
    if (idx === 0) return;
    const items = [...stories];
    const temp = items[idx].sortOrder;
    items[idx].sortOrder = items[idx - 1].sortOrder;
    items[idx - 1].sortOrder = temp;

    // Swap position in array
    [items[idx], items[idx - 1]] = [items[idx - 1], items[idx]];
    setStories(items);
    await saveReorder(items);
  };

  // Move down in sort order
  const moveDown = async (idx: number) => {
    if (idx === stories.length - 1) return;
    const items = [...stories];
    const temp = items[idx].sortOrder;
    items[idx].sortOrder = items[idx + 1].sortOrder;
    items[idx + 1].sortOrder = temp;

    // Swap position in array
    [items[idx], items[idx + 1]] = [items[idx + 1], items[idx]];
    setStories(items);
    await saveReorder(items);
  };

  const saveReorder = async (itemsList: Story[]) => {
    try {
      await fetch('/api/admin/story', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemsList.map(s => ({ id: s.id, sortOrder: s.sortOrder })))
      });
    } catch (err) {
      console.error('Failed to save reordered list:', err);
    }
  };

  // Handle local image upload inside form modal
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingStory) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/gallery/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setEditingStory({ ...editingStory, imageUrl: data.url });
      } else {
        setError(data.error || 'Lỗi tải ảnh lên');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi tải ảnh lên');
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory || !editingStory.title || !editingStory.dateString) return;
    setSaving(true);
    setError('');

    const isEdit = !!editingStory.id;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/admin/story', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStory)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingStory(null);
        fetchStories();
      } else {
        const data = await res.json();
        setError(data.error || 'Lưu cột mốc thất bại.');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối máy chủ.');
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

  return (
    <div className="space-y-8 select-none">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-800">Câu chuyện tình yêu</h2>
          <p className="text-gray-500 text-xs mt-1">Quản lý các cột mốc thời gian hiển thị ở phần Timeline</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-xs font-semibold bg-gold-600 transition hover:bg-gold-500 shadow-md hover:scale-102 active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Cột Mốc Mới</span>
        </button>
      </div>

      {/* Stories Lists */}
      <div className="p-6 bg-white rounded-2xl border border-gold-200/20 shadow-xs">
        {stories.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-xs italic">
            Chưa có cột mốc nào trong câu chuyện tình yêu. Hãy bắt đầu thêm cột mốc đầu tiên!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {stories.map((story, idx) => (
              <div key={story.id} className="py-4 flex gap-6 items-start hover:bg-gold-50/10 transition px-2 rounded-xl">
                {/* Image display */}
                {story.imageUrl ? (
                  <img src={story.imageUrl} className="w-20 h-20 rounded-xl object-cover border border-gold-200" />
                ) : (
                  <div className="w-20 h-20 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-300">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gold-600 font-serif italic text-xs font-semibold">{story.dateString}</span>
                    <span className="text-gray-300">•</span>
                    <h4 className="text-sm font-bold text-gray-800">{story.title}</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">{story.description}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 self-center">
                  <div className="flex flex-col gap-1 border-r border-gray-100 pr-2">
                    <button 
                      onClick={() => moveUp(idx)} 
                      disabled={idx === 0}
                      className="p-1 rounded text-gray-400 hover:text-gold-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => moveDown(idx)} 
                      disabled={idx === stories.length - 1}
                      className="p-1 rounded text-gray-400 hover:text-gold-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button 
                    onClick={() => handleEditClick(story)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gold-600 hover:bg-gold-50 transition cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(story.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal edit/new form */}
      {showModal && editingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-gold-200/20 shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-gray-800 mb-6">
              {editingStory.id ? 'Sửa cột mốc câu chuyện' : 'Thêm cột mốc câu chuyện mới'}
            </h3>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Mốc thời gian (VD: 12/2021 hoặc Tháng 12, 2021)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Thời gian diễn ra sự kiện"
                  value={editingStory.dateString || ''}
                  onChange={e => setEditingStory({ ...editingStory, dateString: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Tiêu đề sự kiện</label>
                <input 
                  type="text" 
                  required
                  placeholder="VD: Lần đầu tiên gặp gỡ"
                  value={editingStory.title || ''}
                  onChange={e => setEditingStory({ ...editingStory, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Hình ảnh cột mốc</label>
                <div className="flex items-center gap-4">
                  {editingStory.imageUrl && (
                    <img src={editingStory.imageUrl} className="w-14 h-14 rounded-xl object-cover border border-gold-200" />
                  )}
                  <div className="relative flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-full border border-dashed border-gray-300 rounded-xl px-4 py-2 flex items-center justify-center gap-2 text-xs text-gray-500 hover:bg-gold-50/20">
                      <Upload className="w-4 h-4" />
                      <span>Chọn ảnh tải lên</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Chi tiết sự kiện / Câu chuyện</label>
                <textarea 
                  rows={4}
                  placeholder="Kể về sự kiện đáng nhớ này..."
                  value={editingStory.description || ''}
                  onChange={e => setEditingStory({ ...editingStory, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-gold-400 bg-[#FDFBF7] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-500 font-semibold text-xs transition hover:bg-gray-50 cursor-pointer"
                >
                  Huỷ bỏ
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-xs bg-gold-600 transition hover:bg-gold-500 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Đang lưu...' : 'Lưu Lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
