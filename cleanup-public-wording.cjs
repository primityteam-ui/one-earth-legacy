const fs = require("fs");

const files = [
  "frontend/src/components/BackendPreviewBox.jsx",
  "frontend/src/components/DonationSidebar.jsx",
  "frontend/src/components/MoneySplitCard.jsx",
  "frontend/src/pages/DonationSuccess.jsx",
  "frontend/src/pages/Profile.jsx",
  "frontend/src/pages/Donate.jsx",
  "frontend/src/pages/Admin.jsx"
];

const replacements = [
  ["Lottery amount", "Legacy Impact Reserve amount"],
  ["lottery amount", "Legacy Impact Reserve amount"],
  ["15% - Monthly donor lottery", "15% - Legacy Impact Reserve"],
  ["15% Monthly donor lottery", "15% Legacy Impact Reserve"],
  ["Monthly donor lottery", "Legacy Impact Reserve"],
  ["monthly donor lottery", "Legacy Impact Reserve"],
  ["Monthly donor pool", "Legacy Impact Reserve"],
  ["monthly donor pool", "Legacy Impact Reserve"],
  ["donor pool", "Legacy Impact Reserve"],
  ["Donor Pool", "Legacy Impact Reserve"],
  ["15% monthly donor pool", "15% Legacy Impact Reserve"],
  ["Donation received, cause allocation, platform allocation, and lottery allocation should", "Contribution received, Impact Allocation, Platform Operations, and Legacy Impact Reserve records should"],
  ["Donation received", "Contribution received"],
  ["donation received", "contribution received"],
  ["Cause allocation", "Impact Allocation"],
  ["cause allocation", "Impact Allocation"],
  ["Platform allocation", "Platform Operations"],
  ["platform allocation", "Platform Operations"],
  ["Lottery allocation", "Legacy Impact Reserve"],
  ["lottery allocation", "Legacy Impact Reserve"],
  ["Donor", "Supporter"],
  ["donor", "supporter"],
  ["Donation", "Contribution"],
  ["donation", "contribution"]
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`Skipped missing file: ${file}`);
    continue;
  }

  let text = fs.readFileSync(file, "utf8");

  for (const [from, to] of replacements) {
    text = text.split(from).join(to);
  }

  // Restore risky backend/internal names that must not change yet.
  text = text.split("contribution_received").join("donation_received");
  text = text.split("Impact Allocation_allocation").join("cause_allocation");
  text = text.split("Platform Operations_allocation").join("platform_allocation");
  text = text.split("Legacy Impact Reserve_allocation").join("lottery_allocation");

  text = text.split("lotteryAmount").join("lotteryAmount");
  text = text.split("lotteryLabel").join("lotteryLabel");
  text = text.split("lotteryReserve").join("lotteryReserve");
  text = text.split("lottery_allocation").join("lottery_allocation");

  text = text.split("savedContribution").join("savedDonation");
  text = text.split("setSavedContribution").join("setSavedDonation");
  text = text.split("handleSaveMockContribution").join("handleSaveMockDonation");

  fs.writeFileSync(file, text, "utf8");
  console.log(`Updated ${file}`);
}

console.log("Public wording cleanup completed.");