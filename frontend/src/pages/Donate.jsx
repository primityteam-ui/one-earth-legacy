import { useMemo, useState } from "react";
import {
  BadgeDollarSign,
  CheckCircle2,
  Crown,
  CreditCard,
  Globe2,
  HeartPulse,
  ImagePlus,
  Loader2,
  School,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import api from "../api/client.js";
import MoneySplitCard from "../components/MoneySplitCard.jsx";
import PageHero from "../components/PageHero.jsx";
import Panel from "../components/Panel.jsx";
import RankBadge from "../components/RankBadge.jsx";
import SummaryRow from "../components/SummaryRow.jsx";
import {
  addOns,
  getNextRankForAmount,
  getRankForAmount,
  legacyMissions,
  presetAmounts
} from "../constants/legacyOptions.js";

function getMissionIcon(iconName) {
  if (iconName === "heart") {
    return <HeartPulse className="h-6 w-6" />;
  }

  if (iconName === "school") {
    return <School className="h-6 w-6" />;
  }

  return <Globe2 className="h-6 w-6" />;
}

export default function Donate() {
  const [amount, setAmount] = useState(25);
  const [email, setEmail] = useState("vamshiyalavarthi11@gmail.com");
  const [message, setMessage] = useState("My mark on One Earth.");
  const [displayName, setDisplayName] = useState("Vamshi");
  const [theme, setTheme] = useState("Gold");

  const [selectedMissionId, setSelectedMissionId] = useState("human-survival");
  const [selectedImpactId, setSelectedImpactId] = useState("clean-water-for-life");

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

  const selectedMission = useMemo(() => {
    return legacyMissions.find((mission) => mission.id === selectedMissionId) || legacyMissions[0];
  }, [selectedMissionId]);

  const selectedImpact = useMemo(() => {
    return (
      selectedMission.impacts.find((impact) => impact.id === selectedImpactId) ||
      selectedMission.impacts[0]
    );
  }, [selectedMission, selectedImpactId]);

  const cause = `${selectedMission.name} — ${selectedImpact.name}`;

  const currentRank = useMemo(() => {
    return getRankForAmount(amount);
  }, [amount]);

  const nextRank = useMemo(() => {
    return getNextRankForAmount(amount);
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

  function selectMission(mission) {
    setSelectedMissionId(mission.id);
    setSelectedImpactId(mission.impacts[0].id);
  }

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
      causeCategory: selectedMission.name,
      causeImpact: selectedImpact.name,
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
      <PageHero
        eyebrow="Donate"
        title="Claim Your Legacy Tile"
        description="Choose your mission, select the exact impact, create your legacy tile, and send your donation through Stripe test checkout."
        rightLabel="Live rank preview"
        rightValue={backendPreview?.rank || currentRank.name}
      />

      <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <Panel
            icon={<BadgeDollarSign className="h-5 w-5" />}
            title="Step 1 — Choose amount"
            subtitle="Rank is cumulative. Your confirmed donations raise your legacy rank."
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
            icon={<Globe2 className="h-5 w-5" />}
            title="Step 2 — Choose your Legacy Mission"
            subtitle="Pick the greater mission first, then choose the exact impact your donation should support."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {legacyMissions.map((mission) => (
                <button
                  key={mission.id}
                  type="button"
                  onClick={() => selectMission(mission)}
                  className={`rounded-[1.5rem] border p-5 text-left transition ${
                    selectedMissionId === mission.id
                      ? "border-gold bg-gold/10 shadow-gold"
                      : "border-borderRoyal bg-black/30 hover:border-gold"
                  }`}
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
                    {getMissionIcon(mission.iconName)}
                  </div>

                  <p className="font-display text-xl font-bold text-textPrimary">
                    {mission.name}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-textSecondary">
                    {mission.tagline}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-gold">
                Exact Impact
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                {selectedMission.impacts.map((impact) => (
                  <button
                    key={impact.id}
                    type="button"
                    onClick={() => setSelectedImpactId(impact.id)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      selectedImpactId === impact.id
                        ? "border-gold bg-gold text-black"
                        : "border-borderRoyal bg-black/30 text-textPrimary hover:border-gold"
                    }`}
                  >
                    <p className="font-bold">{impact.name}</p>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        selectedImpactId === impact.id
                          ? "text-black/70"
                          : "text-textSecondary"
                      }`}
                    >
                      {impact.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-gold/30 bg-gold/10 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-gold">
                Selected Impact Path
              </p>

              <p className="mt-2 font-display text-2xl font-bold text-textPrimary">
                {cause}
              </p>

              <p className="mt-2 text-sm leading-6 text-textSecondary">
                This exact impact path will be saved into Stripe metadata, MongoDB donation data,
                and the public audit record.
              </p>
            </div>
          </Panel>

          <Panel
            icon={<ImagePlus className="h-5 w-5" />}
            title="Step 3 — Customize tile"
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
                  Public display
                </label>
                <label className="flex h-[58px] cursor-pointer items-center gap-3 rounded-2xl border border-borderRoyal bg-black/30 px-4">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(event) => setAnonymous(event.target.checked)}
                    className="h-5 w-5"
                  />
                  <span className="text-textSecondary">Show as Anonymous</span>
                </label>
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
          </Panel>

          <Panel
            icon={<Sparkles className="h-5 w-5" />}
            title="Step 4 — Optional add-ons"
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
            title="Step 5 — Complete donation"
            subtitle="Preview first, save mock donation locally, or open Stripe test checkout."
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
                <RankBadge rank={backendPreview?.rank || currentRank.name} size="md" />
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

            <div className="rounded-[1.5rem] border border-gold/30 bg-gold/10 p-5">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-gold">
                Your Selected Impact
              </p>
              <p className="font-display text-xl font-bold text-textPrimary">
                {cause}
              </p>
              <p className="mt-2 text-sm leading-6 text-textSecondary">
                {selectedImpact.description}
              </p>
            </div>

            <MoneySplitCard
              title="Transparent money split"
              causeLabel={`60% → ${cause}`}
              causeAmount={backendPreview?.split?.causeAmount ?? causeAmount}
              platformLabel="25% → Platform sustainability"
              platformAmount={backendPreview?.split?.platformAmount ?? platformAmount}
              lotteryLabel="15% → Monthly donor lottery"
              lotteryAmount={backendPreview?.split?.lotteryAmount ?? lotteryAmount}
            />

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

function PreviewItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-borderRoyal bg-black/30 p-4">
      <p className="text-sm text-textSecondary">{label}</p>
      <p className="mt-1 break-words font-bold text-textPrimary">{value}</p>
    </div>
  );
}