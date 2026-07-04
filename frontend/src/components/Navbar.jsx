import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdMenu, MdLogout, MdKeyboardArrowDown } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate(user?.role === "admin" ? "/admin/login" : "/login");
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-navy-700/10 bg-white/80 px-4 backdrop-blur lg:px-8">
      <button className="text-2xl text-navy-900 lg:hidden" onClick={onMenuClick} aria-label="Open menu">
        <MdMenu />
      </button>

      <div className="hidden lg:block">
        <p className="text-sm text-navy-700/60">
          Welcome back, <span className="font-semibold text-navy-900">{user?.name?.split(" ")[0]}</span>
        </p>
      </div>

      <div className="relative">
        <button
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-navy-900/5"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
            {initials}
          </span>
          <span className="hidden text-sm font-medium text-navy-900 sm:block">{user?.name?.split(" ")[0]}</span>
          <MdKeyboardArrowDown className="text-navy-700/50" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-navy-700/10 bg-white shadow-card">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <MdLogout /> Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
