import { useState } from "react";
import toast from "react-hot-toast";
import { MdAddCircle } from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/format";

const quickAmounts = [500, 1000, 5000, 10000];

const Deposit = () => {
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(amount) <= 0) return toast.error("Enter a valid amount");

    setLoading(true);
    try {
      const { data } = await api.post("/customer/deposit", { amount: Number(amount), note });
      updateUser({ ...user, balance: data.balance });
      toast.success(data.message);
      setAmount("");
      setNote("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-navy-900">Deposit Money</h1>
        <p className="mt-1 text-sm text-navy-700/60">Add funds to your account instantly</p>

        <div className="card mt-6">
          <div className="mb-6 flex items-center justify-between rounded-xl bg-emerald/10 p-4">
            <span className="text-sm font-medium text-navy-700/70">Current Balance</span>
            <span className="font-bold text-emerald-dark">{formatCurrency(user?.balance)}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Amount (₹)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="input-field text-lg font-semibold"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {quickAmounts.map((a) => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className="rounded-lg border border-navy-700/10 px-3 py-1 text-xs font-semibold text-navy-700 hover:border-emerald hover:text-emerald-dark"
                  >
                    +{formatCurrency(a)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Note (optional)</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} className="input-field" placeholder="e.g. Salary, savings top-up" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              <MdAddCircle /> {loading ? "Processing..." : "Deposit Now"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Deposit;
