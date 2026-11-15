import { Component, type ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { STORAGE_KEY } from "./storage";

// Last-resort screen for unexpected render errors. It must not depend on the
// prototype state or router, because either of them may be what failed.
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <AppErrorFallback /> : this.props.children;
  }
}

function readSavedScenario() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function downloadSavedScenario(raw: string) {
  const url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "doroboty-kopia-po-bledzie.json";
  link.click();
  URL.revokeObjectURL(url);
}

export function AppErrorFallback() {
  const saved = readSavedScenario();
  return (
    <main className="prototype-section mx-auto max-w-3xl px-5" role="alert">
      <h1>Coś poszło nie tak</h1>
      <div className="mt-5 space-y-4">
        <p>
          Prototyp napotkał nieoczekiwany błąd i nie może wyświetlić tej strony. Twoje zmiany
          zapisane w tej przeglądarce nie zostały usunięte.
        </p>
        <p>
          Spróbuj odświeżyć stronę albo wrócić na stronę główną. Jeśli błąd się powtarza, zgłoś go
          osobie prowadzącej test i opisz, co działo się tuż przed nim. Nie wysyłaj prawdziwych
          danych osobowych.
        </p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className={buttonVariants()} onClick={() => window.location.reload()}>
          Odśwież stronę
        </button>
        <a
          className={buttonVariants({ variant: "outline" })}
          href="#/"
          onClick={(event) => {
            event.preventDefault();
            window.location.hash = "#/";
            window.location.reload();
          }}
        >
          Wróć na stronę główną
        </a>
        {saved && (
          <button
            type="button"
            className={buttonVariants({ variant: "outline" })}
            onClick={() => downloadSavedScenario(saved)}
          >
            Pobierz kopię danych
          </button>
        )}
      </div>
    </main>
  );
}
