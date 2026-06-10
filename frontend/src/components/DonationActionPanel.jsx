import { CreditCard } from "lucide-react";
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
      <div className="grid gap-4 md:grid-cols-3">
        <ActionButton
          onClick={onPreview}
          loading={previewLoading}
          loadingText="Creating Preview..."
        >
          Create Preview
        </ActionButton>

        <ActionButton
          onClick={onSaveMock}
          loading={saveLoading}
          loadingText="Saving..."
          variant="gold"
        >
          Save Mock
        </ActionButton>

        <ActionButton
          onClick={onStripeCheckout}
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
    </>
  );
}