import { Link } from "react-router-dom";
import { MdOutlineAccountBalance, MdSwapHoriz, MdSecurity, MdInsights } from "react-icons/md";

const features = [
  { icon: <MdSwapHoriz />, title: "Instant Transfers", desc: "Send money to any Mausam's Bank account in seconds using just an account number." },
  { icon: <MdSecurity />, title: "Bank-Grade Security", desc: "Encrypted passwords, JWT-secured sessions, and account freeze controls keep you protected." },
  { icon: <MdInsights />, title: "Clear Statements", desc: "Search, filter, and sort every deposit, withdrawal, and transfer with ease." },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-navy-950 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald text-lg">
            <MdOutlineAccountBalance />
          </div>
          <span className="font-display text-lg font-bold">Mausam's Bank</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white">
            Sign In
          </Link>
          <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">
            Open Account
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16 text-center sm:pt-24">
        <span className="inline-block rounded-full bg-white/5 px-4 py-1.5 text-xs font-medium text-emerald-light">
          Trusted digital banking
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">
          Smart Banking. <span className="text-emerald-light">Simple Banking.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-white/60">
          Open an account in minutes, move money instantly, and track every rupee — all from one clean dashboard.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/register" className="btn-primary">
            Get Started — It's Free
          </Link>
          <Link to="/login" className="btn-secondary !bg-white/5 !text-white !border-white/10 hover:!bg-white/10">
            Sign In
          </Link>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl2 bg-white/5 p-6 text-left">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald/15 text-xl text-emerald-light">
                {f.icon}
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-white/50">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-white/30">
        © {new Date().getFullYear()} Mausam's Bank. A student project — not a real bank.
      </footer>
    </div>
  );
};

export default Landing;
