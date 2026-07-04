const ConfirmDialog = ({ open, title, message, confirmLabel = "Confirm", danger = false, onConfirm, onCancel, loading }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl2 bg-white p-6 shadow-card animate-[fadeIn_0.15s_ease-out]">
        <h3 className="text-lg font-bold text-navy-900">{title}</h3>
        <p className="mt-2 text-sm text-navy-700/70">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className={danger ? "btn-danger" : "btn-primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
