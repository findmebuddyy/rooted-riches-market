import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const statusColor: Record<string, string> = {
  pending: 'bg-warning/20 text-warning',
  processing: 'bg-primary/20 text-primary',
  shipped: 'bg-accent/20 text-accent-foreground',
  delivered: 'bg-success/20 text-success',
  cancelled: 'bg-destructive/20 text-destructive',
};

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  if (!user) { navigate('/auth'); return null; }

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error: itemsErr } = await supabase.from('order_items').delete().eq('order_id', id);
      if (itemsErr) throw itemsErr;
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('Order deleted'); },
    onError: (err: any) => toast.error(err.message || 'Cannot delete this order'),
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold">My Orders</h1>

      {isLoading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-16 text-center">
          <Package className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="rounded-lg border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusColor[order.status] || ''} variant="secondary">{order.status}</Badge>
                  <span className="font-semibold">${order.total.toFixed(2)}</span>
                  {order.status === 'pending' && (
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteOrder.mutate(order.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {order.order_items?.map((item: any) => (
                  <span key={item.id} className="mr-3">{item.products?.name} ×{item.quantity}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
