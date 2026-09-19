import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, TrendingUp, CalendarCheck, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BENEFITS = [
  { icon: TrendingUp, title: "Earn extra income", desc: "Turn your spare property into a steady income stream." },
  { icon: CalendarCheck, title: "Full control", desc: "Manage your availability, pricing, and bookings your way." },
  { icon: ShieldCheck, title: "Trusted platform", desc: "Verified guests and secure booking management." },
];

// Note: HomelyHub does not let users grant themselves host access. Every
// account starts as a regular "user" and hosting is switched on only by an
// administrator (via the database or the Admin > Users panel), which keeps
// role assignment fully backend-controlled. This page is informational and
// points people to get in touch instead of self-upgrading.
const BecomeHost = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const alreadyHost = user && (user.role === "host" || user.role === "admin");

  return (
    <div className="container-app py-16 max-w-3xl text-center">
      <h1 className="text-3xl font-bold mb-3">Turn your property into an opportunity.</h1>
      <p className="text-ink-500 mb-10">
        Join hosts earning on HomelyHub. List your property, set your own price, and welcome guests from across India.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {BENEFITS.map((b) => (
          <div key={b.title} className="card-surface p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-500 mb-3">
              <b.icon size={22} />
            </div>
            <h3 className="font-semibold text-sm mb-1">{b.title}</h3>
            <p className="text-xs text-ink-500">{b.desc}</p>
          </div>
        ))}
      </div>

      {alreadyHost ? (
        <button onClick={() => navigate("/host/dashboard")} className="btn-primary">
          Go to Host Dashboard
        </button>
      ) : (
        <div className="card-surface p-6 max-w-md mx-auto text-left">
          <p className="text-sm text-ink-700 mb-4">
            {isAuthenticated
              ? "Host access on HomelyHub is activated by our team, not by users themselves. Reach out and we'll enable hosting on your account."
              : "Create an account first, then reach out to our team to have hosting enabled."}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            {!isAuthenticated && (
              <Link to="/register" className="btn-primary flex-1 justify-center">
                Create an account
              </Link>
            )}
            <Link to="/contact" className="btn-outline flex-1 justify-center">
              <Mail size={15} /> Contact us to host
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default BecomeHost;
