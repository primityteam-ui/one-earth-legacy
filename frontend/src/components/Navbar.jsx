import { Link, NavLink } from "react-router-dom";
import { Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-borderRoyal bg-royalBlack/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/50 bg-gold/10 shadow-gold">
            <Crown className="h-5 w-5 text-gold" />
          </div>

          <div>
            <p className="font-display text-lg font-bold tracking-wide text-textPrimary">
              One Earth Legacy
            </p>
            <p className="-mt-1 text-xs text-textSecondary">Emperor of Earth</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-4 text-sm text-textSecondary md:flex">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/wall">Wall</NavItem>
          <NavItem to="/donate">Donate</NavItem>
          <NavItem to="/leaderboard">Leaderboard</NavItem>
          <NavItem to="/legends">Legends</NavItem>
          <NavItem to="/globe">Globe</NavItem>
          <NavItem to="/audit">Audit</NavItem>
          <NavItem to="/legal/faq">FAQ</NavItem>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-full border border-borderRoyal px-4 py-2 text-sm text-textPrimary hover:border-gold hover:text-gold"
              >
                Dashboard
              </Link>

              <button
                onClick={logout}
                className="rounded-full bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimsonLight"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-black shadow-gold hover:bg-goldLight"
            >
              Enter the Wall
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? "text-gold" : "hover:text-gold")}
    >
      {children}
    </NavLink>
  );
}