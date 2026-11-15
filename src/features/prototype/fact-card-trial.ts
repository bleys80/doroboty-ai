import { z } from "zod";
import raw from "./data/punkt-labs-trial.json" with { type: "json" };

// Prepared course data (pub-003877). The fixture is read-only: only the recruiter's
// selections are stored in the scenario. The historical decision stays out of state
// and export and is read only by the result screen.
const requirementId = z.enum(["W1", "W2", "W3", "W4", "W5"]);
const fixtureSchema = z.object({
  meta: z.object({ publicationId: z.string(), note: z.string() }),
  company: z.object({
    name: z.string(),
    industry: z.string(),
    employeeBand: z.string(),
    city: z.string(),
  }),
  recruiter: z.object({ name: z.string(), headline: z.string() }),
  job: z.object({
    title: z.string(),
    category: z.literal("Build"),
    seniority: z.literal("mid"),
    workMode: z.string(),
    contract: z.string(),
    location: z.string(),
    salary: z.object({ min: z.number(), max: z.number(), basis: z.string() }),
    publishedAt: z.iso.date(),
    expiresAt: z.iso.date(),
    firstProject: z.string(),
    responsibility: z.string(),
    mandate: z.string(),
    team: z.string(),
    process: z.string(),
  }),
  requirements: z
    .array(z.object({ id: requirementId, label: z.string(), source: z.string() }))
    .length(5),
  listNotes: z.array(z.string()).min(1),
  task: z.string(),
  candidates: z
    .array(
      z.object({
        key: z.string().regex(/^K\d{2}$/),
        name: z.string(),
        seniority: z.enum(["junior", "mid", "senior"]),
        matchScore: z.number().int().min(0).max(100),
        summary: z.string(),
        projectArea: z.string(),
        projectAreaMatchesJob: z.boolean(),
        answer: z.string(),
        profile: z.string(),
        portfolio: z.string(),
        preferences: z.string(),
        factCard: z
          .array(
            z.object({
              requirement: requirementId,
              kind: z.enum(["potwierdza", "luka", "rozbieżność"]),
              text: z.string(),
              source: z.string(),
            }),
          )
          .min(2)
          .max(3),
        factCardPreparedBy: z.string(),
        historical: z.object({
          postInterviewDecision: z.enum(["continue", "reject"]),
          screeningDecision: z.string(),
          firstInterviewAt: z.iso.datetime({ offset: true }),
          sourceApplicationId: z.string(),
        }),
      }),
    )
    .length(10),
});

export const trialFixture = fixtureSchema.parse(raw);
export type TrialFixture = typeof trialFixture;
export type TrialCandidate = TrialFixture["candidates"][number];
export type TrialFact = TrialCandidate["factCard"][number];
export const trialViews = ["a", "b"] as const;
export type TrialView = (typeof trialViews)[number];
export const TRIAL_PICK_COUNT = 3;
/** Project area named in the job (first project). */
export const JOB_PROJECT_AREA = "wiedza zespołu";
export const trialViewLabels: Record<TrialView, string> = { a: "Dziś", b: "Karta faktów" };

export const PUNKT_LABS_COMPANY_ID = "10000000-0000-4000-8000-000000000004";
export const PUNKT_LABS_JOB_ID = "20000000-0000-4000-8000-000000003877";
export const PUNKT_LABS_RECRUITER_ID = "employer-punktlabs";
export const trialCandidateKeys = trialFixture.candidates.map((c) => c.key);

export function isTrialCompany(companyId: string | undefined) {
  return companyId === PUNKT_LABS_COMPANY_ID;
}
export function trialCandidate(key: string | undefined) {
  return trialFixture.candidates.find((c) => c.key === key);
}
export function trialRequirement(id: TrialFact["requirement"]) {
  return trialFixture.requirements.find((r) => r.id === id)!;
}
/** Requirements added after publication are labelled on the card. */
export function addedDuringRecruitment(id: TrialFact["requirement"]) {
  return trialRequirement(id).source.startsWith("dodane");
}
export function parseTrialView(value: string | null): TrialView {
  return value === "b" ? "b" : "a";
}
export function otherView(view: TrialView): TrialView {
  return view === "a" ? "b" : "a";
}

/** Historical post-interview outcome for the selected people. Use only on the result screen. */
export function trialOutcome(selected: readonly string[]) {
  const people = selected.map((key) => {
    const candidate = trialCandidate(key);
    if (!candidate) throw new Error("Nie znaleziono zgłoszenia.");
    return {
      key,
      name: candidate.name,
      matchScore: candidate.matchScore,
      decision: candidate.historical.postInterviewDecision,
      firstInterviewAt: candidate.historical.firstInterviewAt,
    };
  });
  return { people, continued: people.filter((p) => p.decision === "continue").length };
}
/** Reference point: how many continues the whole recruitment had and a random pick's mean. */
export function trialBaseline() {
  const total = trialFixture.candidates.length;
  const continued = trialFixture.candidates.filter(
    (c) => c.historical.postInterviewDecision === "continue",
  ).length;
  return { total, continued, randomExpected: (TRIAL_PICK_COUNT * continued) / total };
}

const job = trialFixture.job;
export const punktLabsCompany = {
  id: PUNKT_LABS_COMPANY_ID,
  slug: "punkt-labs",
  name: trialFixture.company.name,
  summary: `Oprogramowanie B2B. Zespół ${trialFixture.company.employeeBand.replace("-", "–")} osób.`,
  description: `${trialFixture.company.name} tworzy ${trialFixture.company.industry}. Zespół liczy ${trialFixture.company.employeeBand.replace("-", "–")} osób, siedziba: ${trialFixture.company.city}. Firma jest fikcyjna i powstała na potrzeby kursu.`,
  websiteUrl: "https://example.com/punkt-labs",
  location: trialFixture.company.city,
  sizeLabel: `${trialFixture.company.employeeBand.replace("-", "–")} osób`,
};
export const punktLabsJob = {
  id: PUNKT_LABS_JOB_ID,
  slug: "inzynier-ai-wyszukiwanie-w-wiedzy-zespolu",
  companyId: PUNKT_LABS_COMPANY_ID,
  title: job.title,
  summary: job.firstProject,
  description: [
    `Pierwszy projekt\n${job.firstProject}`,
    `Odpowiedzialność\n${job.responsibility}`,
    `Mandat\n${job.mandate}`,
    `Zespół\n${job.team}`,
    `Proces rekrutacji\n${job.process}`,
  ].join("\n\n"),
  category: "build" as const,
  function: "engineering" as const,
  remoteStatus: "onsite" as const,
  locations: [job.location],
  coordinates: { latitude: 52.4064, longitude: 16.9252 },
  seniority: "mid" as const,
  contract: "employment" as const,
  salaryMin: job.salary.min,
  salaryMax: job.salary.max,
  salaryCurrency: "PLN" as const,
  salaryPeriod: "month" as const,
  salaryKind: "gross" as const,
  // The historical publication ran 20.06–20.07.2026, so it is not open for new applications.
  publicationStatus: "expired" as const,
  publishedAt: `${job.publishedAt}T08:00:00.000Z`,
  expiryAt: `${job.expiresAt}T21:59:59.000Z`,
  verificationStatus: "employer_verified" as const,
};
export const punktLabsRecruiter = {
  id: PUNKT_LABS_RECRUITER_ID,
  role: "employer" as const,
  companyId: PUNKT_LABS_COMPANY_ID,
  name: trialFixture.recruiter.name,
  headline: trialFixture.recruiter.headline,
  bio: "",
  location: trialFixture.company.city,
  cv: "",
  exampleScore: 0,
  exampleSummary: "",
};
