
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, User, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/49b6466e-7267-4a9d-a03c-5b25317f80a4.png" 
            alt="Catalyst Network Logistics" 
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-medical-teal transition-colors">
            Home
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm font-medium hover:text-medical-teal transition-colors flex items-center gap-1">
              Services
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link to="/services#medical">Medical Delivery</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/services#baggage">Baggage Delivery</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/services#pet">Pet Delivery</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/services#home">Home Improvement</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/tracking" className="text-sm font-medium hover:text-medical-teal transition-colors">
            Track Delivery
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-medical-teal transition-colors">
            About Us
          </Link>
          <Link to="/contact" className="text-sm font-medium hover:text-medical-teal transition-colors">
            Contact
          </Link>
          <Link to="/driver-auth" className="text-sm font-medium hover:text-medical-teal transition-colors">
            Driver Login
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2">
            <Phone size={16} />
            <span className="text-medical-teal font-medium">(432)-202-2150</span>
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
              <div className="flex flex-col gap-2">
                <span className="text-lg font-medium">Services</span>
                <div className="pl-4 flex flex-col gap-2">
                  <Link to="/services#medical" className="text-base hover:text-medical-teal transition-colors">
                    Medical Delivery
                  </Link>
                  <Link to="/services#baggage" className="text-base hover:text-medical-teal transition-colors">
                    Baggage Delivery
                  </Link>
                  <Link to="/services#pet" className="text-base hover:text-medical-teal transition-colors">
                    Pet Delivery
                  </Link>
                  <Link to="/services#home" className="text-base hover:text-medical-teal transition-colors">
                    Home Improvement
                  </Link>
                </div>
              </div>
              <Link to="/tracking" className="text-lg font-medium hover:text-medical-teal transition-colors">
                Track Delivery
              </Link>
              <Link to="/about" className="text-lg font-medium hover:text-medical-teal transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-lg font-medium hover:text-medical-teal transition-colors">
                Contact
              </Link>
              <Link to="/driver-auth" className="text-lg font-medium hover:text-medical-teal transition-colors">
                Driver Login
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
                <a href="tel:4322022150" className="text-lg font-bold text-medical-teal hover:underline">
                  (432)-202-2150
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
