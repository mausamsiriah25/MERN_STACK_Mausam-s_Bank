import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdAddCircle,
  MdRemoveCircle,
  MdSwapHoriz,
  MdReceiptLong,
  MdPerson,
  MdPeople,
  MdOutlineAccountBalance,
} from "react-icons/md";

const customerLinks = [
  { to: "/dashboard", label: "Dashboard", icon: <MdDashboard /> },
  { to: "/deposit", label: "Deposit", icon: <MdAddCircle /> },
  { to: "/withdraw", label: "Withdraw", icon: <MdRemoveCircle /> },
  { to: "/transfer", label: "Transfer", icon: <MdSwapHoriz /> },
  { to: "/transactions", label: "Transactions", icon: <MdReceiptLong /> },
  { to: "/profile", label: "Profile", icon: <MdPerson /> },
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <MdDashboard /> },
  { to: "/admin/customers", label: "Customers", icon: <MdPeople /> },
  { to: "/admin/transactions", label: "Transactions", icon: <MdReceiptLong /> },
];

const Sidebar = ({ role, open, onClose }) => {
  const links = role === "admin" ? adminLinks : customerLinks;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-navy-950/40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed z-40 flex h-full w-64 flex-col bg-navy-900 px-4 py-6 transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald text-lg text-white">
            <MdOutlineAccountBalance />
          </div>
          <div>
            <p className="font-display text-base font-bold text-white leading-none">Mausam's Bank</p>
            <p className="text-[11px] text-white/40">{role === "admin" ? "Admin Panel" : "Smart Banking"}</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald text-white shadow-soft"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="rounded-xl bg-white/5 p-3 text-[11px] leading-relaxed text-white/40">
          Mausam's Bank v1.0
          <br />
          Smart Banking. Simple Banking.
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
