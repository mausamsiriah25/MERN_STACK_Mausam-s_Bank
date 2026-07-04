import { useEffect, useState } from "react";
import { MdReceiptLong, MdSearch } from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import api from "../services/api";
import { formatCurrency, formatDate, txMeta } from "../utils/format";

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "deposit", label: "Deposit" },
  { value: "withdraw", label: "Withdraw" },
  { value: "transfer-in", label: "Transfer In" },
  { value: "transfer-out", label: "Transfer Out" },
];

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/customer/transactions", {
          params: { search, type, sort, page, limit: 8 },
        });
        setTransactions(data.transactions);
        setPagination(data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetchData, 300);
    return () => clearTimeout(debounce);
  }, [search, type, sort, page]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-navy-900">Transaction History</h1>
      <p className="mt-1 text-sm text-navy-700/60">Search, filter, and review every transaction on your account</p>

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
              placeholder="Search by transaction ID, note, or account..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="input-field sm:w-48"
          >
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field sm:w-44">
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-amount">Amount: High to Low</option>
            <option value="amount">Amount: Low to High</option>
          </select>
        </div>

        {loading ? (
          <Spinner full />
        ) : transactions.length === 0 ? (
          <EmptyState icon={<MdReceiptLong />} title="No transactions found" subtitle="Try adjusting your search or filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-navy-700/10 text-navy-700/50">
                    <th className="whitespace-nowrap py-2.5 pr-4 font-medium">Transaction ID</th>
                    <th className="whitespace-nowrap py-2.5 pr-4 font-medium">Type</th>
                    <th className="whitespace-nowrap py-2.5 pr-4 font-medium">Note</th>
                    <th className="whitespace-nowrap py-2.5 pr-4 font-medium">Date</th>
                    <th className="whitespace-nowrap py-2.5 pr-4 text-right font-medium">Amount</th>
                    <th className="whitespace-nowrap py-2.5 text-right font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-700/5">
                  {transactions.map((tx) => {
                    const meta = txMeta[tx.type];
                    return (
                      <tr key={tx._id}>
                        <td className="whitespace-nowrap py-3 pr-4 font-mono text-xs text-navy-700/70">{tx.transactionId}</td>
                        <td className="whitespace-nowrap py-3 pr-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                        </td>
                        <td className="max-w-[160px] truncate py-3 pr-4 text-navy-700/70">{tx.note || "—"}</td>
                        <td className="whitespace-nowrap py-3 pr-4 text-navy-700/60">{formatDate(tx.createdAt)}</td>
                        <td className={`whitespace-nowrap py-3 pr-4 text-right font-semibold ${meta.sign === "+" ? "text-emerald-dark" : "text-rose-600"}`}>
                          {meta.sign}
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="whitespace-nowrap py-3 text-right text-navy-700/70">{formatCurrency(tx.balanceAfter)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex items-center justify-between text-sm">
              <p className="text-navy-700/50">
                Page {pagination.page} of {pagination.pages} · {pagination.total} total
              </p>
              <div className="flex gap-2">
                <button
                  className="btn-secondary !px-3 !py-1.5"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <button
                  className="btn-secondary !px-3 !py-1.5"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
