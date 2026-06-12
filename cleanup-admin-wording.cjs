const fs = require("fs");

const file = "frontend/src/pages/Admin.jsx";

let text = fs.readFileSync(file, "utf8");

const replacements = [
  ["const tabs = [\"Overview\", \"Donations\", \"Donors\", \"Missions\", \"Audit\", \"Security\", \"Health\"];", "const tabs = [\"Overview\", \"Contributions\", \"Supporters\", \"Missions\", \"Audit\", \"Security\", \"Health\"];"],

  ["Overview: recentDonations.length,\n    Donations: recentDonations.length,\n    Donors: topDonors.length,", "Overview: recentDonations.length,\n    Contributions: recentDonations.length,\n    Supporters: topDonors.length,"],

  ["label: \"Total revenue\",", "label: \"Total contributions\","],
  ["label: \"Cause reserve\",", "label: \"Impact Allocation\","],
  ["label: \"Platform reserve\",", "label: \"Platform Operations\","],
  ["label: \"Lottery reserve\",", "label: \"Legacy Impact Reserve\","],

  ["Real Donation Dashboard", "Legacy Contribution Dashboard"],
  ["View real MongoDB donations, donors, locations, missions, payment status,\n              reserve split, and public legacy activity. Donation CSV downloads use the selected\n              search, payment, mission, and country filters.", "View real MongoDB contribution records, supporters, locations, missions, payment status,\n              allocation split, and public legacy activity. Contribution CSV downloads use the selected\n              search, payment, mission, and country filters."],

  ["Download Filtered CSV", "Download Filtered CSV"],
  ["Download CSV", "Download CSV"],

  ["Paid donors", "Paid supporters"],
  ["Paid donations", "Paid contributions"],

  ["Search donations and donors", "Search contributions and supporters"],
  ["Search name, email, mission, location...", "Search name, email, mission, location..."],
  ["Donation CSV will be filtered", "Contribution CSV will be filtered"],

  ["activeTab === \"Donations\"", "activeTab === \"Contributions\""],
  ["activeTab === \"Donors\"", "activeTab === \"Supporters\""],

  ["Revenue Split", "Money Split"],
  ["Cause allocation", "Impact Allocation"],
  ["Platform reserve", "Platform Operations"],
  ["Lottery reserve", "Legacy Impact Reserve"],
  ["60% Cause allocation", "60% Impact Allocation"],
  ["25% Platform sustainability", "25% Platform Operations"],
  ["15% Lottery pool", "15% Legacy Impact Reserve"],

  ["Latest Donations", "Latest Contributions"],
  ["recent donations", "recent contributions"],
  ["No recent donations", "No recent contributions"],
  ["Recent donation activity will appear here after successful paid donations or mock test donations.", "Recent contribution activity will appear here after successful paid contributions or local test contributions."],

  ["No mission donations yet.", "No mission contributions yet."],
  ["Mission totals will appear after successful paid donations.", "Mission totals will appear after successful paid contributions."],
  ["Country totals will appear after donors choose a country or city location.", "Country totals will appear after supporters choose a country or city location."],
  ["Mission breakdown totals will appear once paid donations are recorded.", "Mission breakdown totals will appear once paid contributions are recorded."],

  ["Donation Records", "Contribution Records"],
  ["donation records", "contribution records"],
  ["No donation records found", "No contribution records found"],
  ["No donations match the selected filters yet. Try clearing filters or create a mock/test donation.", "No contribution records match the selected filters yet. Try clearing filters or create a local test contribution."],

  ["Donor", "Supporter"],
  ["donor records", "supporter records"],
  ["Top Donors", "Top Supporters"],
  ["No donors found", "No supporters found"],
  ["No donor records are available yet. Donors will appear here after successful paid donations.", "No supporter records are available yet. Supporters will appear here after successful paid contributions."],
  ["Unknown donor", "Unknown supporter"],
  ["No donor message", "No supporter message"],

  ["Donation Detail", "Contribution Detail"],
  ["Total Donated", "Total Contributed"],
  ["Role\" value={donation.donor?.role || \"donor\"}", "Role\" value={donation.donor?.role || \"supporter\"}"],

  ["Donations received", "Contributions received"],
  ["Donation received", "Contribution received"],
  ["Cause allocation", "Impact Allocation"],
  ["Platform allocation", "Platform Operations"],
  ["Lottery allocation", "Legacy Impact Reserve"],
  ["<option value=\"cause_allocation\">Cause allocation</option>", "<option value=\"cause_allocation\">Impact Allocation</option>"],
  ["<option value=\"platform_allocation\">Platform allocation</option>", "<option value=\"platform_allocation\">Platform Operations</option>"],
  ["<option value=\"lottery_allocation\">Lottery allocation</option>", "<option value=\"lottery_allocation\">Legacy Impact Reserve</option>"],

  ["Do not add delete, refund, ban, payout, or withdrawal actions until IP whitelist,", "Do not add delete, refund, ban, reserve-release, or destructive actions until IP whitelist,"],
  ["before enabling real admin write actions, payouts, refunds, bans, or production donations.", "before enabling real admin write actions, reserve actions, refunds, bans, or production contributions."],
  ["Keep admin actions read-only except safe audit entry creation until 2FA, IP allowlist, Stripe webhook, and production security checks are fully ready.", "Keep admin actions read-only except safe audit entry creation until 2FA, IP allowlist, Stripe webhook, and production security checks are fully ready."],

  ["Do not add destructive admin actions until\n            2FA, IP whitelist, and security logging are fully implemented.", "Do not add destructive admin actions until\n            2FA, IP whitelist, and security logging are fully implemented."],

  ["Required before accepting real donations.", "Required before accepting real Legacy Contributions."],
  ["Required for donations, audit logs, users, and admin dashboard data.", "Required for contribution records, audit logs, users, and admin dashboard data."],

  ["Contribution received records", "Contribution received records"],
  ["Legacy Impact Reserve allocation", "Legacy Impact Reserve"]
];

for (const [from, to] of replacements) {
  text = text.split(from).join(to);
}

fs.writeFileSync(file, text, "utf8");

console.log("Admin.jsx public wording updated safely.");