import { Link } from "react-router-dom";
import { Home, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => (
  <footer className="bg-ink-900 text-ink-300 mt-20">
    <div className="container-app py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
      <div className="col-span-2 md:col-span-1">
        <Link to="/" className="flex items-center gap-1.5 font-display font-bold text-xl text-white mb-3">
          <Home size={20} />
          HomelyHub
        </Link>
        <p className="text-sm text-ink-400">Find your perfect stay, anywhere in India.</p>
        <div className="flex items-center gap-3 mt-4">
          <Facebook size={18} className="hover:text-white cursor-pointer" />
          <Twitter size={18} className="hover:text-white cursor-pointer" />
          <Instagram size={18} className="hover:text-white cursor-pointer" />
        </div>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/contact" className="hover:text-white">About</Link></li>
          <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          <li><Link to="/become-host" className="hover:text-white">Become a Host</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3 text-sm">Support</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/contact" className="hover:text-white">Help Center</Link></li>
          <li><Link to="/contact" className="hover:text-white">Safety Information</Link></li>
          <li><Link to="/contact" className="hover:text-white">Cancellation Options</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/contact" className="hover:text-white">Privacy Policy</Link></li>
          <li><Link to="/contact" className="hover:text-white">Terms of Service</Link></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-ink-800 py-4 text-center text-xs text-ink-500">
      © {new Date().getFullYear()} HomelyHub. All rights reserved. Built as a portfolio project.
    </div>
  </footer>
);

export default Footer;
