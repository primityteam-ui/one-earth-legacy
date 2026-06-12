const fs = require("fs");
const path = require("path");

const srcDir = "frontend/src";

function walk(dir) {
  let files = [];

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      files = files.concat(walk(full));
    } else if (full.endsWith(".jsx") || full.endsWith(".js")) {
      files.push(full);
    }
  }

  return files;
}

const fixes = [
  ["ContributionActionPanel", "DonationActionPanel"],
  ["ContributionSidebar", "DonationSidebar"],
  ["ContributionTilePreview", "DonationTilePreview"],
  ["ContributionSuccessBox", "DonationSuccessBox"]
];

for (const file of walk(srcDir)) {
  let text = fs.readFileSync(file, "utf8");
  let updated = text;

  for (const [from, to] of fixes) {
    updated = updated.split(from).join(to);
  }

  if (updated !== text) {
    fs.writeFileSync(file, updated, "utf8");
    console.log(`Fixed ${file}`);
  }
}

console.log("Finished repairing component names.");
