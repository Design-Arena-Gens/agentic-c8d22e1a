"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ScenarioModule = {
  order: number;
  app: string;
  module: string;
  purpose: string;
  aiAssist: string;
};

type ScenarioAutomation = {
  title: string;
  description: string;
  aiTouchpoints: string[];
};

type ScenarioSprint = {
  sprint: string;
  focus: string;
  deliverables: string[];
};

type ScenarioDataProduct = {
  name: string;
  purpose: string;
  consumers: string[];
};

type ScenarioResult = {
  title: string;
  mission: string;
  aiBrain: {
    orchestration: string;
    models: string[];
    promptBlueprint: string[];
    safeguards: string[];
  };
  trigger: {
    description: string;
    cadence: string;
    inputs: string[];
    kickoff: string;
  };
  modules: ScenarioModule[];
  automations: ScenarioAutomation[];
  dataProducts: ScenarioDataProduct[];
  monitoring: {
    leadKpis: string[];
    lagKpis: string[];
    qa: string[];
  };
  implementation: ScenarioSprint[];
  guardrails: string[];
  quickWins: string[];
  meta: {
    provider: string;
    model?: string;
    createdAt: string;
  };
};

const ideaPresets = [
  {
    title: "Lead nurturing B2B",
    description:
      "Transformer automatiquement les leads entrants du site en sequences personnalisees, avec scoring intelligent et synchronisation CRM.",
  },
  {
    title: "Support client multicanal",
    description:
      "Unifier les tickets Slack, email et outil de support pour router les demandes et proposer des reponses IA contextualisees.",
  },
  {
    title: "Onboarding SaaS",
    description:
      "Automatiser l'onboarding des clients SaaS en connectant la facturation, le produit et les alertes proactives pilotees par IA.",
  },
];

const aiAddons = [
  "Analyse sentiment",
  "Score de priorisation",
  "Upsell intelligent",
  "Detection d'anomalies",
  "Resume automatique",
  "Generation de message",
  "Qualification de leads",
  "Traduction en direct",
];

type FormState = {
  idea: string;
  context: string;
  dataSources: string;
  outputs: string;
  aiPersonality: string;
  tone: string;
  automationMaturity: "debutant" | "intermediaire" | "expert";
  painPoints: string;
  aiAddons: string[];
};

const initialFormState: FormState = {
  idea: "",
  context: "",
  dataSources: "",
  outputs: "",
  aiPersonality: "Strategie operations intelligente et fiable",
  tone: "Vision strategique, concret et actionnable",
  automationMaturity: "intermediaire",
  painPoints: "",
  aiAddons: ["Analyse sentiment", "Resume automatique"],
};

function buildMarkdown(scenario: ScenarioResult) {
  const lines = [
    `# ${scenario.title}`,
    "",
    `**Mission**: ${scenario.mission}`,
    "",
    "## Cerveau IA",
    `- Orchestration: ${scenario.aiBrain.orchestration}`,
    `- Models: ${scenario.aiBrain.models.join(", ")}`,
    `- Safeguards: ${scenario.aiBrain.safeguards.join(", ")}`,
    "",
    "### Prompt Blueprint",
    ...scenario.aiBrain.promptBlueprint.map((line) => `- ${line}`),
    "",
    "## Declencheur",
    `- Description: ${scenario.trigger.description}`,
    `- Cadence: ${scenario.trigger.cadence}`,
    `- Inputs: ${scenario.trigger.inputs.join(", ")}`,
    `- Kick-off: ${scenario.trigger.kickoff}`,
    "",
    "## Modules Make",
  ];

  scenario.modules.forEach((module) => {
    lines.push(
      `- ${module.order}. ${module.app} - ${module.module}: ${module.purpose} | IA: ${module.aiAssist}`,
    );
  });

  lines.push("", "## Automations cognitives");
  scenario.automations.forEach((automation) => {
    lines.push(`- ${automation.title}: ${automation.description}`);
    automation.aiTouchpoints.forEach((touch) =>
      lines.push(`  - IA: ${touch}`),
    );
  });

  lines.push("", "## Produits data");
  scenario.dataProducts.forEach((product) => {
    lines.push(
      `- ${product.name}: ${product.purpose} (consommateurs: ${product.consumers.join(", ")})`,
    );
  });

  lines.push("", "## Monitoring");
  lines.push(`- Lead KPIs: ${scenario.monitoring.leadKpis.join(", ")}`);
  lines.push(`- Lag KPIs: ${scenario.monitoring.lagKpis.join(", ")}`);
  lines.push(`- Qualite: ${scenario.monitoring.qa.join(", ")}`);

  lines.push("", "## Implementation");
  scenario.implementation.forEach((sprint) => {
    lines.push(`- ${sprint.sprint}: ${sprint.focus}`);
    sprint.deliverables.forEach((deliverable) =>
      lines.push(`  - ${deliverable}`),
    );
  });

  lines.push("", "## Garde-fous IA");
  scenario.guardrails.forEach((guardrail) => lines.push(`- ${guardrail}`));

  lines.push("", "## Quick wins");
  scenario.quickWins.forEach((win) => lines.push(`- ${win}`));

  return lines.join("\n");
}

export default function Home() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [scenario, setScenario] = useState<ScenarioResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formIsSubmittable = useMemo(
    () => form.idea.trim().length > 20,
    [form.idea],
  );

  const handleAddonToggle = (addon: string) => {
    setForm((current) => {
      const exists = current.aiAddons.includes(addon);
      return {
        ...current,
        aiAddons: exists
          ? current.aiAddons.filter((item) => item !== addon)
          : [...current.aiAddons, addon],
      };
    });
  };

  const handleSubmit = async () => {
    if (!formIsSubmittable || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setCopied(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message.error ?? "Generation echouee");
      }

      const data: ScenarioResult = await response.json();
      setScenario(data);
    } catch (err) {
      console.error(err);
      setError(
        "Impossible de generer le scenario. Verifiez votre cle OpenAI ou reessayez plus tard.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const presetHandler = (description: string) => {
    setForm((current) => ({
      ...current,
      idea: description,
    }));
  };

  const copyToClipboard = useCallback(async () => {
    if (!scenario) return;
    try {
      await navigator.clipboard.writeText(buildMarkdown(scenario));
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error(err);
      setCopied(false);
      setError("Impossible de copier le scenario. Copiez manuellement.");
    }
  }, [scenario]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col gap-10 px-6 pb-16 pt-10 text-white sm:px-10">
      <section className="relative overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(15,26,47,0.8)] p-10 shadow-[0_40px_120px_-60px_rgba(56,189,248,0.45)]">
        <div className="absolute inset-x-0 -top-40 h-80 rounded-full bg-[radial-gradient(circle,_rgba(96,165,250,0.35)_0%,_rgba(15,23,42,0)_70%)] blur-3xl" />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(96,165,250,0.4)] bg-[rgba(96,165,250,0.12)] px-5 py-2 text-sm uppercase tracking-[0.2em] text-blue-200">
              Studio Architecte Make - IA Native
            </span>
            <div className="flex items-center gap-3 text-xs text-blue-200/70">
              <div className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
                Atelier temps reel
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-white/10 px-4 py-1 sm:flex">
                <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.6)]" />
                IA Co-pilote
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div className="space-y-5">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Concevez des scenarios Make de niveau architecte avec une IA
                pilote dans chaque flux.
              </h1>
              <p className="text-base text-blue-100/80 sm:text-lg">
                Formulez votre vision, nous construisons un blueprint complet:
                triggers, modules, prompts, garde-fous et plan d&apos;execution.
                Chaque scenario est optimise pour exploiter l&apos;IA la ou elle
                apporte le plus de valeur.
              </p>
            </div>
            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="absolute -right-3 -top-3 h-24 w-24 rounded-full bg-[radial-gradient(circle,_rgba(96,165,250,0.45)_0%,_rgba(15,23,42,0)_70%)] blur-lg" />
              <p className="text-xs uppercase tracking-[0.25em] text-blue-100/70">
                Mode Operatoire
              </p>
              <ul className="mt-3 space-y-2 text-sm text-blue-50/80">
                <li>1. Saisir votre idee ou probleme.</li>
                <li>2. Preciser contexte, datas, livrables.</li>
                <li>3. Laisser l&apos;IA orchestrer le scenario Make complet.</li>
                <li>4. Copier, iterer et passer en production.</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {ideaPresets.map((preset) => (
              <button
                key={preset.title}
                type="button"
                className="rounded-full border border-blue-300/40 bg-blue-300/10 px-4 py-2 text-sm text-blue-100 transition hover:border-blue-200/80 hover:bg-blue-200/20"
                onClick={() => presetHandler(preset.description)}
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-white/10 bg-[rgba(7,18,34,0.9)] p-8 shadow-[0_0_80px_-40px_rgba(96,165,250,0.45)] md:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div>
            <label className="text-sm uppercase tracking-[0.3em] text-blue-200/70">
              Vision ou probleme
            </label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base text-white placeholder:text-blue-100/40 focus:border-blue-300/70 focus:outline-none focus:ring-2 focus:ring-blue-300/40"
              rows={5}
              placeholder="Ex : Nous recevons des leads via un formulaire marketing mais ils ne sont pas qualifies ni retraite rapidement..."
              value={form.idea}
              onChange={(event) =>
                setForm((current) => ({ ...current, idea: event.target.value }))
              }
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm uppercase tracking-[0.3em] text-blue-200/70">
                Contexte business
              </label>
              <textarea
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base text-white placeholder:text-blue-100/40 focus:border-blue-300/70 focus:outline-none focus:ring-2 focus:ring-blue-300/40"
                rows={4}
                placeholder="Equipe, volume, objectifs, contraintes..."
                value={form.context}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    context: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-sm uppercase tracking-[0.3em] text-blue-200/70">
                  Sources de donnees
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-blue-100/40 focus:border-blue-300/70 focus:outline-none focus:ring-2 focus:ring-blue-300/40"
                  placeholder="HubSpot, Airtable, Notion, Slack, Google Drive..."
                  value={form.dataSources}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dataSources: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm uppercase tracking-[0.3em] text-blue-200/70">
                  Livrables attendus
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-blue-100/40 focus:border-blue-300/70 focus:outline-none focus:ring-2 focus:ring-blue-300/40"
                  placeholder="Alertes Slack, tickets, dashboards, emails..."
                  value={form.outputs}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      outputs: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <label className="text-sm uppercase tracking-[0.3em] text-blue-200/70">
                Persona IA
              </label>
              <textarea
                className="mt-2 h-[140px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-blue-100/40 focus:border-blue-300/70 focus:outline-none focus:ring-2 focus:ring-blue-300/40"
                value={form.aiPersonality}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    aiPersonality: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-6 lg:col-span-2">
              <div>
                <label className="text-sm uppercase tracking-[0.3em] text-blue-200/70">
                  Points de douleur actuels
                </label>
                <textarea
                  className="mt-2 h-[110px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-blue-100/40 focus:border-blue-300/70 focus:outline-none focus:ring-2 focus:ring-blue-300/40"
                  value={form.painPoints}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      painPoints: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm uppercase tracking-[0.3em] text-blue-200/70">
                    Ton & narration
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-blue-100/40 focus:border-blue-300/70 focus:outline-none focus:ring-2 focus:ring-blue-300/40"
                    value={form.tone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        tone: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm uppercase tracking-[0.3em] text-blue-200/70">
                    Maturite automatisation
                  </label>
                  <select
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-blue-300/70 focus:outline-none focus:ring-2 focus:ring-blue-300/40"
                    value={form.automationMaturity}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        automationMaturity: event.target
                          .value as FormState["automationMaturity"],
                      }))
                    }
                  >
                    <option value="debutant">Debutant</option>
                    <option value="intermediaire">Intermediaire</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-sm uppercase tracking-[0.3em] text-blue-200/70">
              Modules IA prioritaires
            </span>
            <div className="mt-3 flex flex-wrap gap-2">
              {aiAddons.map((addon) => {
                const active = form.aiAddons.includes(addon);
                return (
                  <button
                    key={addon}
                    type="button"
                    onClick={() => handleAddonToggle(addon)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      active
                        ? "border-blue-200/80 bg-blue-200/25 text-blue-50 shadow-[0_0_20px_rgba(96,165,250,0.45)]"
                        : "border-white/10 bg-white/5 text-blue-100/70 hover:border-blue-200/60 hover:bg-blue-200/10"
                    }`}
                  >
                    {addon}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formIsSubmittable || isLoading}
              className="inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-950 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-blue-200/20 disabled:text-blue-100"
            >
              {isLoading ? "Generation en cours..." : "Generer le scenario"}
            </button>
            <span className="text-xs text-blue-100/60">
              Longueur minimum: 20 caracteres pour la vision.
            </span>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-400/60 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}
        </div>

        <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-[rgba(15,26,47,0.65)] p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-200/70">
              Intelligence du scenario
            </p>
            <p className="mt-3 text-sm text-blue-100/80">
              Chaque flux est construit autour d&apos;un coeur IA orchestre
              (prompt blueprint, modele, garde-fous). L&apos;API peut utiliser
              OpenAI si la cle est configuree ({`process.env.OPENAI_API_KEY`}).
            </p>
          </div>
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-blue-200/60">
              Conseils
            </p>
            <ul className="space-y-2 text-sm text-blue-100/80">
              <li>
                Precisez les volumes et les attentes business pour orienter les
                choix de modules.
              </li>
              <li>
                Nommez les outils critiques (CRM, support, data warehouse) pour
                assurer leur presence dans le blueprint.
              </li>
              <li>
                Renseignez les quick wins souhaites pour obtenir un plan
                d&apos;execution immediat.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-blue-300/10 p-4 text-xs text-blue-100/70">
            <p className="font-semibold uppercase tracking-[0.3em]">
              Mode IA hybride
            </p>
            <p className="mt-2">
              Si aucune cle OpenAI n&apos;est detectee, un moteur heuristique
              embarque prendra le relais pour produire un scenario baseline.
            </p>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {scenario && (
          <motion.section
            key={scenario.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="space-y-6 rounded-3xl border border-blue-200/20 bg-[rgba(5,15,28,0.88)] p-10 shadow-[0_40px_140px_-80px_rgba(129,140,248,0.55)]"
          >
            <header className="flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.38em] text-blue-200/70">
                  Scenario propose
                </p>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {scenario.title}
                </h2>
                <p className="max-w-3xl text-base text-blue-100/80">
                  {scenario.mission}
                </p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-200/15 px-4 py-2 text-xs uppercase tracking-[0.28em] text-blue-100 transition hover:bg-blue-200/25"
                  onClick={copyToClipboard}
                >
                  {copied ? "Markdown copie" : "Copier en Markdown"}
                </button>
                <div className="text-right text-xs text-blue-200/60">
                  <p>Fournisseur: {scenario.meta.provider}</p>
                  {scenario.meta.model && <p>Modele: {scenario.meta.model}</p>}
                  <p>Genere: {scenario.meta.createdAt}</p>
                </div>
              </div>
            </header>

            <div className="grid gap-6 md:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-blue-200/60">
                  Orchestration IA
                </p>
                <p className="mt-2 text-sm text-blue-50">
                  {scenario.aiBrain.orchestration}
                </p>
                <div className="mt-4 space-y-1 text-xs text-blue-100/70">
                  <p>Models cibles :</p>
                  <ul className="list-inside list-disc space-y-1">
                    {scenario.aiBrain.models.map((model) => (
                      <li key={model}>{model}</li>
                    ))}
                  </ul>
                </div>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-blue-200/60">
                  Prompt Blueprint
                </p>
                <ul className="mt-2 space-y-2 text-sm text-blue-50/90">
                  {scenario.aiBrain.promptBlueprint.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-blue-200/60">
                  Safeguards
                </p>
                <ul className="mt-2 space-y-2 text-sm text-blue-50/90">
                  {scenario.aiBrain.safeguards.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </article>
            </div>

            <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
              <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-blue-200/60">
                  Trigger & inputs
                </p>
                <div className="mt-3 space-y-3 text-sm text-blue-100/80">
                  <p>{scenario.trigger.description}</p>
                  <p>
                    <strong className="font-semibold text-blue-100">
                      Cadence :
                    </strong>{" "}
                    {scenario.trigger.cadence}
                  </p>
                  <p>
                    <strong className="font-semibold text-blue-100">
                      Donnees critiques :
                    </strong>{" "}
                    {scenario.trigger.inputs.join(", ")}
                  </p>
                  <p>
                    <strong className="font-semibold text-blue-100">
                      Kick-off IA :
                    </strong>{" "}
                    {scenario.trigger.kickoff}
                  </p>
                </div>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-blue-200/60">
                  Quick wins
                </p>
                <ul className="mt-3 space-y-2 text-sm text-blue-50/90">
                  {scenario.quickWins.map((win) => (
                    <li key={win} className="rounded-lg bg-blue-200/10 p-3">
                      {win}
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <article className="rounded-2xl border border-white/10 bg-white/5">
              <table className="w-full table-auto divide-y divide-white/10 text-left text-sm text-blue-100/80">
                <thead className="text-xs uppercase tracking-[0.28em] text-blue-200/60">
                  <tr>
                    <th className="px-4 py-3">Ordre</th>
                    <th className="px-4 py-3">App & module</th>
                    <th className="px-4 py-3">Objective</th>
                    <th className="px-4 py-3">IA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {scenario.modules.map((module) => (
                    <tr key={module.order}>
                      <td className="px-4 py-3 font-semibold text-blue-50/90">
                        {module.order}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-blue-50">
                          {module.app}
                        </p>
                        <p className="text-xs uppercase tracking-[0.25em] text-blue-200/50">
                          {module.module}
                        </p>
                      </td>
                      <td className="px-4 py-3">{module.purpose}</td>
                      <td className="px-4 py-3 text-blue-100/70">
                        {module.aiAssist}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            <div className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-blue-200/60">
                  Automations cognitives
                </p>
                <div className="mt-3 space-y-4 text-sm text-blue-100/80">
                  {scenario.automations.map((automation) => (
                    <div
                      key={automation.title}
                      className="rounded-xl border border-blue-200/20 bg-blue-200/10 p-4"
                    >
                      <p className="font-semibold text-blue-50">
                        {automation.title}
                      </p>
                      <p className="mt-2 text-blue-100/80">
                        {automation.description}
                      </p>
                      <ul className="mt-3 space-y-1 text-xs text-blue-100/70">
                        {automation.aiTouchpoints.map((touchpoint) => (
                          <li key={touchpoint}>- {touchpoint}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-blue-200/60">
                  Produits data & monitoring
                </p>
                <div className="mt-3 space-y-4 text-sm text-blue-100/80">
                  {scenario.dataProducts.map((product) => (
                    <div
                      key={product.name}
                      className="rounded-xl border border-white/10 bg-white/10 p-4"
                    >
                      <p className="font-semibold text-blue-50">
                        {product.name}
                      </p>
                      <p className="mt-2 text-blue-100/80">
                        {product.purpose}
                      </p>
                      <p className="mt-3 text-xs text-blue-100/60">
                        Consommateurs: {product.consumers.join(", ")}
                      </p>
                    </div>
                  ))}
                  <div className="rounded-xl border border-blue-200/20 bg-blue-200/5 p-4 text-xs text-blue-100/70">
                    <p className="font-semibold uppercase tracking-[0.28em]">
                      KPIs
                    </p>
                    <p className="mt-2">
                      Lead: {scenario.monitoring.leadKpis.join(", ")}
                    </p>
                    <p className="mt-1">
                      Lag: {scenario.monitoring.lagKpis.join(", ")}
                    </p>
                    <p className="mt-1">
                      Qualite: {scenario.monitoring.qa.join(", ")}
                    </p>
                  </div>
                </div>
              </article>
            </div>

            <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
              <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-blue-200/60">
                  Plan d&apos;implementation
                </p>
                <div className="mt-3 space-y-4 text-sm text-blue-100/80">
                  {scenario.implementation.map((sprint) => (
                    <div
                      key={sprint.sprint}
                      className="rounded-xl border border-white/10 bg-white/10 p-4"
                    >
                      <p className="font-semibold text-blue-50">
                        {sprint.sprint}
                      </p>
                      <p className="mt-2 text-blue-100/80">{sprint.focus}</p>
                      <ul className="mt-3 space-y-1 text-xs text-blue-100/70">
                        {sprint.deliverables.map((deliverable) => (
                          <li key={deliverable}>- {deliverable}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-blue-200/60">
                  Garde-fous IA
                </p>
                <ul className="mt-3 space-y-3 text-sm text-blue-100/80">
                  {scenario.guardrails.map((guardrail) => (
                    <li
                      key={guardrail}
                      className="rounded-xl border border-red-300/30 bg-red-300/10 p-3 text-red-100/90"
                    >
                      {guardrail}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
