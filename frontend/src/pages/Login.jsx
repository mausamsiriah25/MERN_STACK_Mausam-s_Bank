import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdOutlineAccountBalance, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = ({ isAdmin = false }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);

      if (isAdmin && data.user.role !== "admin") {
        toast.error("This login is for administrators only");
        setLoading(false);
        return;
      }
      if (!isAdmin && data.user.role !== "customer") {
        toast.error("Please use the admin login page");
        setLoading(false);
        return;
      }

      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
      navigate(data.user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-xl2 bg-white shadow-card lg:grid-cols-2">
        {/* Left brand panel */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-navy-900 to-navy-700 p-10 text-white lg:flex">
          <div>
            <div className="mb-8 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald text-xl">
                <MdOutlineAccountBalance />
              </div>
              <span className="font-display text-lg font-bold">Mausam's Bank</span>
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight">
              Smart Banking.
              <br /> Simple Banking.
            </h2>
            <p className="mt-4 text-sm text-white/60">
              Manage your money with a bank built for clarity — deposits, transfers, and statements, all in one calm dashboard.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 text-xs text-white/50">
            "Everything about my account, at a glance. No clutter, no confusion."
          </div>
        </div>

        {/* Right form panel */}
        <div className="p-8 sm:p-10">
          <h1 className="text-2xl font-bold text-navy-900">{isAdmin ? "Admin Login" : "Welcome back"}</h1>
          <p className="mt-1 text-sm text-navy-700/60">
            {isAdmin ? "Sign in to manage the bank" : "Sign in to access your account"}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <MdEmail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-700/40" />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <MdLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-700/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-700/40"
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {!isAdmin && (
            <p className="mt-6 text-center text-sm text-navy-700/60">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-emerald-dark hover:underline">
                Create one
              </Link>
            </p>
          )}

          <p className="mt-3 text-center text-xs text-navy-700/40">
            {isAdmin ? (
              <Link to="/login" className="hover:underline">
                Customer login instead
              </Link>
            ) : (
              <Link to="/admin/login" className="hover:underline">
                Admin login instead
              </Link>
            )}
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 p-3 text-center text-xs text-navy-700/50">
            Demo: {isAdmin ? "admin@mausamsbank.com / Admin@123" : "customer@mausamsbank.com / Customer@123"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
