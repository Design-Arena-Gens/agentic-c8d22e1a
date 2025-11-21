import { NextResponse } from "next/server";
import OpenAI from "openai";

type AutomationMaturity = "debutant" | "intermediaire" | "expert";

type GeneratePayload = {
  idea: string;
  context: string;
  dataSources: string;
  outputs: string;
  aiPersonality: string;
  tone: string;
  automationMaturity: AutomationMaturity;
  painPoints: string;
  aiAddons: string[];
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
  modules: {
    order: number;
    app: string;
    module: string;
    purpose: string;
    aiAssist: string;
  }[];
  automations: {
    title: string;
    description: string;
    aiTouchpoints: string[];
  }[];
  dataProducts: {
    name: string;
    purpose: string;
    consumers: string[];
  }[];
  monitoring: {
    leadKpis: string[];
    lagKpis: string[];
    qa: string[];
  };
  implementation: {
    sprint: string;
    focus: string;
    deliverables: string[];
  }[];
  guardrails: string[];
  quickWins: string[];
  meta: {
    provider: string;
    model?: string;
    createdAt: string;
  };
};

const defaultModels: Record<AutomationMaturity, string[]> = {
  debutant: ["gpt-4o-mini", "gpt-4o-mini-transcribe"],
  intermediaire: ["gpt-4.1-mini", "gpt-4o-mini-perform"],
  expert: ["gpt-4.1", "o1-mini"],
};

const connectorsCatalog: {
  matcher: RegExp;
  module: {
    app: string;
    module: string;
    purpose: string;
    aiAssist: string;
  };
}[] = [
  {
    matcher: /hubspot|crm|salesforce|pipedrive/i,
    module: {
      app: "HubSpot",
      module: "Create/Update Contact",
      purpose:
        "Synchroniser le lead enrichi et mettre a jour son statut de cycle de vie.",
      aiAssist:
        "Applique la priorisation IA et redige des notes contextuelles pour les sales.",
    },
  },
  {
    matcher: /notion|knowledge|wiki/i,
    module: {
      app: "Notion",
      module: "Append Page Content",
      purpose:
        "Documenter les apprentissages IA et les playbooks automatiques.",
      aiAssist:
        "Structure les decisions IA en sections et genere des resumer pour l'equipe.",
    },
  },
  {
    matcher: /slack|teams|discord/i,
    module: {
      app: "Slack",
      module: "Send Message",
      purpose:
        "Notifier les squads avec un recap dynamique et des recommandations IA.",
      aiAssist:
        "Gere le ton, la priorisation et ajoute des actions suggerees personnalisees.",
    },
  },
  {
    matcher: /airtable|spreadsheet|sheet|excel/i,
    module: {
      app: "Airtable",
      module: "Create Record",
      purpose: "Centraliser l'audit scenario et le suivi operations.",
      aiAssist: "Remplit des champs derives (score IA, categorie, risque).",
    },
  },
  {
    matcher: /zendesk|freshdesk|support|ticket/i,
    module: {
      app: "Zendesk",
      module: "Create Ticket",
      purpose: "Ouvrir un ticket enrichi pour les cas a haute complexite.",
      aiAssist:
        "Propose une reponse initiale et etiquettes automatiques pour l'agent.",
    },
  },
];

function parseList(value: string): string[] {
  return value
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function sanitizeText(text: string, fallback: string): string {
  return text?.trim().length ? text.trim() : fallback;
}

function extractJsonPayload(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    const lines = trimmed.split("\n").filter((line) => !line.startsWith("```"));
    return lines.join("\n");
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

function createFallbackScenario(payload: GeneratePayload): ScenarioResult {
  const sources = parseList(payload.dataSources);
  const outputs = parseList(payload.outputs);
  const now = new Date();
  const title =
    payload.idea.length > 80
      ? `${payload.idea.slice(0, 77)}...`
      : sanitizeText(
          payload.idea,
          "Scenario Make augmente par IA pour equipe revenue",
        );

  const selectedModules = connectorsCatalog
    .filter((connector) =>
      [...sources, payload.idea, payload.context].some((text) =>
        connector.matcher.test(text),
      ),
    )
    .map((connector) => connector.module);

  const modules = [
    {
      order: 1,
      app: "Webhook Make",
      module: "Custom Trigger",
      purpose:
        "Reception de l'evenement (formulaire, ticket, lead) avec tagging metadata.",
      aiAssist:
        "Micro-agent IA qui classe le flux et evale le niveau d'urgence.",
    },
    {
      order: 2,
      app: "OpenAI",
      module: "Responses API",
      purpose:
        "Extraction de donnees clefs, detection d'intents et enrichissement contextuel.",
      aiAssist:
        "Modere les donnees entrantes et applique le prompt blueprint selon le persona IA.",
    },
    ...selectedModules.map((module, index) => ({
      order: index + 3,
      ...module,
    })),
    {
      order: selectedModules.length + 3,
      app: "Scenario Router",
      module: "Make Tools",
      purpose:
        "Branche routeur pour orienter les flux (quick-win vs traitement expert).",
      aiAssist:
        "Score automatique et choix du chemin ideal selon le risque et la valeur.",
    },
    {
      order: selectedModules.length + 4,
      app: "OpenAI",
      module: "Text Generation",
      purpose:
        "Redaction de messages personalises, recommandations ou resumer.",
      aiAssist:
        "Respect du ton defini et injection de preuves/contenu depuis les sources.",
    },
  ];

  const automations = [
    {
      title: "Flow pilotage IA",
      description:
        "Pipeline de decision central qui evalue chaque evenement, attribue une priorite et propose l'action optimale.",
      aiTouchpoints: [
        "Evaluation multi-criteres (volume, valeur, SLA) par agent IA.",
        "Generation d'un plan d'action contextualise pour les humains.",
        "Monitoring auto avec reentrainement des prompts selon feedback.",
      ],
    },
    {
      title: "Boucle d'apprentissage continu",
      description:
        "Collecte des feedbacks (clics, reponses, issue) pour recalibrer la strategie IA et les filtres scenario.",
      aiTouchpoints: [
        "Regles de reinforcement learning legere sur les scores.",
        "Analyse sentiment et detection anomalies sur les outputs.",
      ],
    },
  ];

  const maturityModels = defaultModels[payload.automationMaturity];
  const guardrails: string[] = [
    "Validation humaine sur les actions critiques ou sensibles.",
    "Journalisation stricte des decisions IA dans Airtable/Notion pour audit.",
    "Tests de non-regression automatiques sur chaque mise a jour de prompt.",
  ];

  if (payload.aiAddons.includes("Detection d'anomalies")) {
    guardrails.push("Alerting Slack immediat si anomalie detectee sur les flux.");
  }

  const quickWins = [
    "Mettre en place un routeur Make avec scoring IA pour classer les evenements.",
    "Automatiser une notification riche dans Slack avec recommandations IA.",
    "Construire un tableau Airtable pour tracer les decisions et feedbacks.",
  ];

  if (outputs.some((item) => /dashboard|data/i.test(item))) {
    quickWins.push(
      "Publier un mini-dashboard Looker Studio base sur les KPIs IA generes.",
    );
  }

  const monitoring = {
    leadKpis: [
      "Temps de reaction moyen post-trigger",
      "Score IA moyen vs score reel",
      "Taux d'acceptation des recommandations IA",
    ],
    lagKpis: [
      "Impact revenu ou retention sur 30 jours",
      "Net Promoter Score post-automatisation",
      "Volume de re-travail manuel necessaire",
    ],
    qa: [
      "Comparaison reponses IA vs reponses humaines",
      "Pourcentage d'escalade humain benchmark",
      "Qualite des donnees en entree (completude)",
    ],
  };

  const implementation = [
    {
      sprint: "Semaine 1",
      focus: "Foundation & schema de donnees",
      deliverables: [
        "Modele de donnees commun et mapping des champs critiques",
        "Connexion des outils noyaux et tests de trigger",
        "Definition du persona IA et des prompts initiaux",
      ],
    },
    {
      sprint: "Semaine 2",
      focus: "Automations coeur & IA generative",
      deliverables: [
        "Construction du router et des chemins conditionnels",
        "Integration OpenAI pour enrichissement et generation contenu",
        "Mise en place des rapports d'usage et KPI lead",
      ],
    },
    {
      sprint: "Semaine 3",
      focus: "Garde-fous et industrialisation",
      deliverables: [
        "Jeux de tests QA + validation humaine",
        "Playbooks de reprise et guide de monitoring",
        "Deploy sur production et retro feedback",
      ],
    },
  ];

  const mission = `Construire un scenario Make intelligent capable d'orchestrer ${
    payload.idea.length ? payload.idea.toLowerCase() : "le flux cible"
  }, en capitalisant sur ${sources.length ? sources.join(", ") : "les outils existants"} pour produire ${
    outputs.length ? outputs.join(", ") : "des livrables operationnels"
  } avec un co-pilote IA fiable.`;

  return {
    title,
    mission,
    aiBrain: {
      orchestration: `On utilise un agent IA ${payload.aiPersonality.toLowerCase()} pour superviser chaque etape et ajuster le scenario.`,
      models: maturityModels,
      promptBlueprint: [
        "Analyse du contexte entrant (intent, tonalite, donnees cles).",
        "Generation de recommandations structurees selon les objectifs business.",
        "Auto-critique rapide pour valider la coherence et les garde-fous.",
      ],
      safeguards: guardrails,
    },
    trigger: {
      description: sanitizeText(
        payload.idea,
        "Reception d'un evenement business (lead, ticket, processus).",
      ),
      cadence:
        payload.automationMaturity === "expert"
          ? "Temps reel avec reprise toutes les 5 minutes en cas d'echec."
          : "Toutes les 15 minutes + execution manuelle si necessaire.",
      inputs:
        sources.length > 0
          ? sources
          : ["CRM", "Support", "Base de connaissances", "Produit"],
      kickoff: "Agent IA verifie volume, SLA et active le chemin adapte.",
    },
    modules,
    automations,
    dataProducts: [
      {
        name: "Hub IA decision centre",
        purpose:
          "Tableau de bord central des decisions IA, feedbacks humains et resultats business.",
        consumers: ["Equipe ops", "Direction", "Product manager"],
      },
      {
        name: "Journal prompts & resultats",
        purpose:
          "Historique des prompts deployes, versions, metric d'efficacite.",
        consumers: ["Architecte Make", "Equipe data", "Compliance"],
      },
    ],
    monitoring,
    implementation,
    guardrails,
    quickWins,
    meta: {
      provider: "architect-rules",
      createdAt: now.toISOString(),
    },
  };
}

function validatePayload(body: unknown): GeneratePayload {
  if (!body || typeof body !== "object") {
    throw new Error("Payload invalide");
  }

  const value = body as Partial<GeneratePayload>;

  if (!value.idea || typeof value.idea !== "string") {
    throw new Error("Merci de decrire l'idee ou le probleme.");
  }

  const automationMaturity: AutomationMaturity = ["debutant", "intermediaire", "expert"].includes(
    value.automationMaturity as AutomationMaturity,
  )
    ? (value.automationMaturity as AutomationMaturity)
    : "intermediaire";

  return {
    idea: value.idea,
    context: value.context ?? "",
    dataSources: value.dataSources ?? "",
    outputs: value.outputs ?? "",
    aiPersonality: value.aiPersonality ?? "Architecte IA fiable",
    tone: value.tone ?? "Professionnel et concret",
    automationMaturity,
    painPoints: value.painPoints ?? "",
    aiAddons: Array.isArray(value.aiAddons) ? value.aiAddons : [],
  };
}

export async function POST(request: Request) {
  try {
    const payload = validatePayload(await request.json());

    if (!process.env.OPENAI_API_KEY) {
      const fallbackResult = createFallbackScenario(payload);
      return NextResponse.json(fallbackResult);
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model:
        payload.automationMaturity === "expert" ? "gpt-4.1" : "gpt-4.1-mini",
      reasoning: payload.automationMaturity === "expert" ? { effort: "medium" } : undefined,
      input: [
        {
          role: "system",
          content:
            "Tu es un architecte Make senior. Tu produis des blueprint prets a etre implementes, concis, exhaustifs et en francais. Tu integres l'IA comme coeur du scenario. Tu reponds UNIQUEMENT avec un JSON valide qui respecte strictement le schema attendu, sans texte additionnel.",
        },
        {
          role: "user",
          content: JSON.stringify({
            brief: payload.idea,
            businessContext: payload.context,
            dataSources: parseList(payload.dataSources),
            outputs: parseList(payload.outputs),
            aiPersonality: payload.aiPersonality,
            tone: payload.tone,
            automationMaturity: payload.automationMaturity,
            painPoints: payload.painPoints,
            aiAddons: payload.aiAddons,
          }),
        },
      ],
      max_output_tokens: 1400,
    });

    const text = response.output_text;
    if (!text) {
      throw new Error("Reponse IA vide");
    }

    const parsed = JSON.parse(extractJsonPayload(text)) as ScenarioResult;

    return NextResponse.json({
      ...parsed,
      meta: {
        provider: "openai",
        model: response.model,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API][generate]", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Echec parsing reponse IA" },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: (error as Error).message ?? "Generation impossible" },
      { status: 400 },
    );
  }
}
