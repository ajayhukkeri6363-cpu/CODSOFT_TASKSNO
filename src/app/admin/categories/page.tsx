'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  UtensilsCrossed,
  Layers,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

export default function AdminCategoryManager() {
  const { success, error } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Utensils',
    displayOrder: '0',
  });

  const fetchCategories = () => {
    setIsLoading(true);
    fetch('/api/categories')
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((data) => {
        setCategories(data.categories);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: 'Utensils',
      displayOrder: (categories.length + 1).toString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setIsEditing(true);
    setSelectedCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'Utensils',
      displayOrder: cat.displayOrder.toString(),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      error('Category name is required');
      return;
    }

    try {
      const url = isEditing ? `/api/categories/${selectedCategory.id}` : '/api/categories';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        success(data.message || 'Category saved!');
        setIsModalOpen(false);
        fetchCategories();
      } else {
        error(data.error || 'Failed to save category');
      }
    } catch {
      error('Error saving category');
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const res = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        success('Category deleted successfully');
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
        fetchCategories();
      } else {
        error(data.error || 'Failed to delete category');
      }
    } catch {
      error('Error deleting category');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Menu Taxonomy & Sections
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Menu Categories
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize culinary courses, display sequences, and category descriptions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-32" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <FolderTree className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No categories created yet</h3>
          <p className="text-xs text-slate-400">Add your first menu category to begin building courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    Order #{cat.displayOrder}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900">{cat.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {cat.description || 'No description provided.'}
                </p>
                <div className="text-[11px] font-bold text-amber-700 bg-amber-50/60 px-2.5 py-1 rounded-lg w-fit">
                  {cat._count?.items || 0} active dishes in this course
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                  title="Edit Category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setCategoryToDelete(cat);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Category' : 'Create Menu Category'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Stone-Oven Pizzas"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Description</label>
            <textarea
              rows={2}
              placeholder="Brief summary of dishes in this section..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Display Order</label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-sm"
            >
              {isEditing ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Menu Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? All associated dishes in this category will also be deleted.`}
        confirmLabel="Delete Category"
      />
    </div>
  );
}
