import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem, OrderPricing } from '../types';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  restaurantId: string | null;
  restaurantName: string | null;
  isMultiRestaurant: boolean;
  restaurantCount: number;
  restaurantsInCart: Array<{ id: string; name: string; itemCount: number }>;
  orderType: 'online' | 'dine_in' | 'takeaway';
  tableNumber: number | null;
  couponCode: string;
  discountAmount: number;
  tipAmount: number;
  pricing: OrderPricing;
  addToCart: (
    menuItem: MenuItem,
    restaurantId: string,
    restaurantName: string,
    quantity?: number,
    customizations?: Array<{ groupName: string; optionName: string; price: number }>,
    specialInstructions?: string
  ) => void;
  decrementItem: (menuItemIdOrName: string) => void;
  getItemQuantity: (menuItemIdOrName: string) => number;
  updateQuantity: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  setOrderType: (type: 'online' | 'dine_in' | 'takeaway') => void;
  setTableNumber: (num: number | null) => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  setTip: (tip: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('essen_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [restaurantId, setRestaurantId] = useState<string | null>(() => localStorage.getItem('essen_cart_rest_id'));
  const [restaurantName, setRestaurantName] = useState<string | null>(() => localStorage.getItem('essen_cart_rest_name'));
  const [orderType, setOrderType] = useState<'online' | 'dine_in' | 'takeaway'>('online');
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [tipAmount, setTipAmount] = useState<number>(0);

  // Group unique restaurants in current cart
  const restaurantsInCart = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; itemCount: number }>();
    for (const item of items) {
      const id = item.restaurantId || restaurantId || 'general';
      const name = item.restaurantName || restaurantName || 'Restaurant';
      const existing = map.get(id);
      if (existing) {
        existing.itemCount += item.quantity;
      } else {
        map.set(id, { id, name, itemCount: item.quantity });
      }
    }
    return Array.from(map.values());
  }, [items, restaurantId, restaurantName]);

  const isMultiRestaurant = restaurantsInCart.length > 1;
  const restaurantCount = restaurantsInCart.length;

  useEffect(() => {
    localStorage.setItem('essen_cart', JSON.stringify(items));
    if (items.length === 0) {
      setRestaurantId(null);
      setRestaurantName(null);
      localStorage.removeItem('essen_cart_rest_id');
      localStorage.removeItem('essen_cart_rest_name');
    } else {
      const uniqueNames = Array.from(new Set(items.map((i) => i.restaurantName).filter(Boolean)));
      if (uniqueNames.length === 1) {
        const singleName = uniqueNames[0] as string;
        const singleId = items.find((i) => i.restaurantId)?.restaurantId || null;
        setRestaurantName(singleName);
        setRestaurantId(singleId);
        if (singleId) localStorage.setItem('essen_cart_rest_id', singleId);
        localStorage.setItem('essen_cart_rest_name', singleName);
      } else if (uniqueNames.length > 1) {
        const multiName = `Multi-Restaurant (${uniqueNames.length} Outlets)`;
        setRestaurantName(multiName);
        localStorage.setItem('essen_cart_rest_name', multiName);
      }
    }
  }, [items]);

  // Transparent billing calculation
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const rawItemTotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
  const finalDiscount = Math.min(discountAmount, rawItemTotal);
  const taxableAmount = Math.max(0, rawItemTotal - finalDiscount);
  const applicableTaxes = Number(((taxableAmount * 5) / 100).toFixed(2));
  const serviceCharge = orderType === 'dine_in' ? Number(((taxableAmount * 5) / 100).toFixed(2)) : 0;
  const deliveryFee = orderType === 'online' ? (rawItemTotal >= 500 ? 0 : 40) : 0;
  const packagingFee = orderType === 'online' || orderType === 'takeaway' ? 20 : 0;
  const grandTotal = Number(
    (taxableAmount + applicableTaxes + serviceCharge + deliveryFee + packagingFee + tipAmount).toFixed(2)
  );

  const pricing: OrderPricing = {
    itemTotal: Number(rawItemTotal.toFixed(2)),
    discountAmount: Number(finalDiscount.toFixed(2)),
    couponCode: couponCode || undefined,
    taxableAmount: Number(taxableAmount.toFixed(2)),
    applicableTaxes,
    serviceCharge,
    deliveryFee,
    packagingFee,
    tipAmount,
    grandTotal,
  };

  const getItemQuantity = (menuItemIdOrName: string): number => {
    return items
      .filter((i) => i.menuItem._id === menuItemIdOrName || i.menuItem.name === menuItemIdOrName)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  const decrementItem = (menuItemIdOrName: string) => {
    const itemIndex = items.findIndex(
      (i) => i.menuItem._id === menuItemIdOrName || i.menuItem.name === menuItemIdOrName
    );
    if (itemIndex > -1) {
      updateQuantity(itemIndex, items[itemIndex].quantity - 1);
    }
  };

  const addToCart = (
    menuItem: MenuItem,
    newRestId: string,
    newRestName: string,
    quantity = 1,
    customizations: Array<{ groupName: string; optionName: string; price: number }> = [],
    specialInstructions = ''
  ) => {
    // Multi-Restaurant Cart: Dishes from all restaurants are allowed simultaneously!
    // If adding an identical un-customized item from the SAME restaurant, merge quantity
    if (customizations.length === 0 && !specialInstructions) {
      const existingIdx = items.findIndex(
        (i) =>
          (i.menuItem._id === menuItem._id || i.menuItem.name === menuItem.name) &&
          (i.restaurantId === newRestId || !i.restaurantId) &&
          i.selectedCustomizations.length === 0 &&
          !i.specialInstructions
      );

      if (existingIdx > -1) {
        updateQuantity(existingIdx, items[existingIdx].quantity + quantity);
        return;
      }
    }

    const customCost = customizations.reduce((s, c) => s + c.price, 0);
    const unitPrice = menuItem.price + customCost;
    const itemTotal = unitPrice * quantity;

    setItems((prev) => [
      ...prev,
      {
        menuItem,
        restaurantId: newRestId,
        restaurantName: newRestName,
        quantity,
        selectedCustomizations: customizations,
        specialInstructions,
        unitPrice,
        itemTotal,
      },
    ]);

    if (!restaurantId) {
      setRestaurantId(newRestId);
      setRestaurantName(newRestName);
    }
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity,
              itemTotal: item.unitPrice * quantity,
            }
          : item
      )
    );
  };

  const removeFromCart = (index: number) => {
    setItems((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
      }
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    setTableNumber(null);
    setCouponCode('');
    setDiscountAmount(0);
    setTipAmount(0);
  };

  const applyCoupon = (code: string, discount: number) => {
    setCouponCode(code);
    setDiscountAmount(discount);
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountAmount(0);
  };

  const setTip = (tip: number) => {
    setTipAmount(tip);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        restaurantId,
        restaurantName,
        isMultiRestaurant,
        restaurantCount,
        restaurantsInCart,
        orderType,
        tableNumber,
        couponCode,
        discountAmount,
        tipAmount,
        pricing,
        addToCart,
        decrementItem,
        getItemQuantity,
        updateQuantity,
        removeFromCart,
        clearCart,
        setOrderType,
        setTableNumber,
        applyCoupon,
        removeCoupon,
        setTip,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
