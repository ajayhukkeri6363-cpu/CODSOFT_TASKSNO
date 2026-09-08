'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, OrderType } from '@/lib/types';
import { calculateOrderTotals } from '@/lib/utils';

interface CartContextType {
  items: CartItem[];
  orderType: OrderType;
  tableId: string;
  tableName: string;
  couponCode: string;
  discount: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  setOrderType: (type: OrderType) => void;
  setTable: (id: string, name: string) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderType, setOrderTypeState] = useState<OrderType>('DINE_IN');
  const [tableId, setTableId] = useState<string>('');
  const [tableName, setTableName] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('dinedesk_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedOrderType = localStorage.getItem('dinedesk_order_type') as OrderType;
      if (savedOrderType) {
        setOrderTypeState(savedOrderType);
      }
      const savedTable = localStorage.getItem('dinedesk_table');
      if (savedTable) {
        const parsed = JSON.parse(savedTable);
        setTableId(parsed.id || '');
        setTableName(parsed.name || '');
      }
    } catch (e) {
      console.error('Error loading cart from storage', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dinedesk_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to storage', e);
    }
  }, [items]);

  const setOrderType = (type: OrderType) => {
    setOrderTypeState(type);
    localStorage.setItem('dinedesk_order_type', type);
  };

  const setTable = (id: string, name: string) => {
    setTableId(id);
    setTableName(name);
    localStorage.setItem('dinedesk_table', JSON.stringify({ id, name }));
  };

  const addItem = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = newItem.quantity || 1;
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === newItem.menuItemId);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === newItem.menuItemId
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: qty }];
    });
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i))
    );
  };

  const removeItem = (menuItemId: string) => {
    setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    setDiscount(0);
    localStorage.removeItem('dinedesk_cart');
  };

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    const rawSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (clean === 'DINE10') {
      const disc = Number((rawSubtotal * 0.1).toFixed(2));
      setCouponCode('DINE10');
      setDiscount(disc);
      return { success: true, message: '10% discount applied!' };
    } else if (clean === 'TASTY20') {
      const disc = Number((rawSubtotal * 0.2).toFixed(2));
      setCouponCode('TASTY20');
      setDiscount(disc);
      return { success: true, message: '20% special discount applied!' };
    } else {
      return { success: false, message: 'Invalid coupon code. Try DINE10 or TASTY20' };
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscount(0);
  };

  const rawSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const { subtotal, tax, deliveryFee, total } = calculateOrderTotals(
    rawSubtotal,
    orderType,
    discount
  );

  return (
    <CartContext.Provider
      value={{
        items,
        orderType,
        tableId,
        tableName,
        couponCode,
        discount,
        subtotal,
        tax,
        deliveryFee,
        total,
        itemCount,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        setOrderType,
        setTable,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
