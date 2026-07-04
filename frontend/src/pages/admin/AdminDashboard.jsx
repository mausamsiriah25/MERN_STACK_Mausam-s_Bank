import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdPeople, MdCheckCircle, MdAcUnit, MdTrendingUp, MdTrendingDown, MdReceiptLong } from "react-icons/md";
import DashboardLayout from "../../components/DashboardLayout";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import StatCard from "../../components/StatCard";
import api from "../../services/api";
import { formatCurrency, formatDate, txMeta } from "../../utils/format";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/dashboard");
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <DashboardLayout><Spinner full /></DashboardLayout>;

  const { stats, recentCustomers, recentTransactions } = data;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-navy-900">Bank Overview</h1>
      <p className="mt-1 text-sm text-navy-700/60">A snapshot of Mausam's Bank right now</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<MdPeople />} label="Total Customers" value={stats.totalCustomers} accent="navy" />
        <StatCard icon={<MdCheckCircle />} label="Active Customers" value={stats.activeCustomers} accent="emerald" />
        <StatCard icon={<MdAcUnit />} label="Frozen Customers" value={stats.frozenCustomers} accent="rose" />
        <StatCard icon={<MdTrendingUp />} label="Total Deposits" value={formatCurrency(stats.totalDeposits)} accent="emerald" />
        <StatCard icon={<MdTrendingDown />} label="Total Withdrawals" value={formatCurrency(stats.totalWithdrawals)} accent="amber" />
        <StatCard icon={<MdReceiptLong />} label="Total Transactions" value={stats.totalTransactions} accent="navy" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-navy-900">Recent Customers</h2>
            <Link to="/admin/customers" className="text-sm font-semibold text-emerald-dark hover:underline">
              View all
            </Link>
          </div>
          {recentCustomers.length ? (
            <div className="divide-y divide-navy-700/5">
              {recentCustomers.map((c) => (
                <div key={c._id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{c.name}</p>
                    <p className="text-xs text-navy-700/50 font-mono">{c.accountNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-navy-900">{formatCurrency(c.balance)}</p>
                    <span className={`text-xs font-medium ${c.status === "active" ? "text-emerald-dark" : "text-rose-600"}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<MdPeople />} title="No customers yet" />
          )}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-navy-900">Recent Transactions</h2>
            <Link to="/admin/transactions" className="text-sm font-semibold text-emerald-dark hover:underline">
              View all
            </Link>
          </div>
          {recentTransactions.length ? (
            <div className="divide-y divide-navy-700/5">
              {recentTransactions.map((tx) => {
                const meta = txMeta[tx.type];
                return (
                  <div key={tx._id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{tx.user?.name || "Unknown"}</p>
                      <p className="text-xs text-navy-700/50">{formatDate(tx.createdAt)}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.color}`}>
                      {meta.sign}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={<MdReceiptLong />} title="No transactions yet" />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
