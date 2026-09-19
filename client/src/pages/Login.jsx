import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (values) => {
    setServerError("");
    setSubmitting(true);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md card-surface p-8">
        <Link to="/" className="flex items-center justify-center gap-1.5 font-display font-bold text-2xl text-brand-500 mb-6">
          <Home size={24} /> HomelyHub
        </Link>
        <h1 className="text-xl font-semibold text-center mb-1">Welcome back</h1>
        <p className="text-sm text-ink-500 text-center mb-6">Login to continue booking your next stay</p>

        {serverError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{serverError}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center text-ink-500 mt-6">
          Don't have an account? <Link to="/register" className="text-brand-600 font-medium">Sign up</Link>
        </p>

        <div className="mt-6 pt-4 border-t border-ink-100 text-xs text-ink-400">
          <p className="font-medium mb-1">Demo accounts:</p>
          <p>Admin: admin@homelyhub.com / Admin@123</p>
          <p>Host: rohan.host@homelyhub.com / Host@123</p>
          <p>User: priya@homelyhub.com / User@123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
