'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  UtensilsCrossed,
  Sparkles,
  Flame,
  Leaf,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';
import { MenuItemWithCategory } from '@/lib/types';

export default function AdminMenuManagement() {
  const { success, error } = useToast();
  const [items, setItems] = useState<MenuItemWithCategory[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Confirm Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    image: '',
    isVeg: false,
    isGlutenFree: false,
    isSpicy: false,
    isPopular: false,
    isAvailable: true,
    prepTimeMinutes: '15',
    calories: '',
    ingredients: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [menuRes, catRes] = await Promise.all([
        fetch('/api/menu').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
      ]);
      setItems(menuRes.items || []);
      setCategories(catRes.categories || []);
      if (catRes.categories?.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: catRes.categories[0].id }));
      }
    } catch {
      error('Failed to load menu data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedItem(null);
    setFormData({
      categoryId: categories[0]?.id || '',
      name: '',
      description: '',
      price: '',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      isVeg: false,
      isGlutenFree: false,
      isSpicy: false,
      isPopular: false,
      isAvailable: true,
      prepTimeMinutes: '15',
      calories: '450',
      ingredients: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItemWithCategory) => {
    setIsEditing(true);
    setSelectedItem(item);
    setFormData({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.image,
      isVeg: item.isVeg,
      isGlutenFree: item.isGlutenFree,
      isSpicy: item.isSpicy,
      isPopular: item.isPopular,
      isAvailable: item.isAvailable,
      prepTimeMinutes: item.prepTimeMinutes.toString(),
      calories: item.calories ? item.calories.toString() : '',
      ingredients: item.ingredients || '',
    });
    setIsModalOpen(true);
  };

  const handleToggleAvailability = async (item: MenuItemWithCategory) => {
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      const data = await res.json();
      if (res.ok) {
        success(data.message || 'Availability updated');
        fetchData();
      } else {
        error(data.error || 'Failed to toggle availability');
      }
    } catch {
      error('Error updating availability');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.price || !formData.categoryId) {
      error('Please complete all required fields.');
      return;
    }

    try {
      const url = isEditing ? `/api/menu/${selectedItem.id}` : '/api/menu';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        success(data.message || (isEditing ? 'Dish updated!' : 'Dish added!'));
        setIsModalOpen(false);
        fetchData();
      } else {
        error(data.error || 'Failed to save menu item');
      }
    } catch {
      error('Error submitting menu form');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/menu/${itemToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        success('Dish deleted successfully');
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
        fetchData();
      } else {
        error(data.error || 'Failed to delete dish');
      }
    } catch {
      error('Error deleting menu item');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'ALL' ? true : item.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Culinary Catalog Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Menu Items Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dishes, prices, nutritional data, and toggle live sold-out status.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search dish by name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories ({items.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Items Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-20" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <UtensilsCrossed className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No dishes match criteria</h3>
          <p className="text-xs text-slate-400">Add a new dish or adjust your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Dish Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Prep & Calories</th>
                  <th className="py-4 px-6">Dietary Tags</th>
                  <th className="py-4 px-6">Availability</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((dish) => (
                  <tr key={dish.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 shadow-sm"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{dish.name}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{dish.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-700">
                        {dish.category.name}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-black text-slate-900">
                      {formatCurrency(dish.price)}
                    </td>

                    <td className="py-4 px-6 text-slate-500">
                      <p>{dish.prepTimeMinutes} mins prep</p>
                      {dish.calories && <p className="text-[11px] text-slate-400">{dish.calories} kcal</p>}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {dish.isPopular && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Chef Pick
                          </span>
                        )}
                        {dish.isVeg && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Veg
                          </span>
                        )}
                        {dish.isSpicy && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                            Spicy
                          </span>
                        )}
                        {dish.isGlutenFree && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            GF
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleAvailability(dish)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 ${
                          dish.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {dish.isAvailable ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Available</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Sold Out</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(dish)}
                          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                          title="Edit Dish"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete(dish);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Dish Details' : 'Add New Culinary Dish'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-700">Dish Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Truffle Burrata Bruschetta"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Category *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Price ($ USD) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="16.50"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-700">Description *</label>
              <textarea
                required
                rows={2}
                placeholder="Describe flavors, cooking method, ingredients..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-700">Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Preparation Time (mins)</label>
              <input
                type="number"
                value={formData.prepTimeMinutes}
                onChange={(e) => setFormData({ ...formData, prepTimeMinutes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Calories (kcal)</label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-700">Ingredients & Allergens</label>
              <input
                type="text"
                placeholder="e.g. Flour, eggs, whole milk, pistachios"
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Checkboxes */}
            <div className="sm:col-span-2 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVeg}
                  onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-700">Vegetarian</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isGlutenFree}
                  onChange={(e) => setFormData({ ...formData, isGlutenFree: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-700">Gluten-Free</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isSpicy}
                  onChange={(e) => setFormData({ ...formData, isSpicy: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-700">Spicy</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-700">Chef Pick</span>
              </label>
            </div>
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
              {isEditing ? 'Save Changes' : 'Create Dish'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Menu Dish"
        message={`Are you sure you want to permanently delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Dish"
      />
    </div>
  );
}
