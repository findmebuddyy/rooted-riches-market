import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState } from 'react';
import { Plus, Package, ShoppingBag, Users, Pencil, Trash2, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'products' | 'orders'>('products');
  const [editProduct, setEditProduct] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Loading...</div>;
  if (!user || !isAdmin) { navigate('/'); return null; }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>

      <div className="mt-6 flex gap-2">
        <Button variant={tab === 'products' ? 'default' : 'outline'} onClick={() => setTab('products')}>
          <Package className="mr-1 h-4 w-4" /> Products
        </Button>
        <Button variant={tab === 'orders' ? 'default' : 'outline'} onClick={() => setTab('orders')}>
          <ShoppingBag className="mr-1 h-4 w-4" /> Orders
        </Button>
      </div>

      <div className="mt-6">
        {tab === 'products' ? (
          <ProductsTab
            editProduct={editProduct}
            setEditProduct={setEditProduct}
            showForm={showForm}
            setShowForm={setShowForm}
          />
        ) : (
          <OrdersTab />
        )}
      </div>
    </div>
  );
};

const ProductsTab = ({ editProduct, setEditProduct, showForm, setShowForm }: any) => {
  const qc = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*');
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted'); },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl font-semibold">Products ({products.length})</h2>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditProduct(null); setShowForm(true); }}>
              <Plus className="mr-1 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            </DialogHeader>
            <ProductForm
              product={editProduct}
              categories={categories}
              onDone={() => { setShowForm(false); setEditProduct(null); qc.invalidateQueries({ queryKey: ['admin-products'] }); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Product</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Price</th>
              <th className="px-4 py-3 text-left font-medium">Stock</th>
              <th className="px-4 py-3 text-left font-medium">Featured</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p: any) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.categories?.name || '—'}</td>
                <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">{p.featured ? '⭐' : '—'}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setEditProduct(p); setShowForm(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProductForm = ({ product, categories, onDone }: { product: any; categories: any[]; onDone: () => void }) => {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [stock, setStock] = useState(product?.stock?.toString() || '0');
  const [categoryId, setCategoryId] = useState(product?.category_id || '');
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [featured, setFeatured] = useState(product?.featured || false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category_id: categoryId || null,
        image_url: imageUrl || null,
        featured,
      };
      if (product) {
        const { error } = await supabase.from('products').update(data).eq('id', product.id);
        if (error) throw error;
        toast.success('Product updated');
      } else {
        const { error } = await supabase.from('products').insert(data);
        if (error) throw error;
        toast.success('Product created');
      }
      onDone();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Price ($)</Label>
          <Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <div>
          <Label>Stock</Label>
          <Input type="number" value={stock} onChange={e => setStock(e.target.value)} required />
        </div>
      </div>
      <div>
        <Label>Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Image URL</Label>
        <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={featured} onCheckedChange={setFeatured} />
        <Label>Featured product</Label>
      </div>
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
      </Button>
    </form>
  );
};

const OrdersTab = () => {
  const qc = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name))')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order updated'); },
  });

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error: itemsErr } = await supabase.from('order_items').delete().eq('order_id', id);
      if (itemsErr) throw itemsErr;
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order deleted'); },
  });

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-4">Orders ({orders.length})</h2>
      <div className="space-y-4">
        {orders.map((order: any) => (
          <div key={order.id} className="rounded-lg border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Customer ID: {order.user_id?.slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground">Address: {order.shipping_address || '—'}</p>
              </div>
              <div className="text-right space-y-2">
                <p className="text-lg font-semibold">${order.total.toFixed(2)}</p>
                <Select value={order.status} onValueChange={(v) => updateStatus.mutate({ id: order.id, status: v })}>
                  <SelectTrigger className="mt-2 w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteOrder.mutate(order.id)}>
                  <Trash2 className="mr-1 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              Items: {order.order_items?.map((item: any) => `${item.products?.name} ×${item.quantity}`).join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
