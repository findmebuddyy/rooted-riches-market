import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const activeCategory = searchParams.get('category') || '';

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*');
      return data || [];
    },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', activeCategory, search],
    queryFn: async () => {
      let query = supabase.from('products').select('*, categories(name, slug)');
      if (activeCategory) {
        const cat = categories.find(c => c.slug === activeCategory);
        if (cat) query = query.eq('category_id', cat.id);
      }
      if (search) query = query.ilike('name', `%${search}%`);
      const { data } = await query.order('created_at', { ascending: false });
      return data || [];
    },
    enabled: categories.length > 0 || !activeCategory,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Our Products</h1>
      <p className="mt-1 text-muted-foreground">Sustainable goods from Prosopis juliflora wood</p>

      {/* Search & Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSearchParams({})}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!activeCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSearchParams({ category: cat.slug })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeCategory === cat.slug ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border bg-card">
              <div className="aspect-square bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-2/3 bg-muted rounded" />
                <div className="h-5 w-1/3 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p: any) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              image_url={p.image_url}
              category={p.categories?.name}
              stock={p.stock}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
