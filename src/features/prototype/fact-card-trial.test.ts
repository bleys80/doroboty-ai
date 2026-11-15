import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  PUNKT_LABS_COMPANY_ID,
  PUNKT_LABS_JOB_ID,
  PUNKT_LABS_RECRUITER_ID,
  trialBaseline,
  trialFixture,
  trialOutcome,
} from "./fact-card-trial";
import { initialState, publishedJobs, stateSchema, transition, type State } from "./model";
import { serializeState } from "./storage";
import copied from "./data/punkt-labs-trial.json" with { type: "json" };

const time = "2026-11-15T10:00:00.000Z";
const handoff = "docs/tasks/karta-faktow-dane.json";
function as(state: State, id: string) {
  return transition(state, { type: "select_person", id });
}
function pick(state: State, view: "a" | "b", keys: string[]) {
  return keys.reduce((s, key) => transition(s, { type: "trial_toggle", view, key }), state);
}

describe("Punkt Labs fact card recruitment", () => {
  it.skipIf(!existsSync(handoff))("uses the handed-over data file unchanged", () => {
    expect(copied).toEqual(JSON.parse(readFileSync(handoff, "utf8")));
  });
  it("has 10 applications with score ≥75 in a fixed order and 3 historical continues", () => {
    const scores = trialFixture.candidates.map((c) => c.matchScore);
    expect(scores).toHaveLength(10);
    expect(Math.min(...scores)).toBeGreaterThanOrEqual(75);
    expect(scores).not.toEqual([...scores].sort((a, b) => b - a));
    expect(trialBaseline()).toEqual({ total: 10, continued: 3, randomExpected: 0.9 });
    for (const c of trialFixture.candidates) {
      expect(c.factCard.length).toBeGreaterThanOrEqual(2);
      expect(c.factCard.length).toBeLessThanOrEqual(3);
    }
  });
  it("adds the company, an expired historical job and the recruiter without changing other personas", () => {
    const s = initialState();
    expect(s.companies.find((x) => x.id === PUNKT_LABS_COMPANY_ID)?.name).toBe("Punkt Labs");
    expect(s.people.find((x) => x.id === PUNKT_LABS_RECRUITER_ID)).toMatchObject({
      name: "Ewa Malinowska",
      role: "employer",
      companyId: PUNKT_LABS_COMPANY_ID,
    });
    expect(s.people.at(-1)?.role).toBe("operator");
    expect(s.jobs.find((x) => x.id === PUNKT_LABS_JOB_ID)).toMatchObject({
      category: "build",
      seniority: "mid",
      remoteStatus: "onsite",
      contract: "employment",
      salaryMin: 16500,
      salaryMax: 20500,
      publicationStatus: "expired",
    });
    expect(publishedJobs(s).some((x) => x.id === PUNKT_LABS_JOB_ID)).toBe(false);
    expect(s.people.filter((x) => x.id !== PUNKT_LABS_RECRUITER_ID).map((x) => x.id)).toEqual([
      "candidate-anna",
      "candidate-marek",
      "employer-brightlabs",
      "employer-northstar",
      "operator",
    ]);
  });
  it("lets only the Punkt Labs recruiter select at most 3 people per view", () => {
    const s = as(initialState(), PUNKT_LABS_RECRUITER_ID);
    for (const person of ["employer-brightlabs", "candidate-anna"])
      expect(() =>
        transition(as(s, person), { type: "trial_toggle", view: "a", key: "K01" }),
      ).toThrow();
    const three = pick(s, "a", ["K01", "K02", "K03"]);
    expect(three.factCardTrial.a.selected).toEqual(["K01", "K02", "K03"]);
    expect(three.factCardTrial.b.selected).toEqual([]);
    expect(() => transition(three, { type: "trial_toggle", view: "a", key: "K04" })).toThrow(
      "Możesz wybrać 3 osoby",
    );
    const changed = pick(three, "a", ["K02", "K04"]);
    expect(changed.factCardTrial.a.selected).toEqual(["K01", "K03", "K04"]);
    expect(() => transition(s, { type: "trial_toggle", view: "a", key: "K99" })).toThrow();
  });
  it("invites exactly 3 people, locks that view and keeps the other view independent", () => {
    let s = pick(as(initialState(), PUNKT_LABS_RECRUITER_ID), "a", ["K01", "K02"]);
    expect(() => transition(s, { type: "trial_invite", view: "a" }, time)).toThrow("dokładnie 3");
    s = transition(pick(s, "a", ["K04"]), { type: "trial_invite", view: "a" }, time);
    expect(s.factCardTrial.a.invitedAt).toBe(time);
    expect(() => transition(s, { type: "trial_toggle", view: "a", key: "K01" })).toThrow(
      "już wysłane",
    );
    expect(() => transition(s, { type: "trial_invite", view: "a" }, time)).toThrow();
    s = transition(pick(s, "b", ["K04", "K06", "K10"]), { type: "trial_invite", view: "b" }, time);
    expect(trialOutcome(s.factCardTrial.a.selected).continued).toBe(1);
    expect(trialOutcome(s.factCardTrial.b.selected).continued).toBe(3);
    expect(trialOutcome(["K01", "K02", "K03"]).continued).toBe(0);
    const reset = transition(s, { type: "trial_reset" });
    expect(reset.factCardTrial).toEqual(initialState().factCardTrial);
  });
  it("keeps historical decisions out of the stored and exported scenario", () => {
    const s = transition(
      pick(as(initialState(), PUNKT_LABS_RECRUITER_ID), "b", ["K04", "K06", "K10"]),
      { type: "trial_invite", view: "b" },
      time,
    );
    const exported = serializeState(s);
    for (const hidden of ["historical", "postInterviewDecision", "continue", "app-0"])
      expect(exported).not.toContain(hidden);
  });
  it("rejects imported selections with unknown people, duplicates or an incomplete invitation", () => {
    for (const selection of [
      { selected: ["K01", "K01"], invitedAt: null },
      { selected: ["X01"], invitedAt: null },
      { selected: ["K01", "K02"], invitedAt: time },
      { selected: ["K01", "K02", "K03", "K04"], invitedAt: null },
    ]) {
      const s = initialState();
      s.factCardTrial.a = selection;
      expect(stateSchema.safeParse(s).success).toBe(false);
    }
  });
});
