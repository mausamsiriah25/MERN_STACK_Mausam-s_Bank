export const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const formatDate = (dateString) =>
  new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const txMeta = {
  deposit: { label: "Deposit", color: "text-emerald-dark bg-emerald/10", sign: "+" },
  "transfer-in": { label: "Transfer In", color: "text-emerald-dark bg-emerald/10", sign: "+" },
  withdraw: { label: "Withdraw", color: "text-rose-600 bg-rose-50", sign: "-" },
  "transfer-out": { label: "Transfer Out", color: "text-rose-600 bg-rose-50", sign: "-" },
};
