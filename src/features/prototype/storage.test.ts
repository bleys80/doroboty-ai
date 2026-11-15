import { describe, expect, it } from "vitest";
import { initialState, STATE_VERSION } from "./model";
import { PUNKT_LABS_COMPANY_ID, PUNKT_LABS_RECRUITER_ID } from "./fact-card-trial";
import {
  MAX_IMPORT_BYTES,
  parseState,
  readState,
  saveState,
  serializeState,
  STORAGE_KEY,
} from "./storage";
function memory(raw: string | null = null) {
  const values = new Map(raw === null ? [] : [[STORAGE_KEY, raw]]);
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}
describe("browser persistence and recovery", () => {
  it("round-trips a complete valid scenario", () => {
    const storage = memory();
    const s = initialState();
    saveState(storage, s);
    expect(readState(storage).state).toEqual(s);
    expect(parseState(serializeState(s))).toEqual(s);
  });
  it("protects incompatible/corrupt original saves", () => {
    for (const raw of ["{", JSON.stringify({ ...initialState(), version: 99 })]) {
      const storage = memory(raw);
      const loaded = readState(storage);
      expect(loaded.blocked).toBe(true);
      expect(loaded.original).toBe(raw);
      expect(storage.getItem(STORAGE_KEY)).toBe(raw);
    }
  });
  it("does not fail startup when storage access is denied", () => {
    expect(readState(null).state.jobs.length).toBeGreaterThan(0);
    expect(
      readState({
        getItem() {
          throw new Error("Denied");
        },
        setItem() {},
      }).blocked,
    ).toBe(true);
  });
  it("reports quota/write failure without altering the original", () => {
    const old = "old";
    const storage = {
      getItem: () => old,
      setItem() {
        throw new Error("QuotaExceededError");
      },
    };
    expect(() => saveState(storage, initialState())).toThrow("Wyeksportuj");
    expect(storage.getItem()).toBe(old);
  });
  it("rejects invalid references and oversized files", () => {
    const s = initialState();
    s.saved = [{ candidateId: "missing", jobId: s.jobs[0].id }];
    expect(() => parseState(JSON.stringify(s))).toThrow("Dotychczasowy stan");
    expect(() => parseState(" ".repeat(MAX_IMPORT_BYTES + 1))).toThrow("za duży");
  });
  it("accepts legacy appearance preferences without changing scenario data", () => {
    const state = initialState();
    for (const theme of ["dark", "system", "light"]) {
      expect(parseState(JSON.stringify({ ...state, theme }))).toEqual(state);
    }
  });
  it("upgrades a version 1 save with its records and adds the Punkt Labs recruitment", () => {
    const current = initialState();
    const legacy = {
      ...structuredClone(current),
      factCardTrial: undefined,
      version: 1,
      companies: current.companies.filter((x) => x.id !== PUNKT_LABS_COMPANY_ID),
      jobs: current.jobs.filter((x) => x.companyId !== PUNKT_LABS_COMPANY_ID),
      people: current.people.filter((x) => x.id !== PUNKT_LABS_RECRUITER_ID),
      activePersonId: "candidate-anna",
    };
    legacy.people[0].bio = "Zachowany profil";
    const storage = memory(JSON.stringify(legacy));
    const loaded = readState(storage);
    expect(loaded.blocked).toBe(false);
    expect(loaded.state.version).toBe(STATE_VERSION);
    expect(loaded.state.activePersonId).toBe("candidate-anna");
    expect(loaded.state.people[0].bio).toBe("Zachowany profil");
    expect(loaded.state.applications).toEqual(current.applications);
    expect(loaded.state.people.map((x) => x.id)).toEqual(current.people.map((x) => x.id));
    expect(loaded.state.jobs).toHaveLength(current.jobs.length);
    expect(loaded.state.factCardTrial).toEqual(current.factCardTrial);
    // Reading never rewrites the original save; the next change stores version 2.
    expect(storage.getItem(STORAGE_KEY)).toBe(JSON.stringify(legacy));
  });
});
