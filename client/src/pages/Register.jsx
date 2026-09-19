import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { register: registerUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const password = watch("password");

  const onSubmit = async (values) => {
    setServerError("");
    setSubmitting(true);
    try {
      await registerUser(values);
      navigate("/");
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed. Please try again.");
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
        <h1 className="text-xl font-semibold text-center mb-1">Create your account</h1>
        <p className="text-sm text-ink-500 text-center mb-6">Join HomelyHub to book and host stays</p>

        {serverError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{serverError}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Full name</label>
            <input
              type="text"
              className="input-field"
              placeholder="Jane Doe"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>
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
              placeholder="At least 6 characters"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
              })}
            />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Confirm password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Re-enter password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val) => val === password || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center text-ink-500 mt-6">
          Already have an account? <Link to="/login" className="text-brand-600 font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
