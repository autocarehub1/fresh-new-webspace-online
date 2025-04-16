
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, User } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-medical-blue">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-medical-blue to-medical-teal grid place-items-center">
            <span className="text-white text-xs font-bold">EMD</span>
          </div>
          <span>ExpressMed<span className="text-medical-teal">Dispatch</span></span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-medical-teal transition-colors">
            Home
          </Link>
          <Link to="/services" className="text-sm font-medium hover:text-medical-teal transition-colors">
            Services
          </Link>
          <Link to="/tracking" className="text-sm font-medium hover:text-medical-teal transition-colors">
            Track Delivery
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-medical-teal transition-colors">
            About Us
          </Link>
          <Link to="/contact" className="text-sm font-medium hover:text-medical-teal transition-colors">
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2">
            <Phone size={16} />
            <span>Emergency: (210) 555-0123</span>
          </Button>
          <Button asChild variant="default" size="sm">
            <Link to="/request-pickup">Request Pickup</Link>
          </Button>
          <Button asChild variant="outline" size="icon">
            <Link to="/login">
              <User size={18} />
              <span className="sr-only">Login</span>
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu size={20} />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              <Link to="/" className="text-lg font-medium hover:text-medical-teal transition-colors">
                Home
              </Link>
              <Link to="/services" className="text-lg font-medium hover:text-medical-teal transition-colors">
                Services
              </Link>
              <Link to="/tracking" className="text-lg font-medium hover:text-medical-teal transition-colors">
                Track Delivery
              </Link>
              <Link to="/about" className="text-lg font-medium hover:text-medical-teal transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-lg font-medium hover:text-medical-teal transition-colors">
                Contact
              </Link>
              <Button asChild variant="default" className="mt-4">
                <Link to="/request-pickup">Request Pickup</Link>
              </Button>
              <Button asChild variant="outline" className="mt-2">
                <Link to="/login">
                  <User size={18} className="mr-2" />
                  <span>Login</span>
                </Link>
              </Button>
              <div className="mt-4 border-t pt-4">
                <p className="text-sm font-medium">Emergency Pickup</p>
                <a href="tel:2105550123" className="text-lg font-bold text-medical-red hover:underline">
                  (210) 555-0123
                </a>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
