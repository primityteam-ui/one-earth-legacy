import { useMemo, useState } from "react";
import {
  BadgeDollarSign,
  CreditCard,
  Globe2,
  ImagePlus,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import api from "../api/client.js";
import ActionButton from "../components/ActionButton.jsx";
import AddOnSelector from "../components/AddOnSelector.jsx";
import AmountSelector from "../components/AmountSelector.jsx";
import BackendPreviewBox from "../components/BackendPreviewBox.jsx";
import DonationSuccessBox from "../components/DonationSuccessBox.jsx";
import DonationTilePreview from "../components/DonationTilePreview.jsx";
import ErrorMessageBox from "../components/ErrorMessageBox.jsx";
import MissionSelector from "../components/MissionSelector.jsx";
import MoneySplitCard from "../components/MoneySplitCard.jsx";
import PageHero from "../components/PageHero.jsx";
import Panel from "../components/Panel.jsx";
import PaymentSummaryCard from "../components/PaymentSummaryCard.jsx";
import SelectedImpactCard from "../components/SelectedImpactCard.jsx";
import TileCustomizer from "../components/TileCustomizer.jsx";
import {
  addOns,
  getNextRankForAmount,
  getRankForAmount,
  legacyMissions,
  presetAmounts
} from "../constants/legacyOptions.js";

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
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
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
            subtitle="This data is sent to the backend and saved into Donation, Tile, and AuditEntry records."
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
            <div className="grid gap-4 md:grid-cols-3">
              <ActionButton
                onClick={handleBackendPreview}
                loading={previewLoading}
                loadingText="Creating Preview..."
              >
                Create Preview
              </ActionButton>

              <ActionButton
                onClick={handleSaveMockDonation}
                loading={saveLoading}
                loadingText="Saving..."
                variant="gold"
              >
                Save Mock
              </ActionButton>

              <ActionButton
                onClick={handleStripeCheckout}
                loading={stripeLoading}
                loadingText="Opening..."
                variant="green"
                icon={<CreditCard className="h-5 w-5" />}
              >
                Pay Stripe Test
              </ActionButton>
            </div>

            <ErrorMessageBox message={previewError} />
            <ErrorMessageBox message={saveError} />
            <ErrorMessageBox message={stripeError} />

            <BackendPreviewBox backendPreview={backendPreview} />
            <DonationSuccessBox savedDonation={savedDonation} />
          </Panel>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-5 rounded-[2rem] border border-gold/25 bg-royalCard p-6 shadow-gold">
            <DonationTilePreview
              rank={backendPreview?.rank || currentRank.name}
              anonymous={anonymous}
              displayName={displayName}
              message={message}
              theme={theme}
              amount={amount}
            />

            <SelectedImpactCard
              cause={cause}
              description={selectedImpact.description}
            />

            <MoneySplitCard
              title="Transparent money split"
              causeLabel={`60% → ${cause}`}
              causeAmount={backendPreview?.split?.causeAmount ?? causeAmount}
              platformLabel="25% → Platform sustainability"
              platformAmount={backendPreview?.split?.platformAmount ?? platformAmount}
              lotteryLabel="15% → Monthly donor lottery"
              lotteryAmount={backendPreview?.split?.lotteryAmount ?? lotteryAmount}
            />

            <PaymentSummaryCard
              donationAmount={amount}
              addOnTotal={backendPreview?.addOnTotal ?? addOnTotal}
              totalToday={backendPreview?.totalToday ?? total}
            />
          </div>
        </aside>
      </section>
    </main>
  );
}