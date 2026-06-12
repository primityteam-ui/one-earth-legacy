import {
  CreditCard,
  Database,
  Eye,
  ShieldCheck,
  TestTube2
} from "lucide-react";
import ActionButton from "./ActionButton.jsx";
import BackendPreviewBox from "./BackendPreviewBox.jsx";
import DonationSuccessBox from "./DonationSuccessBox.jsx";
import ErrorMessageBox from "./ErrorMessageBox.jsx";

export default function DonationActionPanel({
  onPreview,
  onSaveMock,
  onStripeCheckout,
  previewLoading = false,
  saveLoading = false,
  stripeLoading = false,
  previewError = "",
  saveError = "",
  stripeError = "",
  backendPreview = null,
  savedDonation = null
}) {
  return (
    <>
      <div className="mb-5 rounded-2xl border border-gold/25 bg-gold/10 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-gold" />

          <div>
            <p className="font-bold text-textPrimary">
              Review before payment
            </p>

            <p className="mt-2 text-sm leading-relaxed text-textSecondary">
              First create a backend preview. Then use local save only for
              development testing, or open Stripe checkout for the real payment
              flow. Public supporter location stays city/country level only.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-borderRoyal bg-black/25 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-textPrimary">
            <Eye className="h-4 w-4 text-gold" />
            Step A
          </div>

          <ActionButton
            onClick={onPreview}
            loading={previewLoading}
            loadingText="Creating Preview..."
          >
            Create Preview
          </ActionButton>

          <p className="mt-3 text-xs leading-relaxed text-textSecondary">
            Checks backend calculation before saving anything.
          </p>
        </div>

        <div className="rounded-2xl border border-borderRoyal bg-black/25 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-textPrimary">
            <Database className="h-4 w-4 text-gold" />
            Local Test
          </div>

          <ActionButton
            onClick={onSaveMock}
            loading={saveLoading}
            loadingText="Saving..."
            variant="gold"
          >
            Save Local Test Contribution
          </ActionButton>

          <p className="mt-3 text-xs leading-relaxed text-textSecondary">
            Local development only. Saves a test supporter, contribution, tile,
            and audit record.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-200">
            <TestTube2 className="h-4 w-4" />
            Stripe Test Mode
          </div>

          <ActionButton
            onClick={onStripeCheckout}
            loading={stripeLoading}
            loadingText="Opening..."
            variant="green"
            icon={<CreditCard className="h-5 w-5" />}
          >
            Open Stripe Checkout
          </ActionButton>

          <p className="mt-3 text-xs leading-relaxed text-emerald-100/80">
            Opens Stripe checkout. In local setup this should use Stripe test keys.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-borderRoyal bg-black/25 p-4">
        <p className="text-sm font-bold text-textPrimary">
          Production safety reminder
        </p>

        <p className="mt-2 text-sm leading-relaxed text-textSecondary">
          Do not switch to live Stripe keys until webhook saving, success page,
          cancel page, legal copy, contribution records, and admin review checks
          are tested.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
        <p className="text-sm font-bold text-amber-100">
          No cash payout notice
        </p>

        <p className="mt-2 text-sm leading-relaxed text-textSecondary">
          Legacy Contributions create digital platform benefits only. Tiles,
          ranks, points, leaderboard placement, profile visibility, and voting
          influence have no cash value, cannot be withdrawn, and do not create
          any investment return or supporter payout.
        </p>
      </div>

      <ErrorMessageBox message={previewError} />
      <ErrorMessageBox message={saveError} />
      <ErrorMessageBox message={stripeError} />

      <BackendPreviewBox backendPreview={backendPreview} />
      <DonationSuccessBox savedDonation={savedDonation} />
    </>
  );
}