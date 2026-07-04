import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { MdSearch, MdPeople, MdAcUnit, MdLockOpen, MdDelete, MdVisibility } from "react-icons/md";
import DashboardLayout from "../../components/DashboardLayout";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import api from "../../services/api";
import { formatCurrency } from "../../utils/format";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [actionTarget, setActionTarget] = useState(null); // { customer, action }
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/customers", { params: { search, status, page, limit: 8 } });
      setCustomers(data.customers);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, page]);

  const handleAction = async () => {
    if (!actionTarget) return;
    const { customer, action } = actionTarget;
    setActionLoading(true);
    try {
      if (action === "freeze") {
        await api.put(`/admin/customers/${customer._id}/freeze`);
        toast.success(`${customer.name}'s account frozen`);
      } else if (action === "unfreeze") {
        await api.put(`/admin/customers/${customer._id}/unfreeze`);
        toast.success(`${customer.name}'s account unfrozen`);
      } else if (action === "delete") {
        await api.delete(`/admin/customers/${customer._id}`);
        toast.success(`${customer.name}'s account deleted`);
      }
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
      setActionTarget(null);
    }
  };

  const dialogCopy = {
    freeze: { title: "Freeze Account", message: (n) => `Freeze ${n}'s account? They won't be able to log in or transact.`, label: "Freeze", danger: true },
    unfreeze: { title: "Unfreeze Account", message: (n) => `Restore access for ${n}'s account?`, label: "Unfreeze", danger: false },
    delete: { title: "Delete Account", message: (n) => `Permanently delete ${n}'s account and all transaction history? This cannot be undone.`, label: "Delete", danger: true },
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-navy-900">Customer Management</h1>
      <p className="mt-1 text-sm text-navy-700/60">Search, review, freeze, or remove customer accounts</p>

      <div className="card mt-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MdSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-700/40" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, phone, or account number..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="input-field sm:w-44"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="frozen">Frozen</option>
          </select>
        </div>

        {loading ? (
          <Spinner full />
        ) : customers.length === 0 ? (
          <EmptyState icon={<MdPeople />} title="No customers found" subtitle="Try adjusting your search or filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-navy-700/10 text-navy-700/50">
                    <th className="whitespace-nowrap py-2.5 pr-4 font-medium">Name</th>
                    <th className="whitespace-nowrap py-2.5 pr-4 font-medium">Account No.</th>
                    <th className="whitespace-nowrap py-2.5 pr-4 font-medium">Balance</th>
                    <th className="whitespace-nowrap py-2.5 pr-4 font-medium">Status</th>
                    <th className="whitespace-nowrap py-2.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-700/5">
                  {customers.map((c) => (
                    <tr key={c._id}>
                      <td className="whitespace-nowrap py-3 pr-4">
                        <p className="font-semibold text-navy-900">{c.name}</p>
                        <p className="text-xs text-navy-700/50">{c.email}</p>
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 font-mono text-xs text-navy-700/70">{c.accountNumber}</td>
                      <td className="whitespace-nowrap py-3 pr-4 font-semibold text-navy-900">{formatCurrency(c.balance)}</td>
                      <td className="whitespace-nowrap py-3 pr-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.status === "active" ? "bg-emerald/10 text-emerald-dark" : "bg-rose-50 text-rose-600"}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link to={`/admin/customers/${c._id}`} title="View details" className="rounded-lg p-2 text-navy-700/60 hover:bg-navy-900/5 hover:text-navy-900">
                            <MdVisibility />
                          </Link>
                          {c.status === "active" ? (
                            <button title="Freeze" onClick={() => setActionTarget({ customer: c, action: "freeze" })} className="rounded-lg p-2 text-amber-600 hover:bg-amber-50">
                              <MdAcUnit />
                            </button>
                          ) : (
                            <button title="Unfreeze" onClick={() => setActionTarget({ customer: c, action: "unfreeze" })} className="rounded-lg p-2 text-emerald-dark hover:bg-emerald/10">
                              <MdLockOpen />
                            </button>
                          )}
                          <button title="Delete" onClick={() => setActionTarget({ customer: c, action: "delete" })} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50">
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex items-center justify-between text-sm">
              <p className="text-navy-700/50">
                Page {pagination.page} of {pagination.pages} · {pagination.total} total
              </p>
              <div className="flex gap-2">
                <button className="btn-secondary !px-3 !py-1.5" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
                <button className="btn-secondary !px-3 !py-1.5" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!actionTarget}
        title={actionTarget ? dialogCopy[actionTarget.action].title : ""}
        message={actionTarget ? dialogCopy[actionTarget.action].message(actionTarget.customer.name) : ""}
        confirmLabel={actionTarget ? dialogCopy[actionTarget.action].label : ""}
        danger={actionTarget ? dialogCopy[actionTarget.action].danger : false}
        onConfirm={handleAction}
        onCancel={() => setActionTarget(null)}
        loading={actionLoading}
      />
    </DashboardLayout>
  );
};

export default Customers;
