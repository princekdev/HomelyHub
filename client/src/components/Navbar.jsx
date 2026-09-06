import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Home, Menu, X, Heart, User, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? "text-brand-600" : "text-ink-700 hover:text-brand-600"
  }`;

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-ink-100">
      <nav className="container-app flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-1.5 font-display font-bold text-xl text-brand-500">
          <Home size={22} className="fill-brand-100" />
          HomelyHub
        </Link>

        <div className="hidden md:flex items-center gap-7">
          <NavLink to="/" className={navLinkClass} end>Home</NavLink>
          <NavLink to="/explore" className={navLinkClass}>Explore</NavLink>
          <NavLink to="/become-host" className={navLinkClass}>Become a Host</NavLink>
          {isAuthenticated && (
            <NavLink to="/favorites" className={navLinkClass}>Favorites</NavLink>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/register" className="btn-primary">Sign up</Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-ink-200 hover:shadow-sm"
              >
                <img
                  src={user.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f6402a&color=fff`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium">{user.name.split(" ")[0]}</span>
              </button>
              {profileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-cardHover border border-ink-100 py-2 animate-[fadeIn_0.1s_ease-out]"
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-ink-50">
                    <User size={15} /> My Profile
                  </Link>
                  <Link to="/bookings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-ink-50">
                    <LayoutDashboard size={15} /> My Bookings
                  </Link>
                  {(user.role === "host" || user.role === "admin") && (
                    <Link to="/host/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-ink-50">
                      <LayoutDashboard size={15} /> Host Dashboard
                    </Link>
                  )}
                  {user.role === "admin" && (
                    <Link to="/admin/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-ink-50">
                      <ShieldCheck size={15} /> Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <Menu size={24} />
        </button>
      </nav>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-cardHover p-6 flex flex-col gap-4 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-brand-500">HomelyHub</span>
              <button onClick={() => setDrawerOpen(false)}><X size={22} /></button>
            </div>
            {isAuthenticated && (
              <div className="flex items-center gap-3 pb-4 border-b border-ink-100">
                <img
                  src={user.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f6402a&color=fff`}
                  className="w-10 h-10 rounded-full object-cover"
                  alt={user.name}
                />
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-ink-500 capitalize">{user.role}</p>
                </div>
              </div>
            )}
            <Link to="/" onClick={() => setDrawerOpen(false)} className="text-ink-800 font-medium">Home</Link>
            <Link to="/explore" onClick={() => setDrawerOpen(false)} className="text-ink-800 font-medium">Explore</Link>
            <Link to="/become-host" onClick={() => setDrawerOpen(false)} className="text-ink-800 font-medium">Become a Host</Link>
            {isAuthenticated && (
              <>
                <Link to="/favorites" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2 text-ink-800 font-medium"><Heart size={16} />Favorites</Link>
                <Link to="/bookings" onClick={() => setDrawerOpen(false)} className="text-ink-800 font-medium">My Bookings</Link>
                <Link to="/profile" onClick={() => setDrawerOpen(false)} className="text-ink-800 font-medium">Profile</Link>
                {(user.role === "host" || user.role === "admin") && (
                  <Link to="/host/dashboard" onClick={() => setDrawerOpen(false)} className="text-ink-800 font-medium">Host Dashboard</Link>
                )}
                {user.role === "admin" && (
                  <Link to="/admin/dashboard" onClick={() => setDrawerOpen(false)} className="text-ink-800 font-medium">Admin Dashboard</Link>
                )}
              </>
            )}
            <div className="mt-auto flex flex-col gap-2">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" onClick={() => setDrawerOpen(false)} className="btn-outline w-full">Login</Link>
                  <Link to="/register" onClick={() => setDrawerOpen(false)} className="btn-primary w-full">Sign up</Link>
                </>
              ) : (
                <button onClick={() => { setDrawerOpen(false); handleLogout(); }} className="btn-outline w-full text-red-600">
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
