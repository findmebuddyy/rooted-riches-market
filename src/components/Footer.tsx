import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t bg-card">
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-display text-lg font-bold">EcoWood</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Transforming invasive Prosopis juliflora into sustainable, beautiful products. Every purchase helps restore ecosystems.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2">
            <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Products</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">My Account</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3">Contact</h4>
          <p className="text-sm text-muted-foreground">info@ecowood.com</p>
          <p className="text-sm text-muted-foreground">+254 700 000 000</p>
        </div>
      </div>
      <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EcoWood. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
