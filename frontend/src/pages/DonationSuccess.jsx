import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/client.js";
import {
  CheckCircle2,
  Crown,
  FileCheck2,
  Globe2,
  HeartHandshake,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy
} from "lucide-react";

const showTemporaryQaPanels =
  import.meta.env.VITE_SHOW_TEMPORARY_QA_PANELS !== "false";

export default function DonationSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [sessionStatus, setSessionStatus] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let cancelled = false;

    async function loadSessionStatus() {
      setSessionLoading(true);
      setSessionError("");

      try {
        const response = await api.get(
          `/payments/stripe/session-status?session_id=${encodeURIComponent(sessionId)}`
        );

        if (!cancelled) {
          setSessionStatus(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          setSessionError(
            error.response?.data?.message || "Could not verify Stripe session status"
          );
        }
      } finally {
        if (!cancelled) {
          setSessionLoading(false);
        }
      }
    }

    loadSessionStatus();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const paymentStatusLabel =
    sessionStatus?.paymentStatus === "paid"
      ? "Paid"
      : sessionStatus?.paymentStatus
        ? sessionStatus.paymentStatus
        : "Waiting for session verification";

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="overflow-hidden rounded-[2rem] border border-green-500/30 bg-royalCard shadow-gold">
        <div className="bg-gradient-to-br from-green-500/15 via-gold/10 to-transparent p-8 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-green-500/40 bg-green-500/10 text-green-400">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <p className="mb-2 text-sm uppercase tracking-[0.35em] text-gold">
            Stripe Checkout Return
          </p>

          <h1 className="font-display text-4xl font-bold text-textPrimary md:text-6xl">
            Payment Flow Completed
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-textSecondary">
            Stripe sent you back to One Earth Legacy. In test mode, this page confirms
            the checkout redirect worked. The backend webhook is responsible for saving
            the paid donation, legacy tile, rank update, and public audit entries.
          </p>

          <div className="mt-6 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-200">
            Safe success redirect verified
          </div>

          {sessionId && (
            <div className="mx-auto mt-5 max-w-3xl rounded-2xl border border-borderRoyal bg-black/30 p-4 text-left">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-bold text-textPrimary">
                    Stripe checkout session
                  </p>

                  <p className="mt-2 break-all font-mono text-xs text-textSecondary">
                    {sessionId}
                  </p>
                </div>

                <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-200">
                  {sessionLoading ? "Checking..." : paymentStatusLabel}
                </div>
              </div>

              {sessionStatus && (
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <SessionStatusItem
                    label="Stripe mode"
                    value={sessionStatus.stripeMode || "unknown"}
                  />
                  <SessionStatusItem
                    label="Checkout"
                    value={sessionStatus.status || "unknown"}
                  />
                  <SessionStatusItem
                    label="Payment"
                    value={sessionStatus.paymentStatus || "unknown"}
                  />
                  <SessionStatusItem
                    label="Amount"
                    value={`$${Number(sessionStatus.amountTotal || 0).toLocaleString()} ${sessionStatus.currency || "USD"}`}
                  />
                </div>
              )}

              {sessionError && (
                <p className="mt-4 rounded-xl border border-crimson/40 bg-crimson/10 p-3 text-sm text-textSecondary">
                  {sessionError}
                </p>
              )}

              <p className="mt-3 text-xs text-textSecondary">
                This verification confirms what Stripe reports for the checkout session.
                The webhook still performs the actual database save.
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-4">
          <InfoCard
            icon={<Crown />}
            title="Rank Update"
            text="Your rank updates after the Stripe webhook confirms the payment and saves the donation."
          />

          <InfoCard
            icon={<Sparkles />}
            title="Tile Created"
            text="Your public legacy tile is created from the saved donation and checkout metadata."
          />

          <InfoCard
            icon={<FileCheck2 />}
            title="Audit Saved"
            text="Donation received and split allocation records are written to the public audit log."
          />

          <InfoCard
            icon={<Globe2 />}
            title="Globe Point"
            text="Only safe city/country-level location data is used for public globe display."
          />
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] border border-borderRoyal bg-royalPanel p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-full border border-gold/30 bg-gold/10 p-3">
              <RefreshCw className="h-5 w-5 text-gold" />
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gold">
                What happens next
              </p>

              <h2 className="mt-1 font-display text-3xl font-bold text-textPrimary">
                Verify the webhook result
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <NextStep
              title="1. Check the Wall"
              text="Your legacy tile should appear after the webhook saves the paid donation."
              to="/wall"
              label="Open Wall"
            />

            <NextStep
              title="2. Check the Audit"
              text="Donation received, cause allocation, platform allocation, and lottery allocation should be visible."
              to="/audit"
              label="Open Audit"
            />

            <NextStep
              title="3. Check the Leaderboard"
              text="Your rank and total donation should affect the public ranking after save."
              to="/leaderboard"
              label="Open Leaderboard"
            />

            <NextStep
              title="4. Check the Globe"
              text="Your public point should appear near city/country level, not a private address."
              to="/globe"
              label="Open Globe"
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-gold/25 bg-gold/10 p-6 shadow-gold">
            <p className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-textPrimary">
              <HeartHandshake className="h-5 w-5 text-gold" />
              Payment split reminder
            </p>

            <div className="space-y-3">
              <SplitLine label="Cause impact" value="60%" />
              <SplitLine label="Platform sustainability" value="25%" />
              <SplitLine label="Monthly donor pool" value="15%" />
            </div>

            <p className="mt-4 text-sm text-textSecondary">
              These allocation records should appear in the public audit log after the backend webhook completes.
            </p>
          </div>

          <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
            <p className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-textPrimary">
              <ShieldCheck className="h-5 w-5 text-gold" />
              Privacy reminder
            </p>

            <p className="text-sm leading-relaxed text-textSecondary">
              One Earth Legacy does not show a street address publicly. Public profile,
              wall, globe, and leaderboard views should use only donor-safe fields like
              name, rank, mission, country, city, and rounded/approximate coordinates.
            </p>
          </div>

          <div className="rounded-[2rem] border border-crimson/40 bg-crimson/10 p-6">
            <p className="font-display text-xl font-bold text-textPrimary">
              Test mode reminder
            </p>

            <p className="mt-3 text-sm leading-relaxed text-textSecondary">
              If you are still using Stripe test keys, this confirms the test checkout flow.
              Do not use live keys until webhook, admin review, audit records, and legal pages are verified.
            </p>
          </div>
        </aside>
      </section>

      {showTemporaryQaPanels && (
      <section className="mt-8 rounded-[2rem] border border-borderRoyal bg-royalPanel p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-full border border-gold/30 bg-gold/10 p-3">
            <ShieldCheck className="h-5 w-5 text-gold" />
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gold">
              Post-payment QA Checklist
            </p>

            <h2 className="mt-1 font-display text-3xl font-bold text-textPrimary">
              Confirm after Stripe checkout
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            "Stripe redirected to /donate/success",
            "Webhook listener received checkout.session.completed",
            "Donation was saved once, not duplicated",
            "Tile appears on Wall",
            "Audit entries appear with correct split",
            "Leaderboard total/rank updates",
            "Globe shows city/country-level point",
            "Admin dashboard can review the donation"
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-borderRoyal bg-black/25 p-4 text-sm text-textSecondary"
            >
              <span className="mr-2 text-gold">✓</span>
              {item}
            </div>
          ))}
        </div>
      </section>
      )}

      <section className="mt-8 rounded-[2rem] border border-gold/25 bg-gold/10 p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-goldLight">
              Continue testing
            </p>

            <h2 className="font-display text-3xl font-bold text-textPrimary">
              Review the public pages
            </h2>

            <p className="mt-2 text-textSecondary">
              Check Wall, Leaderboard, Globe, and Audit after every checkout test.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/wall"
              className="rounded-full bg-gold px-6 py-3 font-bold text-black shadow-gold hover:bg-goldLight"
            >
              View Wall
            </Link>

            <Link
              to="/leaderboard"
              className="rounded-full border border-gold/40 px-6 py-3 font-bold text-gold hover:bg-gold/10"
            >
              Leaderboard
            </Link>

            <Link
              to="/globe"
              className="rounded-full border border-gold/40 px-6 py-3 font-bold text-gold hover:bg-gold/10"
            >
              Globe
            </Link>

            <Link
              to="/audit"
              className="rounded-full border border-gold/40 px-6 py-3 font-bold text-gold hover:bg-gold/10"
            >
              Audit
            </Link>

            <Link
              to="/donate"
              className="rounded-full border border-gold/40 px-6 py-3 font-bold text-gold hover:bg-gold/10"
            >
              Donate Again
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="rounded-[1.5rem] border border-borderRoyal bg-black/30 p-5 text-center">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
        {icon}
      </div>

      <p className="font-display text-xl font-bold text-textPrimary">{title}</p>
      <p className="mt-2 text-sm text-textSecondary">{text}</p>
    </div>
  );
}

function NextStep({ title, text, to, label }) {
  return (
    <div className="rounded-2xl border border-borderRoyal bg-black/25 p-5">
      <p className="font-display text-xl font-bold text-textPrimary">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-textSecondary">{text}</p>

      <Link
        to={to}
        className="mt-4 inline-flex rounded-full border border-gold/40 px-4 py-2 text-sm font-bold text-gold hover:bg-gold/10"
      >
        {label}
      </Link>
    </div>
  );
}

function SessionStatusItem({ label, value }) {
  return (
    <div className="rounded-xl border border-borderRoyal bg-black/25 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-textMuted">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-textPrimary">{value}</p>
    </div>
  );
}

function SplitLine({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-borderRoyal bg-black/25 p-4">
      <p className="text-sm text-textSecondary">{label}</p>
      <p className="font-numbers text-xl font-bold text-goldLight">{value}</p>
    </div>
  );
}
