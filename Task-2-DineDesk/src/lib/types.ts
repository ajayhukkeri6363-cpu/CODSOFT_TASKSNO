export type Role = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

export type TableLocation =
  | 'MAIN_HALL'
  | 'PATIO'
  | 'WINDOW_SIDE'
  | 'VIP_LOUNGE'
  | 'ROOFTOP';

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SEATED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod = 'CARD' | 'CASH' | 'ONLINE' | 'UPI';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface UserSessionPayload {
  id: string;
  email: string;
  role: Role;
  name: string;
  phone?: string | null;
  avatar?: string | null;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  specialInstructions?: string;
}

export interface MenuItemWithCategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  isPopular: boolean;
  isAvailable: boolean;
  prepTimeMinutes: number;
  calories?: number | null;
  ingredients?: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
  };
}
