import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category?: string;
  stock: number;
}

const ProductCard = ({ id, name, price, image_url, category, stock }: ProductCardProps) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="group overflow-hidden rounded-lg border bg-card shadow-card transition-all hover:shadow-eco">
      <Link to={`/products/${id}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          {image_url ? (
            <img src={image_url} alt={name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <span className="font-display text-lg">No Image</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        {category && <span className="text-xs font-medium text-primary">{category}</span>}
        <Link to={`/products/${id}`}>
          <h3 className="mt-1 font-display text-lg font-semibold text-foreground transition-colors hover:text-primary">{name}</h3>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">${price.toFixed(2)}</span>
          {stock > 0 ? (
            <Button
              size="sm"
              onClick={() => user ? addToCart(id) : navigate('/auth')}
            >
              <ShoppingCart className="mr-1 h-4 w-4" />
              Add
            </Button>
          ) : (
            <span className="text-sm text-destructive">Out of stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
