import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <p className="text-6xl font-display font-bold text-brand-500 mb-3">404</p>
    <h1 className="text-xl font-semibold mb-2">Page not found</h1>
    <p className="text-ink-500 mb-6 max-w-sm text-sm">
      The page you're looking for doesn't exist or may have been moved.
    </p>
    <Link to="/" className="btn-primary">
      <Home size={16} /> Back to home
    </Link>
  </div>
);

export default NotFound;
