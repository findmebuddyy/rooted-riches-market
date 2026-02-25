import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*, categories(name)').eq('id', id!).single();
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
        <div className="aspect-video bg-muted rounded-lg" />
        <div className="h-8 w-1/2 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
      </div>
    </div>
  );

  if (!product) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <p className="text-lg text-muted-foreground">Product not found</p>
      <Button className="mt-4" onClick={() => navigate('/products')}>Back to Products</Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Package className="h-16 w-16" />
            </div>
          )}
        </div>

        <div>
          {product.categories && (
            <span className="text-sm font-medium text-primary">{(product.categories as any).name}</span>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold text-foreground">${product.price.toFixed(2)}</p>
          <p className="mt-4 text-muted-foreground leading-relaxed">{product.description || 'No description available.'}</p>

          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className={product.stock > 0 ? 'text-success' : 'text-destructive'}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {product.stock > 0 && (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-lg border">
                <button className="px-3 py-2 text-lg" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span className="px-3 py-2 text-sm font-medium">{qty}</span>
                <button className="px-3 py-2 text-lg" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
              </div>
              <Button size="lg" onClick={() => user ? addToCart(product.id, qty) : navigate('/auth')}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
