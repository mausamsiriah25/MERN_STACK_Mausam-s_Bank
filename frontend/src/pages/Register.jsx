import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdOutlineAccountBalance } from "react-icons/md";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialForm = { name: "", email: "", password: "", phone: "", address: "", accountType: "Savings" };

const Register = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.token, data.user);
      toast.success(`Account created! Your account number is ${data.user.accountNumber}`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 py-10">
      <div className="w-full max-w-xl rounded-xl2 bg-white p-8 shadow-card sm:p-10">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald text-xl text-white">
            <MdOutlineAccountBalance />
          </div>
          <span className="font-display text-lg font-bold text-navy-900">Mausam's Bank</span>
        </div>

        <h1 className="text-2xl font-bold text-navy-900">Open a new account</h1>
        <p className="mt-1 text-sm text-navy-700/60">Join Mausam's Bank in under a minute</p>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Full Name</label>
            <input name="name" required value={form.name} onChange={handleChange} className="input-field" placeholder="Mausam Sharma" />
          </div>

          <div>
            <label className="label">Email</label>
            <input type="email" name="email" required value={form.email} onChange={handleChange} className="input-field" placeholder="you@example.com" />
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input name="phone" required value={form.phone} onChange={handleChange} className="input-field" placeholder="98XXXXXXXX" />
          </div>

          <div>
            <label className="label">Password</label>
            <input type="password" name="password" required minLength={6} value={form.password} onChange={handleChange} className="input-field" placeholder="Min. 6 characters" />
          </div>

          <div>
            <label className="label">Account Type</label>
            <select name="accountType" value={form.accountType} onChange={handleChange} className="input-field">
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="label">Address (optional)</label>
            <input name="address" value={form.address} onChange={handleChange} className="input-field" placeholder="City, Country" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary sm:col-span-2">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-700/60">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-emerald-dark hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
