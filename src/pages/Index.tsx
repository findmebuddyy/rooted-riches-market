import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Recycle, TreePine, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import heroBg from '@/assets/hero-bg.jpg';

const features = [
  { icon: Recycle, title: 'Eco-Friendly', desc: 'Products made from invasive species removal' },
  { icon: TreePine, title: 'Restoring Ecosystems', desc: 'Every purchase helps native forests recover' },
  { icon: Shield, title: 'Premium Quality', desc: 'Durable, handcrafted Prosopis wood products' },
  { icon: Leaf, title: 'Carbon Neutral', desc: 'Sustainable production with minimal footprint' },
];

const Index = () => {
  const { data: featured = [] } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('featured', true)
        .limit(4);
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

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-hero opacity-80" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <div className="max-w-2xl animate-fade-in">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary-foreground">
              <Leaf className="h-3 w-3" /> Sustainable Wood Products
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-primary-foreground md:text-6xl">
              From Invasive to <span className="text-gradient-eco">Innovative</span>
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80 max-w-lg">
              Premium eco-friendly products crafted from Prosopis juliflora — turning an ecological challenge into beautiful, sustainable solutions.
            </p>
            <div className="mt-8 flex gap-3">
              <Button size="lg" asChild>
                <Link to="/products">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/about">Our Mission</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-4 rounded-lg border bg-card p-6 shadow-card" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="rounded-lg bg-primary/10 p-2">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-card py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center font-display text-3xl font-bold">Shop by Category</h2>
          <p className="mt-2 text-center text-muted-foreground">Browse our range of sustainable Prosopis wood products</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group rounded-lg border bg-background p-6 text-center transition-all hover:border-primary hover:shadow-eco"
              >
                <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold">Featured Products</h2>
              <p className="mt-1 text-muted-foreground">Handpicked sustainable selections</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/products">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p: any) => (
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
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-eco py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground">Join the Sustainable Revolution</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-md mx-auto">
            Every product you buy helps remove invasive species and restore natural ecosystems.
          </p>
          <Button size="lg" variant="secondary" className="mt-6" asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
