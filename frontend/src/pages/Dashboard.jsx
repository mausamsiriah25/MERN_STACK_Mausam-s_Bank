import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MdAccountBalanceWallet,
  MdAddCircle,
  MdRemoveCircle,
  MdSwapHoriz,
  MdReceiptLong,
  MdCreditCard,
} from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import StatCard from "../components/StatCard";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate, txMeta } from "../utils/format";

const quickActions = [
  { to: "/deposit", label: "Deposit", icon: <MdAddCircle />, accent: "bg-emerald/10 text-emerald-dark" },
  { to: "/withdraw", label: "Withdraw", icon: <MdRemoveCircle />, accent: "bg-rose-50 text-rose-600" },
  { to: "/transfer", label: "Transfer", icon: <MdSwapHoriz />, accent: "bg-navy-900/5 text-navy-900" },
  { to: "/transactions", label: "History", icon: <MdReceiptLong />, accent: "bg-amber-50 text-amber-600" },
];

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get("/customer/dashboard");
        setData(data);
        updateUser(data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <DashboardLayout><Spinner full /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Welcome, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-sm text-navy-700/60">Here's what's happening with your account today.</p>
      </div>

      {/* Balance card */}
      <div className="mb-6 overflow-hidden rounded-xl2 bg-gradient-to-br from-navy-900 to-navy-700 p-6 text-white shadow-card sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm text-white/50">Current Balance</p>
            <p className="mt-1 font-display text-4xl font-bold">{formatCurrency(data?.user?.balance)}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl">
            <MdAccountBalanceWallet />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-10 gap-y-3 text-sm">
          <div>
            <p className="text-white/40">Account Number</p>
            <p className="mt-0.5 font-mono font-semibold tracking-wide">{data?.user?.accountNumber}</p>
          </div>
          <div>
            <p className="text-white/40">Account Type</p>
            <p className="mt-0.5 font-semibold">{data?.user?.accountType}</p>
          </div>
          <div>
            <p className="text-white/40">Last Login</p>
            <p className="mt-0.5 font-semibold">{data?.user?.lastLogin ? formatDate(data.user.lastLogin) : "First login"}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="card flex flex-col items-center justify-center gap-2 py-6 text-center transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${action.accent}`}>
              {action.icon}
            </div>
            <span className="text-sm font-semibold text-navy-900">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<MdCreditCard />} label="Account Status" value={data?.user?.status === "active" ? "Active" : "Frozen"} accent={data?.user?.status === "active" ? "emerald" : "rose"} />
        <StatCard icon={<MdReceiptLong />} label="Recent Activity" value={`${data?.recentTransactions?.length || 0} transactions`} accent="navy" sub="in the last few days" />
        <StatCard icon={<MdAccountBalanceWallet />} label="Account Holder" value={data?.user?.name} accent="amber" sub={data?.user?.email} />
      </div>

      {/* Recent transactions */}
      <div className="card mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-navy-900">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm font-semibold text-emerald-dark hover:underline">
            View all
          </Link>
        </div>

        {data?.recentTransactions?.length ? (
          <div className="divide-y divide-navy-700/5">
            {data.recentTransactions.map((tx) => {
              const meta = txMeta[tx.type];
              return (
                <div key={tx._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${meta.color}`}>
                      {meta.sign}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{meta.label}</p>
                      <p className="text-xs text-navy-700/50">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${meta.sign === "+" ? "text-emerald-dark" : "text-rose-600"}`}>
                    {meta.sign}
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={<MdReceiptLong />} title="No transactions yet" subtitle="Your deposits, withdrawals, and transfers will show up here." />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
