const EmptyState = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-navy-700/15 py-14 text-center">
    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-navy-900/5 text-2xl text-navy-700/50">
      {icon}
    </div>
    <p className="font-semibold text-navy-900">{title}</p>
    {subtitle && <p className="mt-1 max-w-xs text-sm text-navy-700/60">{subtitle}</p>}
  </div>
);

export default EmptyState;
