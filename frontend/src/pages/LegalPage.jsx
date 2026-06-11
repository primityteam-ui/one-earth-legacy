import { Link, useParams } from "react-router-dom";
import {
  Cookie,
  FileText,
  HelpCircle,
  LockKeyhole,
  ShieldCheck,
  Trash2,
  WalletCards
} from "lucide-react";

const pages = {
  terms: {
    eyebrow: "Legal",
    title: "Terms of Service",
    description:
      "Rules for using One Earth Legacy, purchasing digital legacy features, creating public donor tiles, and participating in platform visibility features.",
    icon: <FileText />,
    sections: [
      {
        title: "Commercial platform notice",
        text:
          "One Earth Legacy is a commercial digital legacy and visibility platform. It is not currently a registered charity, nonprofit, bank, investment product, lottery operator, or government program. Users pay for digital legacy space, public tile placement, profile features, rank visibility, and optional add-ons. Cause-related allocations are part of the platform feature set and should be reviewed through the public audit page."
      },
      {
        title: "Digital tile and profile features",
        text:
          "A legacy tile gives the user a public display space on the platform. It does not create ownership of the website, brand, codebase, donation infrastructure, payment accounts, future revenue, cause partner organizations, or any physical land or object. Public display may depend on payment settlement, platform safety review, and content compliance."
      },
      {
        title: "Payments, settlement, and review",
        text:
          "Payments may be processed through Stripe Checkout or another supported payment provider. A checkout success screen does not always mean the donation has been fully saved, settled, or reviewed. Final rank, tile visibility, Emperor privileges, audit records, and leaderboard updates may depend on webhook confirmation, settlement status, fraud checks, and admin review."
      },
      {
        title: "Refunds and chargebacks",
        text:
          "Refund rules should be shown before payment or provided through support. Refunds, failed payments, disputes, chargebacks, or suspected fraud may cause rank changes, tile removal, public visibility changes, Emperor privilege suspension, or account review. Fraudulent or abusive chargebacks may result in account suspension."
      },
      {
        title: "Content rules",
        text:
          "Tile names, messages, profile content, images, links, and public display text must not include hate speech, threats, explicit abuse, impersonation, scams, malware links, illegal content, doxxing, private addresses, or misleading claims. Flagged content may be hidden, edited, restricted, or reviewed before display."
      },
      {
        title: "No guarantee of permanent availability",
        text:
          "One Earth Legacy aims to preserve donor legacy records and public visibility, but no website can guarantee permanent uptime, permanent hosting, permanent ranking rules, or permanent display format. Features may change for security, legal, payment, technical, or operational reasons."
      }
    ]
  },

  privacy: {
    eyebrow: "Privacy",
    title: "Privacy Policy",
    description:
      "How One Earth Legacy handles account data, donation records, donor-safe location data, cookies, security logs, and deletion requests.",
    icon: <LockKeyhole />,
    sections: [
      {
        title: "Data we collect",
        text:
          "We may collect account details such as email, display name, username, login history, donation records, selected mission, tile content, profile settings, payment status, referral data, and security logs needed to operate and protect the platform."
      },
      {
        title: "Safe donor location policy",
        text:
          "One Earth Legacy does not ask for or display a street address for public donor pages. Public location features should use donor-safe fields such as country, region, city, and rounded or approximate coordinates. If a browser location option is used, coordinates should be rounded before saving and shown only as an approximate city-area point, not a home address."
      },
      {
        title: "Payment data",
        text:
          "Raw card details are not handled directly by One Earth Legacy servers. Card entry is handled by payment providers such as Stripe Checkout. We may store payment status, payment IDs, Stripe checkout session IDs, payment method type, amount, currency, settlement status, refund/dispute status, and audit records needed for payment tracking and fraud prevention."
      },
      {
        title: "Public donation records",
        text:
          "Some donation-related information may be public by design, including display name, username, donor rank, tile message, selected mission, country or city-level location, total donated, and audit-style allocation records. Anonymous display options may hide public name, but payment, security, fraud, tax, and audit records may still be retained internally where required."
      },
      {
        title: "Security logs",
        text:
          "For fraud prevention and account protection, we may log login events, failed logins, OTP events, rate-limit events, suspicious payment patterns, admin actions, chargebacks, webhook events, IP address, user agent, timestamps, and related security metadata."
      },
      {
        title: "Data requests and deletion",
        text:
          "Users can request account deletion, correction, export, or anonymization where legally allowed. Some records may be retained when required for legal, tax, audit, payment settlement, fraud prevention, dispute handling, or platform security reasons."
      },
      {
        title: "Cookies",
        text:
          "The app may use secure cookies for authentication sessions. Analytics or marketing cookies should be added only with proper consent where required by law."
      }
    ]
  },

  security: {
    eyebrow: "Trust",
    title: "How We Protect You",
    description:
      "Security standards used across authentication, payments, API protection, monitoring, admin access, and data handling.",
    icon: <ShieldCheck />,
    sections: [
      {
        title: "Secure authentication",
        text:
          "The platform is designed around passwordless OTP login, short-lived access tokens, httpOnly refresh-token cookies, refresh-token rotation, and server-side token revocation. Admin routes require authenticated admin access."
      },
      {
        title: "Payment security",
        text:
          "The platform should never receive raw card data. Stripe webhooks must be signature verified using the raw request body before paid donation records, ranks, tiles, or audit records are trusted. Stripe live keys should be used only in production after webhook testing is complete."
      },
      {
        title: "Admin safety",
        text:
          "Admin features should stay read-only or limited until IP allowlist, two-factor verification, rate limits, security logs, and audit trails are fully ready. Destructive actions such as refunds, bans, deletes, payouts, or Emperor privilege changes should require extra review and logging."
      },
      {
        title: "Input protection",
        text:
          "User input should be validated, length-limited, and sanitized. Tile messages should be treated as text content, not executable code. File uploads, if enabled, should be validated by type and size before storage."
      },
      {
        title: "Infrastructure protection",
        text:
          "Production traffic should use HTTPS, secure CORS rules, hardened headers, rate limits, monitoring, backups, environment-variable protection, and secret-key separation between frontend and backend."
      },
      {
        title: "Monitoring and incident response",
        text:
          "Before public live payments, the platform should have webhook monitoring, error monitoring, uptime checks, backup procedures, admin security logs, and an incident response plan."
      }
    ]
  },

  faq: {
    eyebrow: "FAQ",
    title: "Frequently Asked Questions",
    description:
      "Simple answers about payments, ranks, the wall, donor location privacy, Emperor status, audit records, and the platform split.",
    icon: <HelpCircle />,
    sections: [
      {
        title: "Is One Earth Legacy a charity?",
        text:
          "No. One Earth Legacy is a commercial digital legacy platform. Users pay for digital display, profile, tile, rank, and visibility features. Cause allocation is a built-in platform feature, not a claim that the platform is a registered charity."
      },
      {
        title: "Where does my money go?",
        text:
          "The platform target split is shown publicly: 60% for cause allocation, 25% for platform sustainability, and 15% for the donor pool feature. Actual records should be reviewed through the public audit page and may depend on payment settlement, refunds, disputes, and admin review."
      },
      {
        title: "Do you show my address?",
        text:
          "No public donor page should show a street address. The platform is designed to show donor-safe location data such as country, region, city, or rounded approximate coordinates for globe and leaderboard features."
      },
      {
        title: "Why does the success page say webhook verification matters?",
        text:
          "Stripe can redirect a user to the success page after checkout, but the backend webhook is what safely confirms and saves the paid donation. Wall, audit, leaderboard, profile, and globe updates should depend on webhook-confirmed payment data."
      },
      {
        title: "How are ranks calculated?",
        text:
          "Ranks are based on cumulative confirmed donation amounts in USD equivalent. Failed payments, refunds, chargebacks, disputes, fraud checks, or admin review may change rank visibility or status."
      },
      {
        title: "What is the Emperor?",
        text:
          "The Emperor is the highest donor tier and may receive special visibility or cause-selection privileges. Emperor privileges require payment settlement, admin review, security checks, and may be delayed, suspended, or changed for safety or legal reasons."
      },
      {
        title: "How does the donor pool work?",
        text:
          "The donor pool feature is planned to use 15% of donation value according to published rules. Final rules, eligibility, winner proof, and payout logs should appear in the public audit log before real payouts are made."
      }
    ]
  }
};

export default function LegalPage() {
  const { page } = useParams();
  const content = pages[page] || pages.faq;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <section className="mb-8 rounded-[2rem] border border-gold/25 bg-royalCard p-8 shadow-gold">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-gold">
              {content.eyebrow}
            </p>

            <h1 className="font-display text-4xl font-bold md:text-6xl">
              {content.title}
            </h1>

            <p className="mt-4 max-w-3xl text-textSecondary">
              {content.description}
            </p>
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
            {content.icon}
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <QuickLink to="/legal/terms" icon={<FileText />} label="Terms" />
        <QuickLink to="/legal/privacy" icon={<LockKeyhole />} label="Privacy" />
        <QuickLink to="/legal/security" icon={<ShieldCheck />} label="Security" />
        <QuickLink to="/legal/faq" icon={<HelpCircle />} label="FAQ" />
      </section>

      <section className="mb-8 rounded-[1.5rem] border border-amber-400/30 bg-amber-400/10 p-5">
        <p className="font-display text-2xl font-bold text-textPrimary">
          Important notice
        </p>
        <p className="mt-3 leading-7 text-textSecondary">
          This page is practical platform policy copy for product clarity. It is
          not legal advice. Before public production launch, have a qualified
          attorney review these terms, privacy, payment, refund, donor pool, and
          audit statements for your target countries and payment providers.
        </p>
      </section>

      <section className="space-y-5">
        {content.sections.map((section) => (
          <article
            key={section.title}
            className="rounded-[1.5rem] border border-borderRoyal bg-royalCard p-6"
          >
            <h2 className="font-display text-2xl font-bold text-textPrimary">
              {section.title}
            </h2>

            <p className="mt-3 leading-7 text-textSecondary">{section.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <MiniCard
          icon={<WalletCards />}
          title="Payment records"
          text="Payment and audit records may be retained for legal, tax, fraud, dispute, and compliance requirements."
        />

        <MiniCard
          icon={<Trash2 />}
          title="Deletion requests"
          text="Account deletion may anonymize public data where legally possible, while retaining required payment or audit records."
        />

        <MiniCard
          icon={<Cookie />}
          title="Cookie consent"
          text="Analytics or marketing cookies should be added only with proper consent where required."
        />
      </section>
    </main>
  );
}

function QuickLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl border border-borderRoyal bg-royalPanel p-4 text-textSecondary hover:border-gold hover:text-gold"
    >
      <span>{icon}</span>
      <span className="font-bold">{label}</span>
    </Link>
  );
}

function MiniCard({ icon, title, text }) {
  return (
    <div className="rounded-[1.5rem] border border-borderRoyal bg-royalPanel p-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
        {icon}
      </div>

      <h3 className="font-display text-xl font-bold text-textPrimary">{title}</h3>
      <p className="mt-2 text-sm text-textSecondary">{text}</p>
    </div>
  );
}
