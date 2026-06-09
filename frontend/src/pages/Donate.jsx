import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  CheckCircle2,
  Crown,
  CreditCard,
  ImagePlus,
  Loader2,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import api from "../api/client.js";

const ranks = [
  { name: "Spark", min: 1, max: 9 },
  { name: "Citizen", min: 10, max: 49 },
  { name: "Merchant", min: 50, max: 249 },
  { name: "Knight", min: 250, max: 999 },
  { name: "Lord", min: 1000, max: 4999 },
  { name: "Baron", min: 5000, max: 19999 },
  { name: "Duke", min: 20000, max: 49999 },
  { name: "Sovereign", min: 50000, max: 99999 },
  { name: "King/Queen", min: 100000, max: 999999 },
  { name: "Emperor", min: 1000000, max: Infinity }
];

const causes = [
  "Clean drinking water",
  "Hunger relief",
  "Global education",
  "Climate action"
];

const presetAmounts = [5, 10, 25, 50, 100, 250, 1000];

const addOns = [
  { id: "animatedBorder", name: "Animated border", price: 4.99 },
  { id: "videoTile", name: "Video tile", price: 9.99 },
  { id: "analytics", name: "Analytics dashboard", price: 2.99 },
  { id: "resurrection", name: "Tile resurrection", price: 19.99 },
  { id: "nft", name: "NFT certificate", price: 9.99 }
];

export default function Donate() {
  const [amount, setAmount] = useState(25);
  const [email, setEmail] = useState("vamshiyalavarthi11@gmail.com");
  const [message, setMessage] = useState("My mark on One Earth.");
  const [displayName, setDisplayName] = useState("Vamshi");
  const [theme, setTheme] = useState("Gold");
  const [cause, setCause] = useState("Clean drinking water");
  const [anonymous, setAnonymous] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  const [backendPreview, setBackendPreview] = useState(null);
  const [savedDonation, setSavedDonation] = useState(null);

  const [previewLoading, setPreviewLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);

  const [previewError, setPreviewError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [stripeError, setStripeError] = useState("");

  const currentRank = useMemo(() => {
    return ranks.find((rank) => amount >= rank.min && amount <= rank.max) || ranks[0];
  }, [amount]);

  const nextRank = useMemo(() => {
    return ranks.find((rank) => rank.min > amount);
  }, [amount]);

  const addOnTotal = useMemo(() => {
    return selectedAddOns.reduce((total, id) => {
      const item = addOns.find((addOn) => addOn.id === id);
      return total + (item?.price || 0);
    }, 0);
  }, [selectedAddOns]);

  const total = Number(amount) + addOnTotal;

  const causeAmount = amount * 0.6;
  const platformAmount = amount * 0.25;
  const lotteryAmount = amount * 0.15;

  function toggleAddOn(id) {
    setSelectedAddOns((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function buildPayload() {
    return {
      email,
      amount,
      currency: "USD",
      displayName,
      message,
      theme,
      cause,
      anonymous,
      addOns: selectedAddOns
    };
  }

  async function handleBackendPreview() {
    setPreviewLoading(true);
    setPreviewError("");
    setBackendPreview(null);

    try {
      const response = await api.post("/donate/preview", buildPayload());
      setBackendPreview(response.data.preview);
    } catch (error) {
      setPreviewError(error.response?.data?.message || "Could not create donation preview");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleSaveMockDonation() {
    setSaveLoading(true);
    setSaveError("");
    setSavedDonation(null);

    try {
      const response = await api.post("/donate/mock-create", buildPayload());
      setSavedDonation(response.data);
    } catch (error) {
      setSaveError(error.response?.data?.message || "Could not save mock donation");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleStripeCheckout() {
    setStripeLoading(true);
    setStripeError("");

    try {
      const response = await api.post(
        "/payments/stripe/create-checkout-session",
        buildPayload()
      );

      window.location.href = response.data.checkoutUrl;
    } catch (error) {
      setStripeError(error.response?.data?.message || "Could not open Stripe checkout");
    } finally {
      setStripeLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="mb-8 rounded-[2rem] border border-gold/25 bg-royalCard p-8 shadow-gold">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-gold">
              Donate
            </p>

            <h1 className="font-display text-4xl font-bold md:text-6xl">
              Claim Your Legacy Tile
            </h1>

            <p className="mt-4 max-w-3xl text-textSecondary">
              Create a backend preview, save a mock donation into MongoDB, or open Stripe test checkout.
            </p>
          </div>

          <div className="rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4">
            <p className="text-sm text-goldLight">Live rank preview</p>
            <p className="font-display text-3xl font-bold text-textPrimary">
              {backendPreview?.rank || currentRank.name}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <Panel
            icon={<BadgeDollarSign className="h-5 w-5" />}
            title="Step 1 — Choose amount"
            subtitle="Rank is cumulative. This mock flow saves USD values to MongoDB."
          >
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {presetAmounts.map((value) => (
                <button
                  key={value}
                  onClick={() => setAmount(value)}
                  className={`rounded-2xl border px-5 py-4 font-numbers text-xl font-bold ${
                    amount === value
                      ? "border-gold bg-gold text-black"
                      : "border-borderRoyal bg-black/30 text-textPrimary hover:border-gold"
                  }`}
                >
                  ${value}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-textSecondary">
                Custom amount
              </label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(event) => setAmount(Math.max(1, Number(event.target.value)))}
                className="w-full rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 font-numbers text-2xl text-textPrimary outline-none focus:border-gold"
              />
            </div>

            {nextRank ? (
              <p className="mt-4 rounded-2xl border border-borderRoyal bg-black/30 p-4 text-textSecondary">
                You are{" "}
                <span className="font-bold text-goldLight">
                  ${(nextRank.min - amount).toLocaleString()}
                </span>{" "}
                away from <span className="font-bold text-textPrimary">{nextRank.name}</span>.
              </p>
            ) : (
              <p className="mt-4 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-goldLight">
                You are entering Emperor territory.
              </p>
            )}
          </Panel>

          <Panel
            icon={<ImagePlus className="h-5 w-5" />}
            title="Step 2 — Customize tile"
            subtitle="This data is sent to the backend and saved into Donation, Tile, and AuditEntry records."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-textSecondary">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-textSecondary">
                  Display name
                </label>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  maxLength={40}
                  className="w-full rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-textSecondary">
                  Tile theme
                </label>
                <select
                  value={theme}
                  onChange={(event) => setTheme(event.target.value)}
                  className="w-full rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
                >
                  <option className="bg-royalBlack">Gold</option>
                  <option className="bg-royalBlack">Crimson</option>
                  <option className="bg-royalBlack">Emerald</option>
                  <option className="bg-royalBlack">Royal Blue</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-textSecondary">
                  Cause
                </label>
                <select
                  value={cause}
                  onChange={(event) => setCause(event.target.value)}
                  className="w-full rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
                >
                  {causes.map((item) => (
                    <option key={item} className="bg-royalBlack">
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-textSecondary">
                Tile message
              </label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, 280))}
                rows={4}
                className="w-full resize-none rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
              />
              <p className="mt-2 text-right text-sm text-textSecondary">
                {message.length}/280
              </p>
            </div>

            <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-borderRoyal bg-black/30 p-4">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
                className="h-5 w-5"
              />
              <span className="text-textSecondary">Show as Anonymous on the public wall</span>
            </label>
          </Panel>

          <Panel
            icon={<Sparkles className="h-5 w-5" />}
            title="Step 3 — Optional add-ons"
            subtitle="Selected add-ons are calculated by the backend."
          >
            <div className="grid gap-3 md:grid-cols-2">
              {addOns.map((addOn) => (
                <button
                  key={addOn.id}
                  onClick={() => toggleAddOn(addOn.id)}
                  className={`rounded-2xl border p-5 text-left ${
                    selectedAddOns.includes(addOn.id)
                      ? "border-gold bg-gold/10"
                      : "border-borderRoyal bg-black/30 hover:border-gold"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-bold text-textPrimary">{addOn.name}</p>
                    <p className="font-numbers font-bold text-goldLight">
                      ${addOn.price}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Step 4 — Backend actions"
            subtitle="Preview first, save mock donation, or open Stripe test checkout."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <button
                onClick={handleBackendPreview}
                disabled={previewLoading}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-gold px-6 py-4 font-bold text-goldLight hover:bg-gold hover:text-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {previewLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                {previewLoading ? "Creating Preview..." : "Create Preview"}
              </button>

              <button
                onClick={handleSaveMockDonation}
                disabled={saveLoading}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-goldLight via-gold to-goldLight px-6 py-4 font-bold text-black shadow-gold hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saveLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                {saveLoading ? "Saving..." : "Save Mock"}
              </button>

              <button
                onClick={handleStripeCheckout}
                disabled={stripeLoading}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-green-500/40 bg-green-500/10 px-6 py-4 font-bold text-green-400 hover:bg-green-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {stripeLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CreditCard className="h-5 w-5" />
                )}
                {stripeLoading ? "Opening..." : "Pay Stripe Test"}
              </button>
            </div>

            {previewError && (
              <p className="mt-4 rounded-2xl border border-crimson/40 bg-crimson/10 p-4 text-sm text-crimsonLight">
                {previewError}
              </p>
            )}

            {saveError && (
              <p className="mt-4 rounded-2xl border border-crimson/40 bg-crimson/10 p-4 text-sm text-crimsonLight">
                {saveError}
              </p>
            )}

            {stripeError && (
              <p className="mt-4 rounded-2xl border border-crimson/40 bg-crimson/10 p-4 text-sm text-crimsonLight">
                {stripeError}
              </p>
            )}

            {backendPreview && <BackendPreviewBox backendPreview={backendPreview} />}

            {savedDonation && (
              <div className="mt-5 rounded-[1.5rem] border border-green-500/30 bg-green-500/10 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                  <p className="font-display text-2xl font-bold text-textPrimary">
                    Mock Donation Saved
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <PreviewItem label="User" value={savedDonation.user.displayName} />
                  <PreviewItem label="Username" value={savedDonation.user.username} />
                  <PreviewItem label="Total donated" value={`$${savedDonation.user.totalDonated}`} />
                  <PreviewItem label="Current rank" value={savedDonation.user.currentRank} />
                  <PreviewItem label="Donation status" value={savedDonation.donation.paymentStatus} />
                  <PreviewItem label="Settlement" value={savedDonation.donation.settlementStatus} />
                </div>

                <p className="mt-4 text-sm text-textSecondary">
                  Now refresh Home, Wall, Leaderboard, Audit, and Profile pages to see this MongoDB data.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="/wall"
                    className="rounded-full border border-borderRoyal px-5 py-2 text-sm font-bold text-textPrimary hover:border-gold hover:text-gold"
                  >
                    View Wall
                  </a>
                  <a
                    href={`/u/${savedDonation.user.username}`}
                    className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-black hover:bg-goldLight"
                  >
                    View Profile
                  </a>
                  <a
                    href="/audit"
                    className="rounded-full border border-borderRoyal px-5 py-2 text-sm font-bold text-textPrimary hover:border-gold hover:text-gold"
                  >
                    View Audit
                  </a>
                </div>
              </div>
            )}
          </Panel>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-5 rounded-[2rem] border border-gold/25 bg-royalCard p-6 shadow-gold">
            <div className="rounded-[1.5rem] border border-borderRoyal bg-black/40 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-bold text-goldLight">
                  {backendPreview?.rank || currentRank.name}
                </span>
                <Crown className="h-8 w-8 text-gold" />
              </div>

              <h2 className="font-display text-3xl font-bold text-textPrimary">
                {anonymous ? "Anonymous" : displayName || "Your Name"}
              </h2>

              <p className="mt-3 min-h-[72px] text-textSecondary">
                {message || "Your message will appear here."}
              </p>

              <div className="mt-5 flex items-end justify-between border-t border-borderRoyal pt-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-textSecondary">
                    Theme
                  </p>
                  <p className="text-textPrimary">{theme}</p>
                </div>

                <div className="text-right">
                  <p className="font-numbers text-3xl font-bold text-goldLight">
                    ${Number(amount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-textSecondary">Donation</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-borderRoyal bg-black/30 p-5">
              <p className="mb-4 font-display text-xl font-bold text-textPrimary">
                Transparent money split
              </p>

              <SplitRow
                label={`60% → ${cause}`}
                value={backendPreview?.split?.causeAmount ?? causeAmount}
              />
              <SplitRow
                label="25% → Platform sustainability"
                value={backendPreview?.split?.platformAmount ?? platformAmount}
              />
              <SplitRow
                label="15% → Monthly donor lottery"
                value={backendPreview?.split?.lotteryAmount ?? lotteryAmount}
              />
            </div>

            <div className="rounded-[1.5rem] border border-borderRoyal bg-black/30 p-5">
              <SummaryRow label="Donation" value={`$${Number(amount || 0).toFixed(2)}`} />
              <SummaryRow
                label="Add-ons"
                value={`$${(backendPreview?.addOnTotal ?? addOnTotal).toFixed(2)}`}
              />
              <div className="mt-4 border-t border-borderRoyal pt-4">
                <SummaryRow
                  label="Total today"
                  value={`$${(backendPreview?.totalToday ?? total).toFixed(2)}`}
                  strong
                />
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function BackendPreviewBox({ backendPreview }) {
  return (
    <div className="mt-5 rounded-[1.5rem] border border-gold/30 bg-gold/10 p-5">
      <p className="font-display text-2xl font-bold text-textPrimary">
        Backend Preview Created
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <PreviewItem label="Rank" value={backendPreview.rank} />
        <PreviewItem label="Total today" value={`$${backendPreview.totalToday.toFixed(2)}`} />
        <PreviewItem label="Cause amount" value={`$${backendPreview.split.causeAmount.toFixed(2)}`} />
        <PreviewItem label="Platform amount" value={`$${backendPreview.split.platformAmount.toFixed(2)}`} />
        <PreviewItem label="Lottery amount" value={`$${backendPreview.split.lotteryAmount.toFixed(2)}`} />
        <PreviewItem label="Status" value={backendPreview.paymentStatus} />
      </div>

      {backendPreview.nextRank && (
        <p className="mt-4 text-textSecondary">
          Backend says you are{" "}
          <span className="font-bold text-goldLight">
            ${backendPreview.nextRank.amountNeeded}
          </span>{" "}
          away from {backendPreview.nextRank.name}.
        </p>
      )}

      <p className="mt-4 text-sm text-textSecondary">{backendPreview.note}</p>
    </div>
  );
}

function Panel({ icon, title, subtitle, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6"
    >
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
          {icon}
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-textPrimary">{title}</h2>
          <p className="mt-1 text-textSecondary">{subtitle}</p>
        </div>
      </div>

      {children}
    </motion.section>
  );
}

function SplitRow({ label, value }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4 text-sm">
      <span className="text-textSecondary">{label}</span>
      <span className="font-numbers font-bold text-goldLight">
        ${Number(value || 0).toFixed(2)}
      </span>
    </div>
  );
}

function SummaryRow({ label, value, strong }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <span className={strong ? "font-bold text-textPrimary" : "text-textSecondary"}>
        {label}
      </span>
      <span className={strong ? "font-numbers text-2xl font-bold text-goldLight" : "font-numbers text-textPrimary"}>
        {value}
      </span>
    </div>
  );
}

function PreviewItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-borderRoyal bg-black/30 p-4">
      <p className="text-sm text-textSecondary">{label}</p>
      <p className="mt-1 break-words font-bold text-textPrimary">{value}</p>
    </div>
  );
}