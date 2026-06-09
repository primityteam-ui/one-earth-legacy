import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import EmperorButton from "../components/EmperorButton.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useAuth();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSendOtp(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await sendOtp(email);
      setStep("otp");
      setMessage("Your login code was sent. In development, check backend terminal if Resend is not configured.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await verifyOtp(email, otp);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not verify OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-5 py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-[2rem] border border-gold/25 bg-royalCard/90 p-8 shadow-gold"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
            {step === "email" ? <Mail className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
          </div>

          <h1 className="font-display text-3xl font-bold text-textPrimary">
            Enter the Legacy Wall
          </h1>

          <p className="mt-3 text-textSecondary">
            Secure passwordless login using a one-time email code.
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-textSecondary">
                Email address
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
              />
            </div>

            <EmperorButton type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Login Code"}
            </EmperorButton>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-textSecondary">
                6-digit code
              </label>

              <input
                type="text"
                required
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-center font-numbers text-2xl tracking-[0.4em] text-textPrimary outline-none focus:border-gold"
              />
            </div>

            <EmperorButton type="submit" disabled={loading || otp.length !== 6}>
              {loading ? "Verifying..." : "Verify and Continue"}
            </EmperorButton>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="block text-sm text-textSecondary hover:text-gold"
            >
              Use a different email
            </button>
          </form>
        )}

        {message && (
          <p className="mt-5 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm text-goldLight">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-5 rounded-2xl border border-crimson/40 bg-crimson/10 p-4 text-sm text-crimsonLight">
            {error}
          </p>
        )}
      </motion.div>
    </main>
  );
}