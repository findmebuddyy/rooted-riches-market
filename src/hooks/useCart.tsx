import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    stock: number;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, qty?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  loading: false,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  total: 0,
  count: 0,
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('cart_items')
        .select('id, product_id, quantity, products(id, name, price, image_url, stock)')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data as unknown as CartItem[]) || [];
    },
    enabled: !!user,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['cart'] });

  const addMutation = useMutation({
    mutationFn: async ({ productId, qty }: { productId: string; qty: number }) => {
      if (!user) throw new Error('Must be logged in');
      const existing = items.find(i => i.product_id === productId);
      if (existing) {
        const { error } = await supabase.from('cart_items').update({ quantity: existing.quantity + qty }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cart_items').insert({ user_id: user.id, product_id: productId, quantity: qty });
        if (error) throw error;
      }
    },
    onSuccess: () => { invalidate(); toast.success('Added to cart'); },
    onError: () => toast.error('Failed to add to cart'),
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ itemId, qty }: { itemId: string; qty: number }) => {
      const { error } = await supabase.from('cart_items').update({ quantity: qty }).eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const total = items.reduce((sum, item) => sum + item.products.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, loading,
      addToCart: (productId, qty = 1) => addMutation.mutate({ productId, qty }),
      removeFromCart: (itemId) => removeMutation.mutate(itemId),
      updateQuantity: (itemId, qty) => updateMutation.mutate({ itemId, qty }),
      clearCart: () => clearMutation.mutate(),
      total, count,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
