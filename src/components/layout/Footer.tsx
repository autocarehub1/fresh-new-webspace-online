import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Shield, Twitter } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-medical-blue text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-8 h-8 rounded-md bg-white grid place-items-center">
                <span className="text-medical-blue text-xs font-bold">CNL</span>
              </div>
              <span>Catalyst<span className="text-medical-blue-light">Network</span></span>
            </Link>
            <p className="mt-4 text-sm text-gray-300">
              Providing professional logistics services with unmatched reliability, speed, and compliance throughout San Antonio.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="#" aria-label="Facebook" className="text-gray-300 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-300 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-300 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-gray-300 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services/urgent" className="text-gray-300 hover:text-white transition-colors">Urgent Delivery</Link>
              </li>
              <li>
                <Link to="/services/same-day" className="text-gray-300 hover:text-white transition-colors">Same-Day Delivery</Link>
              </li>
              <li>
                <Link to="/services/scheduled" className="text-gray-300 hover:text-white transition-colors">Scheduled Routes</Link>
              </li>
              <li>
                <Link to="/services/temperature-controlled" className="text-gray-300 hover:text-white transition-colors">Temperature-Controlled</Link>
              </li>
              <li>
                <Link to="/services/specimen" className="text-gray-300 hover:text-white transition-colors">Specimen Transport</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/tracking" className="text-gray-300 hover:text-white transition-colors">Track Delivery</Link>
              </li>
              <li>
                <Link to="/request-pickup" className="text-gray-300 hover:text-white transition-colors">Request Pickup</Link>
              </li>
              <li>
                <Link to="/admin" className="text-gray-300 hover:text-white transition-colors">Admin Portal</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin size={18} className="flex-shrink-0 mt-1" />
                <span className="text-gray-300">San Antonio, Texas 78254</span>
              </li>
              <li className="flex gap-3">
                <Phone size={18} className="flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Emergency Pickup:</p>
                  <a href="tel:4322022150" className="font-bold text-medical-teal hover:underline">(432)-202-2150</a>
                </div>
              </li>
              <li className="flex gap-3">
                <Mail size={18} className="flex-shrink-0" />
                <a href="mailto:catalystlogistics2025@gmail.com" className="text-gray-300 hover:text-white transition-colors">catalystlogistics2025@gmail.com</a>
              </li>
              <li className="flex gap-3">
                <Shield size={18} className="flex-shrink-0" />
                <span className="text-gray-300">HIPAA Compliant</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-700 text-gray-400 text-sm flex flex-col md:flex-row justify-between">
          <p>&copy; {new Date().getFullYear()} Catalyst Network Logistics. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
