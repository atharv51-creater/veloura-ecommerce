import React, { createContext, useContext, useEffect, useState } from 'react';
import { Order, ShippingAddress, UserProfile } from '../types';
import { isValidEmail } from '../utils/validation';

interface AuthenticationContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  orders: Order[];
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  updateAddress: (address: ShippingAddress) => void;
  addAddress: (address: ShippingAddress) => void;
  removeAddress: (index: number) => void;
  addOrder: (order: Order) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

const USER_STORAGE_KEY = 'veloura_user';
const ORDERS_STORAGE_KEY = 'veloura_orders';
const REGISTERED_USERS_STORAGE_KEY = 'veloura_registered_users';

interface RegisteredUserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  memberSince: string;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-vel-8821',
  name: 'Aurelia Vance',
  email: 'aurelia.vance@studio-veloura.com',
  phone: '+1 (555) 234-8901',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  memberSince: 'October 2025',
  address: {
    street: '742 Evergreen Atelier, Suite 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10012',
    zipCode: '10012',
    country: 'United States',
  },
  savedAddresses: [
    {
      fullName: 'Aurelia Vance',
      email: 'aurelia.vance@studio-veloura.com',
      phone: '+1 (555) 234-8901',
      street: '742 Evergreen Atelier, Suite 4B',
      addressLine1: '742 Evergreen Atelier, Suite 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10012',
      zipCode: '10012',
      country: 'United States',
    },
  ],
};

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-9921',
    orderNumber: 'VEL-2026-9921',
    createdAt: '2026-08-20T14:32:00Z',
    items: [
      {
        productId: 'vel-w-dr-01',
        productName: 'Siren Column Backless Maxi Dress',
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
        price: 260,
        size: 'S',
        color: { name: 'Sculptural Black', hex: '#101012' },
        quantity: 1,
      },
      {
        productId: 'vel-w-tp-01',
        productName: 'Mulberry Silk Asymmetric Top',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        price: 160,
        size: 'M',
        color: { name: 'Champagne Pearl', hex: '#EDE6D6' },
        quantity: 1,
      },
    ],
    subtotal: 420,
    shippingFee: 0,
    discount: 63,
    total: 357,
    status: 'Shipped',
    shippingAddress: {
      fullName: 'Aurelia Vance',
      email: 'aurelia.vance@studio-veloura.com',
      phone: '+1 (555) 234-8901',
      addressLine1: '742 Evergreen Atelier, Suite 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10012',
      country: 'United States',
    },
    deliveryMethod: 'express',
    paymentMethod: 'Mastercard ending in •••• 4021',
    estimatedDelivery: '2026-09-02',
    trackingUpdates: [
      {
        status: 'Order Placed',
        timestamp: '2026-08-20T14:32:00Z',
        description: 'Order confirmed and atelier receipt generated',
      },
      {
        status: 'Processing',
        timestamp: '2026-08-21T09:15:00Z',
        description: 'Garments inspected and packed in custom archival garment boxes',
      },
      {
        status: 'Shipped',
        timestamp: '2026-08-22T11:40:00Z',
        description: 'En route via Priority Courier. In transit to destination facility',
      },
    ],
  },
  {
    id: 'ord-8104',
    orderNumber: 'VEL-2026-8104',
    createdAt: '2026-07-12T10:14:00Z',
    items: [
      {
        productId: 'vel-m-jk-01',
        productName: 'Double-Faced Wool Atelier Coat',
        image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=600&q=80',
        price: 385,
        size: '40R',
        color: { name: 'Midnight Black', hex: '#0F1014' },
        quantity: 1,
      },
    ],
    subtotal: 385,
    shippingFee: 0,
    discount: 0,
    total: 385,
    status: 'Delivered',
    shippingAddress: {
      fullName: 'Aurelia Vance',
      email: 'aurelia.vance@studio-veloura.com',
      phone: '+1 (555) 234-8901',
      addressLine1: '742 Evergreen Atelier, Suite 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10012',
      country: 'United States',
    },
    deliveryMethod: 'standard',
    paymentMethod: 'Visa ending in •••• 1184',
    estimatedDelivery: '2026-07-18',
    trackingUpdates: [
      {
        status: 'Order Placed',
        timestamp: '2026-07-12T10:14:00Z',
        description: 'Order confirmed',
      },
      {
        status: 'Processing',
        timestamp: '2026-07-13T08:30:00Z',
        description: 'Tailoring inspection verified',
      },
      {
        status: 'Shipped',
        timestamp: '2026-07-14T15:20:00Z',
        description: 'Dispatched with white-glove carrier',
      },
      {
        status: 'Out for Delivery',
        timestamp: '2026-07-17T08:00:00Z',
        description: 'Courier out for final delivery',
      },
      {
        status: 'Delivered',
        timestamp: '2026-07-17T13:45:00Z',
        description: 'Delivered to resident and signed',
      },
    ],
  },
];

const DEFAULT_USER_SEED_PASSWORD = 'veloura6';

const loadRegisteredUsers = (): RegisteredUserRecord[] => {
  try {
    const saved = localStorage.getItem(REGISTERED_USERS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Fallback
  }
  return [];
};

const saveRegisteredUsers = (users: RegisteredUserRecord[]) => {
  try {
    localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Storage error
  }
};

// Seed the registered-user store with the mock DEFAULT_USER account so it can
// be signed into like any other account, without ever auto-authenticating.
const ensureSeededDefaultUser = (): RegisteredUserRecord[] => {
  const existing = loadRegisteredUsers();
  const hasDefault = existing.some(
    (u) => u.email.toLowerCase() === DEFAULT_USER.email.toLowerCase()
  );
  if (hasDefault) {
    return existing;
  }
  const seeded: RegisteredUserRecord[] = [
    ...existing,
    {
      id: DEFAULT_USER.id,
      name: DEFAULT_USER.name,
      email: DEFAULT_USER.email,
      password: DEFAULT_USER_SEED_PASSWORD,
      memberSince: DEFAULT_USER.memberSince || 'October 2025',
    },
  ];
  saveRegisteredUsers(seeded);
  return seeded;
};

const AuthenticationContext = createContext<AuthenticationContextType | undefined>(undefined);

export const AuthenticationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return null; // A new visitor must not be auto-authenticated
  });

  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserRecord[]>(() =>
    ensureSeededDefaultUser()
  );

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_ORDERS;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch {
      // Storage error
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Storage error
    }
  }, [orders]);

  const login = async (email: string, password?: string) => {
    if (!email || !isValidEmail(email)) {
      return { success: false, error: 'Please provide a valid client email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must contain at least 6 characters.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const record = registeredUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!record || record.password !== password) {
      return { success: false, error: 'Invalid email or password. Please try again.' };
    }

    const isDefaultAccount = record.email.toLowerCase() === DEFAULT_USER.email.toLowerCase();
    const authenticatedUser: UserProfile = isDefaultAccount
      ? { ...DEFAULT_USER }
      : {
          id: record.id,
          name: record.name,
          email: record.email,
          memberSince: record.memberSince,
          savedAddresses: [],
        };

    setUser(authenticatedUser);
    return { success: true };
  };

  const register = async (name: string, email: string, password?: string) => {
    if (!name?.trim()) {
      return { success: false, error: 'Please provide your full legal name.' };
    }
    if (!email || !isValidEmail(email)) {
      return { success: false, error: 'Please provide a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must contain at least 6 characters.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const alreadyRegistered = registeredUsers.some(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (alreadyRegistered) {
      return {
        success: false,
        error: 'An account with this email already exists. Please sign in instead.',
      };
    }

    const newRecord: RegisteredUserRecord = {
      id: `usr-vel-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      email: email.trim(),
      password,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };

    const updated = [...registeredUsers, newRecord];
    setRegisteredUsers(updated);
    saveRegisteredUsers(updated);

    // Registration must NOT authenticate the user; they must sign in manually.
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...data });
  };

  const updateAddress = (address: ShippingAddress) => {
    if (!user) return;
    setUser({
      ...user,
      address,
      savedAddresses: [address, ...(user.savedAddresses || []).filter((a) => a.street !== address.street)],
    });
  };

  const addAddress = (address: ShippingAddress) => {
    if (!user) return;
    setUser({
      ...user,
      savedAddresses: [...(user.savedAddresses || []), address],
    });
  };

  const removeAddress = (index: number) => {
    if (!user) return;
    const updated = [...(user.savedAddresses || [])];
    updated.splice(index, 1);
    setUser({
      ...user,
      savedAddresses: updated,
    });
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id === orderId || o.orderNumber?.toLowerCase() === orderId.toLowerCase());
  };

  const activeUser = user
    ? {
        ...user,
        orders,
        savedAddresses: user.savedAddresses || [],
      }
    : null;

  return (
    <AuthenticationContext.Provider
      value={{
        user: activeUser,
        isAuthenticated: !!user,
        orders,
        login,
        register,
        logout,
        updateProfile,
        updateAddress,
        addAddress,
        removeAddress,
        addOrder,
        getOrderById,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuthentication = () => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error('useAuthentication must be used within an AuthenticationProvider');
  }
  return context;
};
