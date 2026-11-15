import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { AlertTriangle, Check, ChevronDown, CircleDashed } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { RecordSheet } from "@/components/record-sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { categoryLabels, seniorityLabels } from "@/features/jobs/presentation";
import { cn } from "@/lib/utils";
import {
  addedDuringRecruitment,
  JOB_PROJECT_AREA,
  otherView,
  parseTrialView,
  TRIAL_PICK_COUNT,
  trialBaseline,
  trialCandidate,
  trialFixture,
  trialOutcome,
  trialRequirement,
  trialViewLabels,
  trialViews,
  type TrialCandidate,
  type TrialFact,
  type TrialView,
} from "./fact-card-trial";
import { MatchScore } from "./match-score";
import { currentPerson } from "./model";
import { PageTitle, Notice } from "./shell";
import { usePrototype } from "./store";

const listPath = (view: TrialView) => `/app/kandydaci?widok=${view}`;
const resultPath = (view: TrialView) => `/app/kandydaci/wynik?widok=${view}`;
const viewName = (view: TrialView) => `Widok ${view.toUpperCase()} „${trialViewLabels[view]}”`;
const number = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 1 });
const interviewDate = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium" });
const job = trialFixture.job;
const amount = new Intl.NumberFormat("pl-PL");
const jobFacts = `${categoryLabels.build} · ${seniorityLabels.mid} · ${job.location} · ${job.workMode} · ${job.contract} · ${amount.format(job.salary.min)}–${amount.format(job.salary.max)} zł brutto`;

function useTrial() {
  const { state, run } = usePrototype();
  const [params] = useSearchParams();
  const view = parseTrialView(params.get("widok"));
  const companyId = currentPerson(state)?.companyId;
  const company = state.companies.find((x) => x.id === companyId);
  return { state, run, view, selection: state.factCardTrial[view], companyName: company?.name };
}

const kindDetails: Record<TrialFact["kind"], { label: string; Icon: typeof Check }> = {
  potwierdza: { label: "Potwierdza", Icon: Check },
  luka: { label: "Luka", Icon: CircleDashed },
  rozbieżność: { label: "Rozbieżność", Icon: AlertTriangle },
};

export function FactCard({ candidate }: { candidate: TrialCandidate }) {
  return (
    <section className="fact-card" aria-label={`Karta faktów: ${candidate.name}`}>
      <div className="fact-card-head">
        <span className="fact-card-title">Karta faktów</span>
        <span className="fact-card-origin">przygotowane ręcznie</span>
      </div>
      <p className="fact-card-area">
        Obszar projektu: <strong>{candidate.projectArea}</strong>
        <span aria-hidden="true"> · </span>
        <span data-matches={candidate.projectAreaMatchesJob}>
          {candidate.projectAreaMatchesJob
            ? "zgodny z ogłoszeniem"
            : `inny niż w ogłoszeniu („${JOB_PROJECT_AREA}”)`}
        </span>
      </p>
      <ul className="fact-list">
        {candidate.factCard.map((fact) => {
          const requirement = trialRequirement(fact.requirement);
          const { label, Icon } = kindDetails[fact.kind];
          return (
            <li key={fact.requirement} className="fact-item" data-kind={fact.kind}>
              <p className="fact-requirement">
                <span>
                  Wymaganie {requirement.id}: {requirement.label}
                </span>
                {addedDuringRecruitment(fact.requirement) && (
                  <span className="fact-added">dodane w trakcie rekrutacji</span>
                )}
              </p>
              <p className="fact-text">
                <span className="fact-kind">
                  <Icon aria-hidden="true" />
                  {label}
                </span>
                <span>{fact.text}</span>
              </p>
              <p className="fact-source">Źródło: {fact.source}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PickToggle({ candidate, view }: { candidate: TrialCandidate; view: TrialView }) {
  const { state, run } = usePrototype();
  const selection = state.factCardTrial[view];
  const checked = selection.selected.includes(candidate.key);
  const full = selection.selected.length >= TRIAL_PICK_COUNT;
  return (
    <label className="trial-pick" data-checked={checked || undefined}>
      <Checkbox
        checked={checked}
        disabled={selection.invitedAt !== null || (full && !checked)}
        onCheckedChange={() => run({ type: "trial_toggle", view, key: candidate.key })}
      />
      {/* The wrapping label names the checkbox; the name stays stable while toggling. */}
      <span>
        Wybierz na rozmowę <span className="sr-only">({candidate.name})</span>
      </span>
    </label>
  );
}

function ViewSwitch({ view }: { view: TrialView }) {
  return (
    <nav className="trial-switch" aria-label="Widok listy kandydatów">
      {trialViews.map((item) => (
        <Link
          key={item}
          to={listPath(item)}
          aria-current={item === view ? "page" : undefined}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "trial-switch-item")}
        >
          <b>{item.toUpperCase()}</b> {trialViewLabels[item]}
        </Link>
      ))}
    </nav>
  );
}

function JobDetails() {
  return (
    <details className="trial-job">
      <summary>
        Treść ogłoszenia i wymagania
        <ChevronDown aria-hidden="true" className="size-4" />
      </summary>
      <dl className="trial-job-facts">
        {(
          [
            ["Pierwszy projekt", job.firstProject],
            ["Odpowiedzialność", job.responsibility],
            ["Mandat", job.mandate],
            ["Zespół", job.team],
            ["Proces", job.process],
          ] as const
        ).map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <h3 className="trial-job-subtitle">Wymagania używane na kartach</h3>
      <ul className="trial-requirements">
        {trialFixture.requirements.map((r) => (
          <li key={r.id}>
            <strong>{r.id}</strong> {r.label} <span>({r.source})</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function TrialCandidates() {
  const { run, view, selection, companyName } = useTrial();
  const navigate = useNavigate();
  const done = selection.invitedAt !== null;
  const count = selection.selected.length;
  return (
    <>
      <PageTitle>Kandydaci</PageTitle>
      <section className="trial-brief" aria-labelledby="trial-task-title">
        <p className="trial-kicker">
          {companyName} · {job.title}
        </p>
        <p className="trial-job-line">{jobFacts}</p>
        <h2 id="trial-task-title">Twoje zadanie</h2>
        <p className="trial-task">{trialFixture.task}</p>
        <p className="trial-help">
          Kolejność zgłoszeń jest stała i nie zależy od Match Score. Zaznacz 3 osoby i kliknij
          „Zaproś na rozmowę”. Potem zobaczysz, z kim firma poszła dalej po pierwszej rozmowie.
          Każdy widok ma osobny wybór.
        </p>
        <JobDetails />
      </section>
      <ViewSwitch view={view} />
      {view === "b" && (
        <aside className="trial-notes" aria-labelledby="trial-notes-title">
          <h2 id="trial-notes-title">Uwagi do kart faktów</h2>
          <ul>
            {trialFixture.listNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </aside>
      )}
      {done && (
        <Notice>
          W tym widoku zaproszenia zostały już wysłane.{" "}
          <Link className="underline" to={resultPath(view)}>
            Zobacz wynik
          </Link>
        </Notice>
      )}
      <h2 className="sr-only">Zgłoszenia ({viewName(view)})</h2>
      <ol className="trial-list" data-view={view}>
        {trialFixture.candidates.map((candidate) => {
          const selected = selection.selected.includes(candidate.key);
          return (
            <li key={candidate.key}>
              <article
                className="trial-candidate"
                data-selected={selected || undefined}
                aria-labelledby={`trial-name-${candidate.key}`}
              >
                <div className="trial-candidate-head">
                  <div className="min-w-0">
                    <h3 id={`trial-name-${candidate.key}`} className="trial-candidate-name">
                      <Link to={`/app/kandydaci/${candidate.key}?widok=${view}`}>
                        {candidate.name}
                      </Link>
                    </h3>
                    <p className="record-caption">
                      {job.title} · {seniorityLabels[candidate.seniority]}
                    </p>
                  </div>
                  {view === "a" && <MatchScore score={candidate.matchScore} />}
                </div>
                {view === "a" ? (
                  <p className="trial-summary">{candidate.summary}</p>
                ) : (
                  <FactCard candidate={candidate} />
                )}
                <div className="trial-candidate-footer">
                  <PickToggle candidate={candidate} view={view} />
                  <div className="trial-candidate-meta">
                    {view === "b" && <MatchScore score={candidate.matchScore} />}
                    <Link
                      className="trial-detail-link"
                      to={`/app/kandydaci/${candidate.key}?widok=${view}`}
                      aria-label={`Zobacz zgłoszenie: ${candidate.name}`}
                    >
                      Zobacz zgłoszenie
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
      <div className="trial-selection-bar">
        <p role="status" aria-live="polite" className="trial-counter">
          Wybrano <strong>{count}</strong> z {TRIAL_PICK_COUNT}
          {count === TRIAL_PICK_COUNT && !done && (
            <span className="trial-counter-hint">
              Aby wybrać inną osobę, najpierw odznacz kogoś.
            </span>
          )}
        </p>
        {done ? (
          <Link className={buttonVariants()} to={resultPath(view)}>
            Zobacz wynik
          </Link>
        ) : (
          <Button
            disabled={count !== TRIAL_PICK_COUNT}
            onClick={() => {
              if (run({ type: "trial_invite", view })) navigate(resultPath(view));
            }}
          >
            Zaproś na rozmowę
          </Button>
        )}
      </div>
    </>
  );
}

export function TrialCandidateDetail({ candidateKey }: { candidateKey: string }) {
  const { view } = useTrial();
  const candidate = trialCandidate(candidateKey)!;
  return (
    <section className="trial-detail">
      <BackLink to={listPath(view)}>Wróć do listy kandydatów</BackLink>
      <header className="trial-detail-header">
        <p className="trial-kicker">{job.title}</p>
        <h1>{candidate.name}</h1>
        <div className="trial-detail-meta">
          <span>{seniorityLabels[candidate.seniority]}</span>
          <MatchScore score={candidate.matchScore} />
          <span className="record-caption">{viewName(view)}</span>
        </div>
      </header>
      {view === "b" && <FactCard candidate={candidate} />}
      <RecordSheet
        label="Materiały zgłoszenia"
        sections={[
          {
            value: "answer",
            label: "Odpowiedź",
            content: <ReadingText title="Odpowiedź kandydata" text={candidate.answer} />,
          },
          {
            value: "profile",
            label: "Profil",
            content: <ReadingText title="Profil" text={candidate.profile} />,
          },
          {
            value: "portfolio",
            label: "Portfolio",
            content: <ReadingText title="Portfolio" text={candidate.portfolio} />,
          },
          {
            value: "preferences",
            label: "Preferencje",
            content: <ReadingText title="Preferencje" text={candidate.preferences} />,
          },
        ]}
        footer={<PickToggle candidate={candidate} view={view} />}
      />
    </section>
  );
}
function ReadingText({ title, text }: { title: string; text: string }) {
  return (
    <>
      <h3>{title}</h3>
      <p>{text}</p>
    </>
  );
}

function decisionLabel(decision: "continue" | "reject") {
  return decision === "continue" ? "Kontynuacja po rozmowie" : "Odrzucenie po rozmowie";
}
function OutcomeList({ view }: { view: TrialView }) {
  const { state } = usePrototype();
  const outcome = trialOutcome(state.factCardTrial[view].selected);
  return (
    <ul className="trial-outcome-list">
      {outcome.people.map((person) => (
        <li key={person.key}>
          <div className="min-w-0">
            <strong>{person.name}</strong>
            <span className="record-caption">
              Pierwsza rozmowa: {interviewDate.format(new Date(person.firstInterviewAt))}
            </span>
          </div>
          <span className="trial-decision" data-decision={person.decision}>
            {person.decision === "continue" ? <Check aria-hidden="true" /> : null}
            {decisionLabel(person.decision)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function TrialResult() {
  const { state, run, view, selection } = useTrial();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  if (!selection.invitedAt) return <Navigate to={listPath(view)} replace />;
  const outcome = trialOutcome(selection.selected);
  const baseline = trialBaseline();
  const other = otherView(view);
  const bothDone = trialViews.every((v) => state.factCardTrial[v].invitedAt !== null);
  return (
    <>
      <PageTitle>Wynik zaproszeń</PageTitle>
      <section className="trial-result" aria-labelledby="trial-result-title">
        <p className="trial-kicker">{viewName(view)}</p>
        <h2 id="trial-result-title" className="trial-result-headline">
          Z {TRIAL_PICK_COUNT} osób wybranych przez Ciebie firma po pierwszej rozmowie poszła dalej
          z <strong>{outcome.continued}</strong>.
        </h2>
        <OutcomeList view={view} />
        <div className="trial-baseline">
          <p>
            W tej rekrutacji continue dostały {baseline.continued} z {baseline.total} osób.
          </p>
          <p>
            Losowy wybór {TRIAL_PICK_COUNT} osób trafiłby średnio{" "}
            {number.format(baseline.randomExpected)}.
          </p>
        </div>
      </section>
      {bothDone && (
        <section className="trial-compare-section" aria-labelledby="trial-compare-title">
          <h2 id="trial-compare-title">Widok A i widok B</h2>
          <div className="trial-compare">
            {trialViews.map((v) => (
              <article
                key={v}
                className="trial-compare-card"
                aria-labelledby={`trial-compare-${v}`}
              >
                <h3 id={`trial-compare-${v}`}>{viewName(v)}</h3>
                <p className="trial-compare-score">
                  <strong>{trialOutcome(state.factCardTrial[v].selected).continued}</strong> z{" "}
                  {TRIAL_PICK_COUNT} osób z kontynuacją po rozmowie
                </p>
                <OutcomeList view={v} />
              </article>
            ))}
          </div>
        </section>
      )}
      <p className="trial-disclaimer">
        To decyzja hiring managera tej firmy z VI-VII 2026, a nie ocena kandydata ani wynik AI.
      </p>
      <div className="trial-result-actions">
        {state.factCardTrial[other].invitedAt === null ? (
          <Link className={buttonVariants()} to={listPath(other)}>
            Spróbuj drugiego widoku
          </Link>
        ) : (
          <Link className={buttonVariants()} to={resultPath(other)}>
            Pokaż wynik: {viewName(other)}
          </Link>
        )}
        <Button variant="outline" onClick={() => setConfirming(true)}>
          Zacznij od nowa
        </Button>
      </div>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Zacząć od nowa?"
        description="Usuniemy wybory i wyniki z obu widoków. Ogłoszenie i zgłoszenia zostają bez zmian."
        label="Zacznij od nowa"
        pending={false}
        onConfirm={() => {
          if (run({ type: "trial_reset" })) {
            setConfirming(false);
            navigate(listPath("a"));
          }
        }}
      />
    </>
  );
}
