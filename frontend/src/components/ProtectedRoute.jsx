import { Navigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-textSecondary">
        Checking your legacy session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-5 py-10">
        <section className="rounded-[2rem] border border-crimson/40 bg-royalCard p-8 text-center shadow-gold">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-crimson/10 text-crimsonLight">
            <LockKeyhole className="h-8 w-8" />
          </div>

          <p className="mb-2 text-sm uppercase tracking-[0.35em] text-crimsonLight">
            Access Denied
          </p>

          <h1 className="font-display text-4xl font-bold text-textPrimary">
            Admins Only
          </h1>

          <p className="mt-4 text-textSecondary">
            This page is restricted to One Earth Legacy admin accounts.
          </p>

          <a
            href="/"
            className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 font-bold text-black shadow-gold hover:bg-goldLight"
          >
            Return Home
          </a>
        </section>
      </main>
    );
  }

  return children;
}