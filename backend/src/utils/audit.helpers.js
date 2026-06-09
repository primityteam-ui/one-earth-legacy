export function buildDonationAuditEntries({
  userId,
  amountUSD,
  currency = "USD",
  displayName = "Anonymous",
  anonymous = false,
  causeCategory,
  causeImpact,
  cause,
  split,
  paymentMethod = "mock"
}) {
  const donorName = anonymous ? "Anonymous" : displayName;

  return [
    {
      type: "donation_received",
      amount: amountUSD,
      currency,
      recipient: "One Earth Legacy",
      causeCategory,
      causeImpact,
      cause,
      description: `${formatPaymentMethod(paymentMethod)} donation received from ${donorName}.`,
      initiatedBy: userId
    },
    {
      type: "cause_allocation",
      amount: split.causeAmount,
      currency,
      recipient: cause,
      causeCategory,
      causeImpact,
      cause,
      description: "60% allocation reserved for verified global cause payout.",
      initiatedBy: userId
    },
    {
      type: "platform_allocation",
      amount: split.platformAmount,
      currency,
      recipient: "Platform operations",
      causeCategory,
      causeImpact,
      cause,
      description: "25% allocation reserved for hosting, security, monitoring, and platform sustainability.",
      initiatedBy: userId
    },
    {
      type: "lottery_allocation",
      amount: split.lotteryAmount,
      currency,
      recipient: "Monthly donor lottery",
      causeCategory,
      causeImpact,
      cause,
      description: "15% allocation added to monthly donor prize pool.",
      initiatedBy: userId
    }
  ];
}

function formatPaymentMethod(paymentMethod) {
  if (paymentMethod === "stripe") {
    return "Stripe";
  }

  if (paymentMethod === "razorpay") {
    return "Razorpay";
  }

  if (paymentMethod === "mock") {
    return "Mock";
  }

  return "Confirmed";
}