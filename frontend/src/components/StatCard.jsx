const StatCard = ({ icon, label, value, accent = "emerald", sub }) => {
  const accents = {
    emerald: "bg-emerald/10 text-emerald-dark",
    navy: "bg-navy-900/5 text-navy-900",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-navy-700/70">{label}</p>
        <p className="mt-1.5 text-2xl font-bold text-navy-900">{value}</p>
        {sub && <p className="mt-1 text-xs text-navy-700/60">{sub}</p>}
      </div>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${accents[accent]}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
