import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Leaf, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">Prosopis</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Home</Link>
          <Link to="/products" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Products</Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">About</Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user && (
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/cart')}>
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                  {count}
                </Badge>
              )}
            </Button>
          )}
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                  <LayoutDashboard className="mr-1 h-4 w-4" />
                  Admin
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
                My Orders
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => navigate('/auth')}>
              <User className="mr-1 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-background p-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/" onClick={() => setOpen(false)} className="text-sm font-medium">Home</Link>
            <Link to="/products" onClick={() => setOpen(false)} className="text-sm font-medium">Products</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="text-sm font-medium">About</Link>
            {user && <Link to="/cart" onClick={() => setOpen(false)} className="text-sm font-medium">Cart ({count})</Link>}
            {user && <Link to="/orders" onClick={() => setOpen(false)} className="text-sm font-medium">My Orders</Link>}
            {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="text-sm font-medium">Admin Dashboard</Link>}
            {user ? (
              <Button variant="outline" size="sm" onClick={() => { signOut(); setOpen(false); }}>Sign Out</Button>
            ) : (
              <Button size="sm" onClick={() => { navigate('/auth'); setOpen(false); }}>Sign In</Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
