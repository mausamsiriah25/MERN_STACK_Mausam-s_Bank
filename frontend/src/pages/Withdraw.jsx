import { useState } from "react";
import toast from "react-hot-toast";
import { MdRemoveCircle } from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/format";

const Withdraw = () => {
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(amount) <= 0) return toast.error("Enter a valid amount");
    if (Number(amount) > user.balance) return toast.error("Insufficient balance");

    setLoading(true);
    try {
      const { data } = await api.post("/customer/withdraw", { amount: Number(amount), note });
      updateUser({ ...user, balance: data.balance });
      toast.success(data.message);
      setAmount("");
      setNote("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-navy-900">Withdraw Money</h1>
        <p className="mt-1 text-sm text-navy-700/60">Daily withdrawal limit applies for your security</p>

        <div className="card mt-6">
          <div className="mb-6 flex items-center justify-between rounded-xl bg-rose-50 p-4">
            <span className="text-sm font-medium text-navy-700/70">Available Balance</span>
            <span className="font-bold text-rose-600">{formatCurrency(user?.balance)}</span>
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
            </div>

            <div>
              <label className="label">Note (optional)</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} className="input-field" placeholder="e.g. ATM withdrawal" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full !bg-rose-600 hover:!bg-rose-700">
              <MdRemoveCircle /> {loading ? "Processing..." : "Withdraw Now"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Withdraw;
