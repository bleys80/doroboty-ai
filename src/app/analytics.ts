import posthog from "posthog-js";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Starts PostHog product analytics (Pageview + Autocapture).
 * Runs only when a public project key is set at build time (VITE_POSTHOG_KEY)
 * and the page is not served from a local host, so dev, unit and e2e runs send nothing.
 */
export function initAnalytics(): void {
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (!key || LOCAL_HOSTS.has(window.location.hostname)) return;

  posthog.init(key, {
    api_host:
      (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? "https://eu.i.posthog.com",
    defaults: "2026-08-30",
    // HashRouter: routes live in location.hash, so count a pageview on hash and query changes too.
    capture_pageview: { path: true, search: true, hash: true },
    disable_capture_url_hashes: false,
    // Clicks and submits on links, buttons and forms only - no form fields, no change events.
    autocapture: {
      dom_event_allowlist: ["click", "submit"],
      element_allowlist: ["a", "button", "form"],
    },
    mask_personal_data_properties: true,
    person_profiles: "identified_only",
    disable_session_recording: true,
  });
}
