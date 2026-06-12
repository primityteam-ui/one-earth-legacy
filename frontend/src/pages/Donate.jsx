import { useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Database,
  Globe2,
  ImagePlus,
  LocateFixed,
  MapPin,
  ShieldCheck,
  Sparkles,
  TestTube2,
  WalletCards
} from "lucide-react";
import api from "../api/client.js";
import AddOnSelector from "../components/AddOnSelector.jsx";
import AmountSelector from "../components/AmountSelector.jsx";
import DonationActionPanel from "../components/DonationActionPanel.jsx";
import DonationSidebar from "../components/DonationSidebar.jsx";
import MissionSelector from "../components/MissionSelector.jsx";
import PageHero from "../components/PageHero.jsx";
import Panel from "../components/Panel.jsx";
import TileCustomizer from "../components/TileCustomizer.jsx";
import {
  addOns,
  getNextRankForAmount,
  getRankForAmount,
  legacyMissions,
  presetAmounts
} from "../constants/legacyOptions.js";

const showTemporaryQaPanels =
  import.meta.env.VITE_SHOW_TEMPORARY_QA_PANELS !== "false";

const supporterCountries = [
  { country: "United States", countryCode: "US", flag: "🇺🇸" },
  { country: "India", countryCode: "IN", flag: "🇮🇳" },
  { country: "Brazil", countryCode: "BR", flag: "🇧🇷" },
  { country: "Italy", countryCode: "IT", flag: "🇮🇹" },
  { country: "Japan", countryCode: "JP", flag: "🇯🇵" },
  { country: "South Korea", countryCode: "KR", flag: "🇰🇷" },
  { country: "Canada", countryCode: "CA", flag: "🇨🇦" },
  { country: "Nigeria", countryCode: "NG", flag: "🇳🇬" },
  { country: "Australia", countryCode: "AU", flag: "🇦🇺" },
  { country: "Kenya", countryCode: "KE", flag: "🇰🇪" },
  { country: "United Kingdom", countryCode: "GB", flag: "🇬🇧" },
  { country: "Germany", countryCode: "DE", flag: "🇩🇪" },
  { country: "France", countryCode: "FR", flag: "🇫🇷" },
  { country: "Spain", countryCode: "ES", flag: "🇪🇸" },
  { country: "China", countryCode: "CN", flag: "🇨🇳" },
  { country: "Singapore", countryCode: "SG", flag: "🇸🇬" },
  { country: "South Africa", countryCode: "ZA", flag: "🇿🇦" },
  { country: "Egypt", countryCode: "EG", flag: "🇪🇬" },
  { country: "United Arab Emirates", countryCode: "AE", flag: "🇦🇪" }
];

function roundCoordinate(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "";
  }

  return Number(number.toFixed(2));
}

function FinalReviewLine({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-borderRoyal bg-black/25 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-bold text-textPrimary">{label}</p>
      <p className="text-sm text-textSecondary sm:text-right">{value}</p>
    </div>
  );
}

function DonateReadinessCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-borderRoyal bg-black/25 p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
        {icon}
      </div>

      <p className="font-bold text-textPrimary">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-textSecondary">{text}</p>
    </div>
  );
}

export default function Donate() {
  const [amount, setAmount] = useState(25);
  const [email, setEmail] = useState("vamshiyalavarthi11@gmail.com");
  const [message, setMessage] = useState("My mark on One Earth.");
  const [displayName, setDisplayName] = useState("Vamshi");
  const [theme, setTheme] = useState("Gold");

  const [supporterCountryCode, setSupporterCountryCode] = useState("US");
  const [supporterCity, setSupporterCity] = useState("Dallas");
  const [supporterRegion, setSupporterRegion] = useState("Texas");
  const [supporterLat, setSupporterLat] = useState("");
  const [supporterLng, setSupporterLng] = useState("");
  const [locationMessage, setLocationMessage] = useState("");

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
  const [stripeSafetyMessage, setStripeSafetyMessage] = useState("");

  const selectedMission = useMemo(() => {
    return legacyMissions.find((mission) => mission.id === selectedMissionId) || legacyMissions[0];
  }, [selectedMissionId]);

  const selectedImpact = useMemo(() => {
    return (
      selectedMission.impacts.find((impact) => impact.id === selectedImpactId) ||
      selectedMission.impacts[0]
    );
  }, [selectedMission, selectedImpactId]);

  const selectedSupporterCountry = useMemo(() => {
    return (
      supporterCountries.find((country) => country.countryCode === supporterCountryCode) ||
      supporterCountries[0]
    );
  }, [supporterCountryCode]);

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
  const legacyReserveAmount = amount * 0.15;

  function selectMission(mission) {
    setSelectedMissionId(mission.id);
    setSelectedImpactId(mission.impacts[0].id);
  }

  function toggleAddOn(id) {
    setSelectedAddOns((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function handleUseApproximateLocation() {
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationMessage("Location is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSupporterLat(roundCoordinate(position.coords.latitude));
        setSupporterLng(roundCoordinate(position.coords.longitude));
        setLocationMessage(
          "Approximate location added. Coordinates are rounded for privacy."
        );
      },
      () => {
        setLocationMessage(
          "Location permission was not allowed. You can still enter city and region manually."
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }

  function buildPayload() {
    const safeLat = supporterLat === "" ? undefined : Number(supporterLat);
    const safeLng = supporterLng === "" ? undefined : Number(supporterLng);

    return {
      email,
      amount,
      currency: "USD",
      displayName,
      country: selectedSupporterCountry.country,
      countryCode: selectedSupporterCountry.countryCode,
      supporterCity,
      supporterRegion,
      supporterLat: Number.isFinite(safeLat) ? safeLat : undefined,
      supporterLng: Number.isFinite(safeLng) ? safeLng : undefined,
      supporterLocationPrecision:
        Number.isFinite(safeLat) && Number.isFinite(safeLng)
          ? "approximate"
          : supporterCity.trim()
            ? "city"
            : "country",
      supporterLocationSource:
        Number.isFinite(safeLat) && Number.isFinite(safeLng)
          ? "browser"
          : "manual",
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
      setPreviewError(error.response?.data?.message || "Could not create contribution preview");
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
      setSaveError(error.response?.data?.message || "Could not save mock contribution");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleStripeCheckout() {
    setStripeLoading(true);
    setStripeError("");
    setStripeSafetyMessage("");

    try {
      const response = await api.post(
        "/payments/stripe/create-checkout-session",
        buildPayload()
      );

      if (response.data?.stripeMode || response.data?.safetyNote) {
        setStripeSafetyMessage(
          `${response.data.stripeMode === "live" ? "Live mode" : "Test mode"}: ${
            response.data.safetyNote || "Stripe checkout created."
          }`
        );
      }

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
        eyebrow="Contribute"
        title="Create Your Legacy Tile"
        description="Choose your mission, select the exact impact, create your legacy tile, and complete a Legacy Contribution with clear privacy, payment review, and no cash payout."
        rightLabel="Live rank preview"
        rightValue={backendPreview?.rank || currentRank.name}
      />
      <section className="mb-8 rounded-[2rem] border border-amber-400/30 bg-amber-400/10 p-6">
        <p className="font-display text-2xl font-bold text-textPrimary">
          No lottery, no investment, no cash payout
        </p>

        <p className="mt-3 leading-7 text-textSecondary">
          One Earth Legacy is a commercial digital legacy platform. A Legacy
          Contribution creates digital platform benefits such as a tile, profile,
          rank, leaderboard visibility, globe visibility, and voting influence.
          These benefits have no cash value, cannot be withdrawn, and do not
          guarantee any financial return.
        </p>

        <p className="mt-3 leading-7 text-textSecondary">
          The 15% Legacy Impact Reserve is not paid to supporters. It is
          platform-controlled and founder-reviewed for approved impact missions,
          verified causes, emergency causes, scholarships, food aid, education,
          children, planet protection, or other public-benefit missions.
        </p>
      </section>
      <section className="mb-8 rounded-[2rem] border border-gold/25 bg-royalPanel p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gold">
              Legacy Contribution Flow Status
            </p>

            <h2 className="mt-2 font-display text-3xl font-bold text-textPrimary">
              Review mode before production launch
            </h2>

            <p className="mt-2 max-w-3xl text-textSecondary">
              This page is ready for local testing. Keep Stripe in test mode until
              webhook saving, success redirect, cancel redirect, audit records,
              and admin review are fully verified.
            </p>
          </div>

          <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-200">
            Safe local test flow
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <DonateReadinessCard
            icon={<TestTube2 />}
            title="Stripe test checkout"
            text="Use test keys and test cards while this app is still being verified."
          />

          <DonateReadinessCard
            icon={<Database />}
            title="Mock save for local data"
            text="Local save creates MongoDB supporter, contribution, tile, and audit records for testing."
          />

          <DonateReadinessCard
            icon={<ShieldCheck />}
            title="Privacy-safe location"
            text="Only city, region, country, and rounded coordinates are saved for public display."
          />
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <Panel
            icon={<BadgeDollarSign className="h-5 w-5" />}
            title="Step 1 — Choose contribution amount"
            subtitle="Rank is cumulative. Your confirmed Legacy Contributions raise your legacy rank."
          >
            <AmountSelector
              amount={amount}
              setAmount={setAmount}
              presetAmounts={presetAmounts}
              nextRank={nextRank}
            />
          </Panel>

          <Panel
            icon={<Globe2 className="h-5 w-5" />}
            title="Step 2 — Choose your Legacy Mission"
            subtitle="Pick the greater mission first, then choose the exact impact your Legacy Contribution should support."
          >
            <MissionSelector
              legacyMissions={legacyMissions}
              selectedMissionId={selectedMissionId}
              selectedImpactId={selectedImpactId}
              selectedMission={selectedMission}
              cause={cause}
              onSelectMission={selectMission}
              onSelectImpact={setSelectedImpactId}
            />
          </Panel>

          <Panel
            icon={<ImagePlus className="h-5 w-5" />}
            title="Step 3 — Customize tile"
            subtitle="This data is saved into contribution, tile, audit, and privacy-safe supporter location records."
          >
            <TileCustomizer
              email={email}
              setEmail={setEmail}
              displayName={displayName}
              setDisplayName={setDisplayName}
              theme={theme}
              setTheme={setTheme}
              anonymous={anonymous}
              setAnonymous={setAnonymous}
              message={message}
              setMessage={setMessage}
            />

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-sky-400/10 p-2 text-sky-300">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    Add your safe Earth location
                  </h3>
                  <p className="text-sm text-slate-400">
                    This places your legacy tile near your city on the live globe.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    City
                  </label>
                  <input
                    value={supporterCity}
                    onChange={(event) => setSupporterCity(event.target.value)}
                    placeholder="Dallas"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    State / Region
                  </label>
                  <input
                    value={supporterRegion}
                    onChange={(event) => setSupporterRegion(event.target.value)}
                    placeholder="Texas"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                  />
                </div>
              </div>

              <label className="mt-4 block text-sm font-medium text-slate-300">
                Country
              </label>

              <select
                value={supporterCountryCode}
                onChange={(event) => setSupporterCountryCode(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
              >
                {supporterCountries.map((country) => (
                  <option key={country.countryCode} value={country.countryCode}>
                    {country.flag} {country.country}
                  </option>
                ))}
              </select>

              <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Optional approximate coordinates
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      For privacy, coordinates are rounded before saving.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleUseApproximateLocation}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/20"
                  >
                    <LocateFixed className="h-4 w-4" />
                    Use approximate current location
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-300">
                      Latitude
                    </label>
                    <input
                      value={supporterLat}
                      onChange={(event) => setSupporterLat(event.target.value)}
                      placeholder="32.78"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300">
                      Longitude
                    </label>
                    <input
                      value={supporterLng}
                      onChange={(event) => setSupporterLng(event.target.value)}
                      placeholder="-96.80"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                    />
                  </div>
                </div>

                {locationMessage && (
                  <p className="mt-3 text-sm text-slate-300">
                    {locationMessage}
                  </p>
                )}
              </div>

              <p className="mt-3 text-sm text-slate-400">
                Selected:{" "}
                <span className="font-semibold text-white">
                  {supporterCity ? `${supporterCity}, ` : ""}
                  {supporterRegion ? `${supporterRegion}, ` : ""}
                  {selectedSupporterCountry.flag} {selectedSupporterCountry.country}
                </span>
              </p>

              <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <p className="text-sm font-semibold text-emerald-200">
                  Privacy promise
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">
                  One Earth Legacy never asks for your street address. If you use
                  current location, we round coordinates before saving, so your
                  public legacy point appears near your city area, not your home.
                </p>
              </div>
            </div>
          </Panel>

          <Panel
            icon={<Sparkles className="h-5 w-5" />}
            title="Step 4 — Optional add-ons"
            subtitle="Selected add-ons are calculated by the backend."
          >
            <AddOnSelector
              addOns={addOns}
              selectedAddOns={selectedAddOns}
              onToggleAddOn={toggleAddOn}
            />
          </Panel>

          <Panel
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Step 5 — Complete Legacy Contribution"
            subtitle="Preview first, save a local test contribution, or open Stripe test checkout."
          >
            <div className="mb-6 rounded-[1.5rem] border border-borderRoyal bg-black/25 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full border border-gold/30 bg-gold/10 p-3 text-gold">
                  <WalletCards className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-display text-2xl font-bold text-textPrimary">
                    Final review before checkout
                  </p>
                  <p className="mt-1 text-sm text-textSecondary">
                    Confirm these details before saving a local test contribution or opening Stripe checkout.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <FinalReviewLine
                  label="Legacy Contribution amount"
                  value={`$${Number(amount || 0).toLocaleString()} contribution + $${Number(addOnTotal || 0).toLocaleString()} add-ons = $${Number(total || 0).toLocaleString()} today`}
                />

                <FinalReviewLine
                  label="Selected mission"
                  value={cause}
                />

                <FinalReviewLine
                  label="Public supporter name"
                  value={anonymous ? "Anonymous supporter" : displayName || "Not entered"}
                />

                <FinalReviewLine
                  label="Public location"
                  value={`${supporterCity ? `${supporterCity}, ` : ""}${supporterRegion ? `${supporterRegion}, ` : ""}${selectedSupporterCountry.flag} ${selectedSupporterCountry.country}`}
                />

                <FinalReviewLine
                  label="Privacy"
                  value="No street address is collected. Public location is city/country level only."
                />
              </div>
            </div>

            {stripeSafetyMessage && (
              <div className="mb-5 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                <p className="text-sm font-bold text-emerald-200">
                  Stripe checkout status
                </p>
                <p className="mt-1 text-sm text-emerald-100/80">
                  {stripeSafetyMessage}
                </p>
              </div>
            )}

            <DonationActionPanel
              onPreview={handleBackendPreview}
              onSaveMock={handleSaveMockDonation}
              onStripeCheckout={handleStripeCheckout}
              previewLoading={previewLoading}
              saveLoading={saveLoading}
              stripeLoading={stripeLoading}
              previewError={previewError}
              saveError={saveError}
              stripeError={stripeError}
              backendPreview={backendPreview}
              savedDonation={savedDonation}
            />
          </Panel>
        </div>

        <DonationSidebar
          rank={backendPreview?.rank || currentRank.name}
          anonymous={anonymous}
          displayName={displayName}
          message={message}
          theme={theme}
          amount={amount}
          cause={cause}
          impactDescription={selectedImpact.description}
          causeAmount={backendPreview?.split?.causeAmount ?? causeAmount}
          platformAmount={backendPreview?.split?.platformAmount ?? platformAmount}
          lotteryAmount={backendPreview?.split?.lotteryAmount ?? legacyReserveAmount}
          addOnTotal={backendPreview?.addOnTotal ?? addOnTotal}
          totalToday={backendPreview?.totalToday ?? total}
        />
      </section>

      {showTemporaryQaPanels && (
      <section className="mt-10 rounded-[2rem] border border-borderRoyal bg-royalPanel p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-full border border-gold/30 bg-gold/10 p-3">
            <ShieldCheck className="h-5 w-5 text-gold" />
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gold">
              Donate QA Checklist
            </p>

            <h2 className="mt-1 font-display text-3xl font-bold text-textPrimary">
              Before production launch
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            "Create Preview returns backend contribution split and rank",
            "Save local test contribution creates User, Contribution, Tile, and AuditEntry",
            "Stripe checkout opens with test key before live launch",
            "Stripe webhook saves paid contributions after checkout.session.completed",
            "Success page loads after Stripe payment",
            "Cancel page returns user safely to Donate",
            "No street address is collected or shown publicly",
            "Admin dashboard can review contribution and audit records"
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
    </main>
  );
}
