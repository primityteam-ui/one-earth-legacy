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
      "Rules for using One Earth Legacy, buying digital legacy space, donor tiles, add-ons, and public profile features.",
    icon: <FileText />,
    sections: [
      {
        title: "Commercial platform notice",
        text:
          "One Earth Legacy is a commercial digital legacy and visibility platform. It is not a charity. Users pay for digital legacy space, public tile placement, profile features, and optional add-ons. Cause contributions are part of the platform feature set."
      },
      {
        title: "Digital tile ownership",
        text:
          "A donor tile gives the user a public display space on the platform. It does not create ownership of the website, brand, codebase, donation infrastructure, or cause partner organizations."
      },
      {
        title: "Refunds and chargebacks",
        text:
          "Refund rules will be clearly shown before payment. Chargebacks may cause rank removal, tile suspension, and account review. Fraudulent or abusive chargebacks may result in account suspension."
      },
      {
        title: "Content rules",
        text:
          "Tile names, messages, logos, and profile content must not include hate speech, threats, explicit abuse, impersonation, scams, malware links, or illegal content. Flagged content may be hidden pending review."
      },
      {
        title: "Rank confirmation",
        text:
          "Ranks are based on confirmed cumulative donations. Large payments and Emperor-level status require settlement and manual review before full privileges are granted."
      }
    ]
  },

  privacy: {
    eyebrow: "Privacy",
    title: "Privacy Policy",
    description:
      "How One Earth Legacy handles account data, donation records, cookies, security logs, and deletion requests.",
    icon: <LockKeyhole />,
    sections: [
      {
        title: "Data we collect",
        text:
          "We collect basic account details such as email, display name, username, login history, donation records, tile content, profile settings, and security logs needed to protect the platform."
      },
      {
        title: "Payment data",
        text:
          "Card details are never handled directly by our servers. Payments will be processed through Stripe Checkout, Stripe Elements, or Razorpay. We store payment status, payment IDs, amounts, settlement status, and audit records."
      },
      {
        title: "Security logs",
        text:
          "For fraud prevention and account protection, we log login events, failed logins, rate-limit events, suspicious payment patterns, admin actions, chargebacks, and Emperor actions."
      },
      {
        title: "GDPR and CCPA rights",
        text:
          "Users can request account deletion, data export, correction, or anonymization where legally allowed. Payment and audit records may be retained when required for legal, tax, fraud, or compliance reasons."
      },
      {
        title: "Cookies",
        text:
          "The app uses secure cookies for refresh-token sessions. EU users will receive a cookie consent banner before analytics or marketing cookies are used."
      }
    ]
  },

  security: {
    eyebrow: "Trust",
    title: "How We Protect You",
    description:
      "Security standards used across authentication, payments, API protection, monitoring, and data handling.",
    icon: <ShieldCheck />,
    sections: [
      {
        title: "Secure authentication",
        text:
          "The platform uses passwordless OTP login, Google OAuth, short-lived access tokens, httpOnly refresh-token cookies, token rotation, and server-side refresh token revocation."
      },
      {
        title: "Payment security",
        text:
          "The platform never touches raw card data. Stripe and Razorpay webhooks must be signature verified before donation records, ranks, or tiles are updated."
      },
      {
        title: "Input protection",
        text:
          "All user input must be validated and sanitized. Tile messages are plain text only. File uploads are validated by type and size before being stored through Cloudinary."
      },
      {
        title: "Infrastructure protection",
        text:
          "Production traffic should go through Cloudflare with HTTPS, WAF, DDoS protection, bot protection, HSTS, and locked CORS rules."
      },
      {
        title: "Monitoring and incident response",
        text:
          "Sentry, UptimeRobot, SecurityLog records, backup drills, and an incident response plan are required before accepting real payments."
      }
    ]
  },

  faq: {
    eyebrow: "FAQ",
    title: "Frequently Asked Questions",
    description:
      "Simple answers about donations, ranks, the wall, Emperor status, lottery pool, and money split.",
    icon: <HelpCircle />,
    sections: [
      {
        title: "Where does my money go?",
        text:
          "The platform split is transparent: 60% goes to the verified global cause chosen by the current Emperor, 25% supports platform sustainability, and 15% goes to the monthly donor lottery pool."
      },
      {
        title: "Is One Earth Legacy a charity?",
        text:
          "No. It is a commercial digital legacy platform. Users pay for digital display, profile, tile, rank, and visibility features. Cause contribution is a built-in transparent feature."
      },
      {
        title: "How are ranks calculated?",
        text:
          "Ranks are based on cumulative confirmed donations in USD equivalent. The higher the cumulative confirmed amount, the higher the rank."
      },
      {
        title: "What is the Emperor?",
        text:
          "The Emperor is the highest donor tier. The Emperor controls the active global cause allocation and appears in the main spotlight. Emperor privileges require settlement, review, and extra security."
      },
      {
        title: "How does the lottery work?",
        text:
          "15% of donation value is reserved for the monthly donor lottery pool. Lottery rules, winner proof, and payout logs will appear in the public audit log."
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
          text="Payment records may be retained for legal, tax, and fraud requirements."
        />

        <MiniCard
          icon={<Trash2 />}
          title="Deletion requests"
          text="Account deletion anonymizes public data where legally possible."
        />

        <MiniCard
          icon={<Cookie />}
          title="Cookie consent"
          text="Cookie consent will be shown for users where required."
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