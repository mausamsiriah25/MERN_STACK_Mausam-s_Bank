import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { MdArrowBack, MdAcUnit, MdLockOpen, MdDelete, MdReceiptLong } from "react-icons/md";
import DashboardLayout from "../../components/DashboardLayout";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import api from "../../services/api";
import { formatCurrency, formatDate, txMeta } from "../../utils/format";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/customers/${id}`);
      setCustomer(data.customer);
      setTransactions(data.transactions);
    } catch (err) {
      toast.error("Customer not found");
      navigate("/admin/customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (action === "freeze") {
        await api.put(`/admin/customers/${id}/freeze`);
        toast.success("Account frozen");
        fetchData();
      } else if (action === "unfreeze") {
        await api.put(`/admin/customers/${id}/unfreeze`);
        toast.success("Account unfrozen");
        fetchData();
      } else if (action === "delete") {
        await api.delete(`/admin/customers/${id}`);
        toast.success("Account deleted");
        navigate("/admin/customers");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
      setAction(null);
    }
  };

  if (loading) return <DashboardLayout><Spinner full /></DashboardLayout>;
  if (!customer) return null;

  const dialogCopy = {
    freeze: { title: "Freeze Account", message: "This customer will no longer be able to log in or transact.", label: "Freeze", danger: true },
    unfreeze: { title: "Unfreeze Account", message: "Restore full access for this customer.", label: "Unfreeze", danger: false },
    delete: { title: "Delete Account", message: "Permanently delete this account and all transaction history? This cannot be undone.", label: "Delete", danger: true },
  };

  return (
    <DashboardLayout>
      <Link to="/admin/customers" className="mb-4 flex w-fit items-center gap-1 text-sm font-medium text-navy-700/60 hover:text-navy-900">
        <MdArrowBack /> Back to customers
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-900 text-xl font-bold text-white">
            {customer.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <h2 className="mt-4 text-lg font-bold text-navy-900">{customer.name}</h2>
          <p className="text-sm text-navy-700/50">{customer.email}</p>

          <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between"><span className="text-navy-700/50">Account No.</span><span className="font-mono font-semibold">{customer.accountNumber}</span></div>
            <div className="flex justify-between"><span className="text-navy-700/50">Account Type</span><span className="font-semibold">{customer.accountType}</span></div>
            <div className="flex justify-between"><span className="text-navy-700/50">Balance</span><span className="font-semibold">{formatCurrency(customer.balance)}</span></div>
            <div className="flex justify-between"><span className="text-navy-700/50">Phone</span><span className="font-semibold">{customer.phone}</span></div>
            <div className="flex justify-between"><span className="text-navy-700/50">Address</span><span className="font-semibold">{customer.address || "—"}</span></div>
            <div className="flex justify-between"><span className="text-navy-700/50">Status</span>
              <span className={`font-semibold ${customer.status === "active" ? "text-emerald-dark" : "text-rose-600"}`}>{customer.status}</span>
            </div>
            <div className="flex justify-between"><span className="text-navy-700/50">Joined</span><span className="font-semibold">{formatDate(customer.createdAt)}</span></div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {customer.status === "active" ? (
              <button onClick={() => setAction("freeze")} className="btn-secondary w-full !text-amber-600">
                <MdAcUnit /> Freeze Account
              </button>
            ) : (
              <button onClick={() => setAction("unfreeze")} className="btn-secondary w-full !text-emerald-dark">
                <MdLockOpen /> Unfreeze Account
              </button>
            )}
            <button onClick={() => setAction("delete")} className="btn-danger w-full">
              <MdDelete /> Delete Account
            </button>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="mb-4 font-bold text-navy-900">Transaction History</h3>
          {transactions.length ? (
            <div className="divide-y divide-navy-700/5">
              {transactions.map((tx) => {
                const meta = txMeta[tx.type];
                return (
                  <div key={tx._id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{meta.label}</p>
                      <p className="text-xs text-navy-700/50">{formatDate(tx.createdAt)} · {tx.transactionId}</p>
                    </div>
                    <span className={`text-sm font-bold ${meta.sign === "+" ? "text-emerald-dark" : "text-rose-600"}`}>
                      {meta.sign}{formatCurrency(tx.amount)}
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

      <ConfirmDialog
        open={!!action}
        title={action ? dialogCopy[action].title : ""}
        message={action ? dialogCopy[action].message : ""}
        confirmLabel={action ? dialogCopy[action].label : ""}
        danger={action ? dialogCopy[action].danger : false}
        onConfirm={handleAction}
        onCancel={() => setAction(null)}
        loading={actionLoading}
      />
    </DashboardLayout>
  );
};

export default CustomerDetail;
