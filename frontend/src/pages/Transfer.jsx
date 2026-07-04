import { useState } from "react";
import toast from "react-hot-toast";
import { MdSwapHoriz, MdCheckCircle, MdSearch } from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/format";

const Transfer = () => {
  const { user, updateUser } = useAuth();
  const [accountNumber, setAccountNumber] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!accountNumber) return toast.error("Enter an account number");
    setVerifying(true);
    setReceiver(null);
    try {
      const { data } = await api.get(`/customer/verify-account/${accountNumber}`);
      if (data.receiver.status === "frozen") {
        toast.error("This account is frozen and cannot receive funds");
        return;
      }
      setReceiver(data.receiver);
      toast.success(`Account verified: ${data.receiver.name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Account not found");
    } finally {
      setVerifying(false);
    }
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!receiver) return toast.error("Please verify the receiver account first");
    if (Number(amount) <= 0) return toast.error("Enter a valid amount");
    if (Number(amount) > user.balance) return toast.error("Insufficient balance");
    setConfirmOpen(true);
  };

  const handleTransfer = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/customer/transfer", {
        receiverAccountNumber: receiver.accountNumber,
        amount: Number(amount),
        note,
      });
      updateUser({ ...user, balance: data.balance });
      toast.success(data.message);
      setAccountNumber("");
      setReceiver(null);
      setAmount("");
      setNote("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-navy-900">Transfer Money</h1>
        <p className="mt-1 text-sm text-navy-700/60">Send money to another Mausam's Bank account</p>

        <div className="card mt-6">
          <div className="mb-6 flex items-center justify-between rounded-xl bg-navy-900/5 p-4">
            <span className="text-sm font-medium text-navy-700/70">Available Balance</span>
            <span className="font-bold text-navy-900">{formatCurrency(user?.balance)}</span>
          </div>

          <form onSubmit={handlePreSubmit} className="space-y-4">
            <div>
              <label className="label">Receiver's Account Number</label>
              <div className="flex gap-2">
                <input
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value);
                    setReceiver(null);
                  }}
                  placeholder="MBxxxxxxxxxx"
                  className="input-field flex-1"
                />
                <button type="button" onClick={handleVerify} disabled={verifying} className="btn-secondary shrink-0 !px-4">
                  <MdSearch /> {verifying ? "..." : "Verify"}
                </button>
              </div>

              {receiver && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald/10 p-3 text-sm">
                  <MdCheckCircle className="text-emerald-dark" />
                  <span className="font-semibold text-navy-900">{receiver.name}</span>
                  <span className="text-navy-700/50">— {receiver.accountNumber}</span>
                </div>
              )}
            </div>

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
              <input value={note} onChange={(e) => setNote(e.target.value)} className="input-field" placeholder="e.g. Rent, dinner split" />
            </div>

            <button type="submit" className="btn-primary w-full">
              <MdSwapHoriz /> Review Transfer
            </button>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Transfer"
        message={`Send ${formatCurrency(amount)} to ${receiver?.name} (${receiver?.accountNumber})?`}
        confirmLabel="Confirm & Send"
        onConfirm={handleTransfer}
        onCancel={() => setConfirmOpen(false)}
        loading={loading}
      />
    </DashboardLayout>
  );
};

export default Transfer;
