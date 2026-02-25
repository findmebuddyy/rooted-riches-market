import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState('');

  if (!user) {
    navigate('/auth');
    return null;
  }

  const placeOrder = async () => {
    if (!address.trim()) {
      toast.error('Please enter a shipping address');
      return;
    }
    setPlacing(true);
    try {
      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user.id,
        total,
        shipping_address: address,
        status: 'pending',
      }).select().single();
      if (error) throw error;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price,
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-bold">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">Start shopping to add items to your cart</p>
        <Button className="mt-6" onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Shopping Cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-lg border bg-card p-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                {item.products.image_url && (
                  <img src={item.products.image_url} alt={item.products.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-display font-semibold">{item.products.name}</h3>
                  <p className="text-sm text-muted-foreground">${item.products.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded border">
                    <button className="px-2 py-1 text-sm" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>−</button>
                    <span className="px-2 py-1 text-sm">{item.quantity}</span>
                    <button className="px-2 py-1 text-sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">${(item.products.price * item.quantity).toFixed(2)}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border bg-card p-6 h-fit sticky top-20">
          <h2 className="font-display text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
            <div className="border-t pt-2 flex justify-between font-semibold text-lg">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="address">Shipping Address</Label>
            <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your shipping address" className="mt-1" />
          </div>
          <Button className="mt-4 w-full" size="lg" onClick={placeOrder} disabled={placing}>
            {placing ? 'Placing Order...' : 'Place Order'} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
