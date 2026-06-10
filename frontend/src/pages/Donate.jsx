import { useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Globe2,
  ImagePlus,
  LocateFixed,
  MapPin,
  ShieldCheck,
  Sparkles
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

const donorCountries = [
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

export default function Donate() {
  const [amount, setAmount] = useState(25);
  const [email, setEmail] = useState("vamshiyalavarthi11@gmail.com");
  const [message, setMessage] = useState("My mark on One Earth.");
  const [displayName, setDisplayName] = useState("Vamshi");
  const [theme, setTheme] = useState("Gold");

  const [donorCountryCode, setDonorCountryCode] = useState("US");
  const [donorCity, setDonorCity] = useState("Dallas");
  const [donorRegion, setDonorRegion] = useState("Texas");
  const [donorLat, setDonorLat] = useState("");
  const [donorLng, setDonorLng] = useState("");
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

  const selectedMission = useMemo(() => {
    return legacyMissions.find((mission) => mission.id === selectedMissionId) || legacyMissions[0];
  }, [selectedMissionId]);

  const selectedImpact = useMemo(() => {
    return (
      selectedMission.impacts.find((impact) => impact.id === selectedImpactId) ||
      selectedMission.impacts[0]
    );
  }, [selectedMission, selectedImpactId]);

  const selectedDonorCountry = useMemo(() => {
    return (
      donorCountries.find((country) => country.countryCode === donorCountryCode) ||
      donorCountries[0]
    );
  }, [donorCountryCode]);

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
        setDonorLat(roundCoordinate(position.coords.latitude));
        setDonorLng(roundCoordinate(position.coords.longitude));
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
    const safeLat = donorLat === "" ? undefined : Number(donorLat);
    const safeLng = donorLng === "" ? undefined : Number(donorLng);

    return {
      email,
      amount,
      currency: "USD",
      displayName,
      country: selectedDonorCountry.country,
      countryCode: selectedDonorCountry.countryCode,
      donorCity,
      donorRegion,
      donorLat: Number.isFinite(safeLat) ? safeLat : undefined,
      donorLng: Number.isFinite(safeLng) ? safeLng : undefined,
      donorLocationPrecision:
        Number.isFinite(safeLat) && Number.isFinite(safeLng)
          ? "approximate"
          : donorCity.trim()
            ? "city"
            : "country",
      donorLocationSource:
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
            subtitle="Pick the greater mission first, then choose the exact impact your donation should support."
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
            subtitle="This data is saved into Donation, Tile, AuditEntry, and safe donor location records."
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
                    This places your legacy impact near your city on the live globe.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    City
                  </label>
                  <input
                    value={donorCity}
                    onChange={(event) => setDonorCity(event.target.value)}
                    placeholder="Dallas"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    State / Region
                  </label>
                  <input
                    value={donorRegion}
                    onChange={(event) => setDonorRegion(event.target.value)}
                    placeholder="Texas"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                  />
                </div>
              </div>

              <label className="mt-4 block text-sm font-medium text-slate-300">
                Country
              </label>

              <select
                value={donorCountryCode}
                onChange={(event) => setDonorCountryCode(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
              >
                {donorCountries.map((country) => (
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
                      value={donorLat}
                      onChange={(event) => setDonorLat(event.target.value)}
                      placeholder="32.78"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300">
                      Longitude
                    </label>
                    <input
                      value={donorLng}
                      onChange={(event) => setDonorLng(event.target.value)}
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
                  {donorCity ? `${donorCity}, ` : ""}
                  {donorRegion ? `${donorRegion}, ` : ""}
                  {selectedDonorCountry.flag} {selectedDonorCountry.country}
                </span>
              </p>
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
            title="Step 5 — Complete donation"
            subtitle="Preview first, save mock donation locally, or open Stripe test checkout."
          >
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
          lotteryAmount={backendPreview?.split?.lotteryAmount ?? lotteryAmount}
          addOnTotal={backendPreview?.addOnTotal ?? addOnTotal}
          totalToday={backendPreview?.totalToday ?? total}
        />
      </section>
    </main>
  );
}