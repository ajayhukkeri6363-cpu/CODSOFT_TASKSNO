'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Flame,
  Leaf,
  Clock,
  Info,
  Check,
  Filter,
  X,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import { MenuItemWithCategory } from '@/lib/types';

interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  _count?: { items: number };
}

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const { items: cartItems, addItem, updateQuantity, itemCount, total } = useCart();
  const { success } = useToast();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemWithCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVeg, setFilterVeg] = useState(false);
  const [filterGlutenFree, setFilterGlutenFree] = useState(false);
  const [filterSpicy, setFilterSpicy] = useState(false);
  const [filterPopular, setFilterPopular] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Dish detail modal state
  const [selectedDish, setSelectedDish] = useState<MenuItemWithCategory | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalInstructions, setModalInstructions] = useState('');

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  // Fetch menu items based on filters
  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'all') {
      params.append('categorySlug', selectedCategory);
    }
    if (searchQuery) params.append('search', searchQuery);
    if (filterVeg) params.append('isVeg', 'true');
    if (filterGlutenFree) params.append('isGlutenFree', 'true');
    if (filterSpicy) params.append('isSpicy', 'true');
    if (filterPopular) params.append('isPopular', 'true');

    fetch(`/api/menu?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => {
        setMenuItems(data.items);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedCategory, searchQuery, filterVeg, filterGlutenFree, filterSpicy, filterPopular]);

  const handleAddToCart = (dish: MenuItemWithCategory, qty = 1, instructions = '') => {
    addItem({
      menuItemId: dish.id,
      name: dish.name,
      price: dish.price,
      image: dish.image,
      quantity: qty,
      specialInstructions: instructions || undefined,
    });
    success(`Added ${qty}x "${dish.name}" to cart!`);
    if (selectedDish) {
      setSelectedDish(null);
      setModalQty(1);
      setModalInstructions('');
    }
  };

  const getCartQuantity = (dishId: string) => {
    const item = cartItems.find((i) => i.menuItemId === dishId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Artisanal Culinary Selection
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
            Gourmet Digital Menu
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Handcrafted with seasonal organic ingredients and prepared fresh to order.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search dishes or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-amber-400 shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          All Dishes
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition ${
              selectedCategory === cat.slug
                ? 'bg-amber-500 text-slate-950 shadow-md font-black shadow-amber-500/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Dietary Filters Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" /> Filter by:
        </span>

        <button
          onClick={() => setFilterVeg(!filterVeg)}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
            filterVeg
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Leaf className="w-3.5 h-3.5" />
          <span>Vegetarian</span>
        </button>

        <button
          onClick={() => setFilterGlutenFree(!filterGlutenFree)}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            filterGlutenFree
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Gluten-Free
        </button>

        <button
          onClick={() => setFilterSpicy(!filterSpicy)}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
            filterSpicy
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Spicy</span>
        </button>

        <button
          onClick={() => setFilterPopular(!filterPopular)}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
            filterPopular
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Chef's Pick</span>
        </button>

        {(filterVeg || filterGlutenFree || filterSpicy || filterPopular || searchQuery) && (
          <button
            onClick={() => {
              setFilterVeg(false);
              setFilterGlutenFree(false);
              setFilterSpicy(false);
              setFilterPopular(false);
              setSearchQuery('');
            }}
            className="text-amber-600 hover:text-amber-700 font-bold ml-2 underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Menu Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm animate-pulse space-y-4">
              <div className="w-full h-52 bg-slate-200 rounded-2xl" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Info className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No dishes match your criteria</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Try adjusting your search terms or dietary filters to view other gourmet specialties.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setFilterVeg(false);
              setFilterGlutenFree(false);
              setFilterSpicy(false);
              setFilterPopular(false);
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {menuItems.map((dish) => {
            const inCartQty = getCartQuantity(dish.id);
            return (
              <div
                key={dish.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image & Badges */}
                  <div
                    className="relative h-56 w-full overflow-hidden bg-slate-100 cursor-pointer"
                    onClick={() => {
                      setSelectedDish(dish);
                      setModalQty(1);
                      setModalInstructions('');
                    }}
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-950/80 text-white backdrop-blur-md">
                        {dish.category.name}
                      </span>
                      {dish.isPopular && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Chef Pick
                        </span>
                      )}
                      {dish.isVeg && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                          VEG
                        </span>
                      )}
                      {dish.isSpicy && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-0.5">
                          <Flame className="w-3 h-3" /> Spicy
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-white/95 px-3 py-1 rounded-xl text-sm font-black text-slate-900 shadow-md backdrop-blur-md">
                      {formatCurrency(dish.price)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {dish.prepTimeMinutes} mins
                      </span>
                      {dish.calories && <span>{dish.calories} kcal</span>}
                    </div>

                    <h3
                      onClick={() => {
                        setSelectedDish(dish);
                        setModalQty(1);
                        setModalInstructions('');
                      }}
                      className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition cursor-pointer"
                    >
                      {dish.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0">
                  {!dish.isAvailable ? (
                    <div className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 text-center">
                      Currently Sold Out
                    </div>
                  ) : inCartQty > 0 ? (
                    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-1.5">
                      <button
                        onClick={() => updateQuantity(dish.id, inCartQty - 1)}
                        className="w-8 h-8 rounded-lg bg-white text-amber-800 shadow-sm flex items-center justify-center hover:bg-amber-100 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-black text-amber-900">
                        {inCartQty} in cart
                      </span>
                      <button
                        onClick={() => updateQuantity(dish.id, inCartQty + 1)}
                        className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 shadow-sm flex items-center justify-center hover:bg-amber-600 transition font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(dish, 1)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to Order</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dish Detail Modal */}
      {selectedDish && (
        <Modal
          isOpen={!!selectedDish}
          onClose={() => setSelectedDish(null)}
          title={selectedDish.name}
          maxWidth="lg"
        >
          <div className="space-y-6">
            <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={selectedDish.image}
                alt={selectedDish.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 bg-white/95 px-3.5 py-1.5 rounded-xl text-base font-black text-slate-900 shadow-md">
                {formatCurrency(selectedDish.price)}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg">
                  {selectedDish.category.name}
                </span>
                {selectedDish.isVeg && (
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
                    Vegetarian
                  </span>
                )}
                {selectedDish.isGlutenFree && (
                  <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg">
                    Gluten-Free
                  </span>
                )}
                {selectedDish.isSpicy && (
                  <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg">
                    Spicy
                  </span>
                )}
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                  ⏱️ {selectedDish.prepTimeMinutes} mins prep
                </span>
                {selectedDish.calories && (
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    🔥 {selectedDish.calories} Calories
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {selectedDish.description}
              </p>

              {selectedDish.ingredients && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                  <span className="font-bold text-slate-800">Ingredients & Allergens:</span>
                  <p className="text-slate-500">{selectedDish.ingredients}</p>
                </div>
              )}
            </div>

            {/* Special Instructions Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Special Cooking Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Extra sauce, no onions, gluten allergy..."
                value={modalInstructions}
                onChange={(e) => setModalInstructions(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Quantity Stepper and Add Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-4">
              <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                  className="w-8 h-8 rounded-lg bg-white text-slate-800 shadow-sm flex items-center justify-center font-bold hover:bg-slate-200 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-slate-900 px-2">{modalQty}</span>
                <button
                  type="button"
                  onClick={() => setModalQty(modalQty + 1)}
                  className="w-8 h-8 rounded-lg bg-white text-slate-800 shadow-sm flex items-center justify-center font-bold hover:bg-slate-200 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleAddToCart(selectedDish, modalQty, modalInstructions)}
                className="flex-1 py-3 px-6 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  Add {modalQty} to Cart • {formatCurrency(selectedDish.price * modalQty)}
                </span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Floating Cart Bar (When cart is not empty) */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-lg w-full px-4 animate-slide-up">
          <Link
            href="/cart"
            className="flex items-center justify-between p-4 bg-slate-950 text-white rounded-2xl shadow-2xl border border-amber-500/30 hover:scale-[1.02] transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
                {itemCount}
              </div>
              <div>
                <p className="text-xs font-bold text-white">Your Order in Progress</p>
                <p className="text-[11px] text-amber-400 font-semibold">
                  Subtotal: {formatCurrency(total)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold bg-amber-500 text-slate-950 px-4 py-2 rounded-xl">
              <span>View Cart & Checkout</span>
              <Check className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading digital menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
