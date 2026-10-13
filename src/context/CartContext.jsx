import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('dmosthigh_cart');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dmosthigh_cart', JSON.stringify(items));
  }, [items]);

  /**
   * Add item to cart. Distinguishes line items by productId + color + size
   */
  const addToCart = (product, color, size, quantity = 1, colorImage = null) => {
    const effectiveColor = color || 'Standard';
    const effectiveSize = size || 'Standard';
    const key = `${product._id}_${effectiveColor}_${effectiveSize}`;

    // Authoritative unit price
    const unitPrice =
      product.discountPrice !== null &&
      product.discountPrice !== undefined &&
      product.discountPrice > 0
        ? Number(product.discountPrice)
        : Number(product.price);

    // Resolve color image or first product image
    let selectedImage = colorImage;
    if (!selectedImage && product.images && product.images.length > 0) {
      const match = product.images.find(
        (img) => img.color && img.color.toLowerCase() === effectiveColor.toLowerCase()
      );
      selectedImage = match ? match.url : product.images[0].url;
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.key === key);

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      }

      // Add new distinct line item
      const newItem = {
        key,
        productId: product._id,
        name: product.name,
        slug: product.slug,
        price: unitPrice,
        originalPrice: Number(product.price),
        image: selectedImage || '',
        color: effectiveColor,
        size: effectiveSize,
        quantity: Math.max(1, quantity),
      };

      return [...prev, newItem];
    });

    setIsDrawerOpen(true);
  };

  /**
   * Remove item by line item key
   */
  const removeFromCart = (key) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  /**
   * Update quantity of a line item
   */
  const updateQuantity = (key, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(key);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.key === key) {
          return { ...item, quantity: Math.max(1, newQuantity) };
        }
        return item;
      })
    );
  };

  /**
   * Clear all cart items
   */
  const clearCart = () => {
    setItems([]);
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isDrawerOpen,
        setIsDrawerOpen,
        subtotal,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
