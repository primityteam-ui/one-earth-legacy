import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  FileClock,
  Globe2,
  LockKeyhole,
  Megaphone,
  PackageCheck,
  Save,
  ShieldCheck
} from "lucide-react";
import api from "../api/client.js";

const causes = [
  {
    id: "clean-water",
    name: "Clean drinking water",
    partner: "Water.org",
    description: "Fund access to clean and safe drinking water for communities in need.",
    impact: "Every $25 can help support water access work."
  },
  {
    id: "hunger-relief",
    name: "Hunger relief",
    partner: "WFP",
    description: "Support food assistance and hunger relief programs across the world.",
    impact: "Every $10 can help support emergency food response."
  },
  {
    id: "education",
    name: "Global education",
    partner: "UNICEF",
    description: "Help children access learning, school supplies, and education support.",
    impact: "Every $30 can support education access work."
  },
  {
    id: "climate",
    name: "Climate action",
    partner: "WWF",
    description: "Support conservation, climate resilience, and protection of natural systems.",
    impact: "Every $50 can support conservation action."
  }
];

export default function Emperor() {
  const [selectedCause, setSelectedCause] = useState(causes[0]);
  const [globalMessage, setGlobalMessage] = useState(
    "One Earth. One Wall. One Emperor. Let this cause define our legacy."
  );
  const [emperorData, setEmperorData] = useState({
    emperor: null,
    throneEmpty: true,
    message: "The throne is empty.",
    selectedCause: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmperor() {
      try {
        const response = await api.get("/public/emperor");
        setEmperorData(response.data);

        if (response.data?.selectedCause) {
          const matchedCause = causes.find((cause) => cause.name === response.data.selectedCause);
          if (matchedCause) {
            setSelectedCause(matchedCause);
          }
        }

        if (response.data?.message) {
          setGlobalMessage(response.data.message);
        }
      } catch (error) {
        console.error("Could not load current Emperor", error);
      } finally {
        setLoading(false);
      }
    }

    loadEmperor();
  }, []);

  const emperorName = emperorData?.emperor?.name || "None";
  const isThroneEmpty = emperorData?.throneEmpty;

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="mb-8 rounded-[2rem] border border-gold/25 bg-royalCard p-8 shadow-gold">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-gold">
              Emperor’s Chamber
            </p>

            <h1 className="font-display text-4xl font-bold md:text-6xl">
              Control the Global Cause
            </h1>

            <p className="mt-4 max-w-3xl text-textSecondary">
              The Emperor chooses where the 60% cause allocation goes and writes the global
              message seen across the platform. This page is now connected to your backend
              current Emperor API.
            </p>
          </div>

          <div className="rounded-2xl border border-crimson/40 bg-crimson/10 px-5 py-4">
            <p className="text-sm text-crimsonLight">Access mode</p>
            <p className="font-display text-2xl font-bold text-textPrimary">
              Preview Only
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-10 text-center text-textSecondary">
          Loading Emperor data from backend...
        </div>
      ) : (
        <>
          <section className="mb-8 grid gap-5 md:grid-cols-4">
            <StatCard icon={<Crown />} label="Current Emperor" value={emperorName} />
            <StatCard
              icon={<Globe2 />}
              label="Active cause"
              value={emperorData?.selectedCause || selectedCause.name}
            />
            <StatCard icon={<ShieldCheck />} label="2FA required" value="Yes" />
            <StatCard icon={<FileClock />} label="Audit logging" value="Always" />
          </section>

          <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <div className="space-y-8">
              <Panel
                icon={<Globe2 className="h-5 w-5" />}
                title="Choose global cause"
                subtitle="The chosen cause receives 60% of each donation while this Emperor reigns."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {causes.map((cause) => (
                    <button
                      key={cause.id}
                      onClick={() => setSelectedCause(cause)}
                      className={`rounded-[1.5rem] border p-5 text-left transition ${
                        selectedCause.id === cause.id
                          ? "border-gold bg-gold/10 shadow-gold"
                          : "border-borderRoyal bg-black/30 hover:border-gold"
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="font-display text-xl font-bold text-textPrimary">
                          {cause.name}
                        </p>
                        {selectedCause.id === cause.id && (
                          <Crown className="h-5 w-5 text-gold" />
                        )}
                      </div>

                      <p className="text-sm text-goldLight">Partner: {cause.partner}</p>
                      <p className="mt-3 text-sm text-textSecondary">{cause.description}</p>
                      <p className="mt-4 rounded-2xl border border-borderRoyal bg-black/30 p-3 text-sm text-textSecondary">
                        {cause.impact}
                      </p>
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel
                icon={<Megaphone className="h-5 w-5" />}
                title="Write global Emperor message"
                subtitle="This message will appear in the Emperor Spotlight and weekly Emperor announcement."
              >
                <textarea
                  value={globalMessage}
                  onChange={(event) => setGlobalMessage(event.target.value.slice(0, 500))}
                  rows={6}
                  className="w-full resize-none rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
                />

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-textSecondary">{globalMessage.length}/500</p>

                  <button
                    onClick={() => alert("Emperor message saving will be connected to protected backend later.")}
                    className="flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-bold text-black shadow-gold hover:bg-goldLight"
                  >
                    <Save className="h-4 w-4" />
                    Save Message
                  </button>
                </div>
              </Panel>

              <Panel
                icon={<PackageCheck className="h-5 w-5" />}
                title="Coronation package"
                subtitle="Premium Emperor package stream from the business model."
              >
                <div className="rounded-[1.5rem] border border-gold/30 bg-gold/10 p-6">
                  <p className="font-display text-3xl font-bold text-textPrimary">
                    Coronation Package
                  </p>

                  <p className="mt-3 text-textSecondary">
                    Includes premium Emperor announcement, ceremonial digital certificate,
                    press-style profile page, and future physical package workflow.
                  </p>

                  <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <p className="font-numbers text-4xl font-bold text-goldLight">
                      $2,999
                    </p>

                    <button
                      onClick={() => alert("Coronation checkout will be connected later.")}
                      className="rounded-full border border-gold px-6 py-3 font-bold text-goldLight hover:bg-gold hover:text-black"
                    >
                      Preview Order
                    </button>
                  </div>
                </div>
              </Panel>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[2rem] border border-gold/25 bg-royalCard p-6 shadow-gold">
                <p className="mb-4 text-sm uppercase tracking-[0.3em] text-gold">
                  Emperor Spotlight Preview
                </p>

                <div className="rounded-[1.5rem] border border-gold/30 bg-black/40 p-6 text-center">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-gold/50 bg-gold/10 text-gold">
                    <Crown className="h-10 w-10" />
                  </div>

                  <p className="font-display text-3xl font-bold text-goldLight">
                    {isThroneEmpty ? "THE THRONE IS EMPTY" : emperorName}
                  </p>

                  <p className="mt-4 text-textSecondary">{globalMessage}</p>

                  <div className="mt-6 rounded-2xl border border-borderRoyal bg-black/30 p-4">
                    <p className="text-sm text-textSecondary">Chosen cause</p>
                    <p className="mt-1 font-bold text-textPrimary">{selectedCause.name}</p>
                    <p className="mt-1 text-sm text-goldLight">{selectedCause.partner}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
                <p className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
                  <LockKeyhole className="h-5 w-5 text-gold" />
                  Security requirements
                </p>

                <SecurityLine text="JWT authentication required" />
                <SecurityLine text="Emperor role check required" />
                <SecurityLine text="2FA re-verification required" />
                <SecurityLine text="IP address logged" />
                <SecurityLine text="All actions saved to audit trail" />
                <SecurityLine text="30-day hold before full Emperor privileges" />
              </div>

              <div className="rounded-[2rem] border border-crimson/40 bg-crimson/10 p-6">
                <p className="font-display text-xl font-bold text-textPrimary">
                  Preview warning
                </p>
                <p className="mt-3 text-textSecondary">
                  This page is visible during frontend development. In production,
                  this route must be protected and usable only by the confirmed Emperor.
                </p>
              </div>
            </aside>
          </section>
        </>
      )}
    </main>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-borderRoyal bg-royalPanel p-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
        {icon}
      </div>

      <p className="text-sm text-textSecondary">{label}</p>
      <p className="mt-2 font-numbers text-xl font-bold text-textPrimary">{value}</p>
    </div>
  );
}

function Panel({ icon, title, subtitle, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6"
    >
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
          {icon}
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-textPrimary">
            {title}
          </h2>
          <p className="mt-1 text-textSecondary">{subtitle}</p>
        </div>
      </div>

      {children}
    </motion.section>
  );
}

function SecurityLine({ text }) {
  return (
    <div className="mb-3 flex items-center gap-3 rounded-2xl border border-borderRoyal bg-black/30 p-4">
      <ShieldCheck className="h-5 w-5 text-gold" />
      <span className="text-textSecondary">{text}</span>
    </div>
  );
}