# Brief: karta faktów (P1) w widoku pracodawcy - doroboty-ai

**Data:** 2026-11-15 · **Wersja:** 1
**Projekt w vaulcie:** `3-Projects/doroboty-ai/` · **Folder z kodem:** `D:\Claude Code\code\doroboty.ai\aplikacja\` (fork https://github.com/bleys80/doroboty-ai; kopia briefu jako `docs/tasks/karta-faktow.md`)

<!-- Ten plik jest przekazaniem z vaulta do projektu z kodem. Ma wystarczyć sam:
     sesja w folderze z kodem nie zagląda do vaulta. Zmieniasz go tylko w vaulcie
     i kopiujesz ponownie, podbijając wersję. -->

## Po co to budujemy

DoRoboty.ai to fikcyjny polski portal pracy dla osób pracujących z AI (case kursowy AIPH 3). *Cel CEO:* ponowne zakupy pracodawców z 30% do 60% w 90 dni. To cel, nie wynik.

- *Obserwacja (dane case'u, `applications.csv`):* od VI 2026 Match Score przestał iść w parze z decyzją po rozmowie. Zgłoszenia z wynikiem 90+ dostawały continue w 58,0% przypadków w I-V 2026 i w 17,9% w VI 2026. W tym czasie liczba aplikacji podwoiła się, a liczba decyzji continue stała w miejscu.
- *Deklaracje rekruterów (wywiady F1, F4):* „Przy nazwisku muszę jednak widzieć, co za nią stoi” (F4). „Co kandydat zrobił sam, przy jakim projekcie, jaki był wynik” (F1).
- *Potrzeba (OP2):* „Dostaję wiele zgłoszeń z wysokim wynikiem dopasowania i nie mam jak wskazać, które naprawdę są warte rozmowy”.
- *Hipoteza (P1):* jeśli rekruter zamiast samej liczby zobaczy 2-3 konkretne fakty z profilu i odpowiedzi, przypięte do wymagań ogłoszenia, częściej wybierze na rozmowę osoby, z którymi firma potem idzie dalej.

Prototyp jest materiałem do testu T1: czy karta zmienia wybór rekrutera. Nie sprawdza, czy firma potem kupi kolejne ogłoszenie.

## Dla kogo

Rekruter w firmie po pierwszym zakupie, który ma kilkanaście zgłoszeń z wysokim wynikiem i musi wybrać, z kim rozmawiać. W prototypie gra go uczestnik testu (np. osoba z kursu).

Ma wykonać zadanie: **„Z 10 zgłoszeń z wynikiem ≥75 wybierz 3 osoby, które zaprosisz na rozmowę”**, raz w widoku A, raz w widoku B. Na końcu widzi, ile wybranych osób firma faktycznie przepuściła dalej po rozmowie.

## Co ma powstać

Ścieżka w istniejącym panelu pracodawcy. Zacznij od przeglądu obecnych ekranów, danych i komponentów (`/#/app/kandydaci`, `/#/app/kandydaci/:id`, `MatchScore`, `RecordSheet`, persony w `people.json`, model w `model.ts`) i wykorzystaj je, zanim dodasz nowe.

1. **Nowa rekrutacja w scenariuszu.** Firma „Punkt Labs” z nową personą rekrutera (imię do wymyślenia) i jedno ogłoszenie: Build, mid, Poznań, biuro, UoP, 16 500-20 500 zł brutto. Treść z sekcji „Ogłoszenie” niżej. Istniejące persony (Anna, Marek, BrightLabs, Northstar) i ich ścieżki zostają bez zmian. Dlatego osobna firma, a nie nowa oferta BrightLabs.
2. **10 zgłoszeń** do tego ogłoszenia z pliku `karta-faktow-dane.json`, przygotowanego w vaulcie. Każde ma wymyślone imię, odpowiedź kandydata, profil, portfolio, Match Score, kartę faktów i historyczną decyzję po rozmowie. Decyzja jest ukryta przed użytkownikiem aż do ekranu wyniku.
3. **Lista kandydatów z przełącznikiem widoku:**
   - **A, „Dziś”:** jak obecna lista: imię, Match Score w kolorze, krótkie podsumowanie, link do szczegółów.
   - **B, „Karta faktów”:** przy każdej osobie 2-3 fakty. Każdy fakt to wymaganie z ogłoszenia, a pod nim zdanie z profilu lub odpowiedzi, które go dotyczy albo pokazuje lukę (np. „Wymaganie: własny komponent i ewaluacja → *przygotował testy ewaluacji indeksu; API rozwijała inna osoba*”). Score jest widoczny, ale nie na pierwszym planie.
   - Kolejność kandydatów taka sama w obu widokach, nieposortowana po score.
4. **Wybór 3 osób.** Zaznaczanie przy kandydacie, licznik „wybrano X z 3”, przycisk „Zaproś na rozmowę” aktywny dopiero przy 3. Wybór zapisuje się osobno dla A i B.
5. **Ekran wyniku** po zaproszeniu:
   - „Z 3 osób, które wybrałeś, firma po pierwszej rozmowie poszła dalej z X”. Lista 3 wybranych z decyzją (continue / odrzucenie).
   - Punkt odniesienia: „W tej rekrutacji continue dostały 3 z 10 osób”. Losowy wybór 3 osób trafiłby średnio 0,9.
   - Jeśli zrobiono oba widoki: zestawienie A vs B obok siebie.
   - Stały podpis: „To decyzja hiring managera tej firmy z VI-VII 2026, a nie ocena kandydata ani wynik AI”.
   - Akcje: „Spróbuj drugiego widoku” i „Zacznij od nowa” (reset wyborów).
6. **Wejście w scenariusz.** Wybór persony rekrutera Punkt Labs w obecnym pickerze prowadzi do tej rekrutacji. Krótka instrukcja zadania nad listą.

## Treść i fakty, których wolno użyć

Źródło: pliki case'u `publications.csv` i `applications.csv` (dane zamknięte 2026-09-30), publikacja `pub-003877`.

**Ogłoszenie (pub-003877, 20.06-20.07.2026, firma 1-20 osób, oprogramowanie B2B):**
- Pierwszy projekt: uporządkowanie danych wejściowych i porównanie dwóch sposobów wyszukiwania w obszarze „wiedza zespołu”.
- Odpowiedzialność: własny komponent, ewaluacja i utrzymanie. Pozostałe API rozwija drugi inżynier.
- Mandat: wybór sposobu implementacji w ramach istniejącej usługi; zmiany architektury uzgadniane z zespołem.
- Zespół: osoba od operacji i inżynier; brak osobnego działu AI.
- Oczekiwania: rozmowa o dotychczasowej pracy, współpraca, wyjaśnianie decyzji, dobór sposobu pracy do problemu. Nie liczba kursów i narzędzi.
- Proces: rozmowa z rekruterem, potem omówienie projektu z managerem.

**Kryteria rekrutera zmieniły się w trakcie:**
- do 27.06: „Własny wkład w podobne zadanie i możliwość omówienia decyzji”; uzgodnienia między działami prowadzi właściciel procesu;
- od 27.06: „Samodzielne prowadzenie zadania również między zespołami i odpowiedzialność za utrzymanie”, plan utrzymania, wdrożenie w więcej niż jednym zespole.

Wszystkie 10 rozmów hiring manager prowadził według wersji z 27.06. **Decyzja Błażeja (2026-11-15):** fakty na karcie przypinamy do wymagań z ogłoszenia oraz jednego wymagania dodanego 27.06, oznaczonego na karcie jako „dodane w trakcie rekrutacji”.

**Wymagania na karcie:**
- **W1, własny komponent i ewaluacja:** co kandydat zbudował sam i jak sprawdzał, czy działa (ogłoszenie).
- **W2, utrzymanie:** odpowiedzialność za działanie po wdrożeniu (ogłoszenie).
- **W3, wyjaśnianie decyzji i współpraca:** umie omówić swoje decyzje i podział pracy z innymi (ogłoszenie).
- **W4, prowadzenie między zespołami:** samodzielne uzgodnienia z innymi działami, wdrożenie w więcej niż jednym zespole (dodane w trakcie rekrutacji, 27.06).
- **W5, warunki:** biuro w Poznaniu, UoP (ogłoszenie). Na karcie tylko przy rozbieżności z preferencjami kandydata.

Każda karta ma 2-3 fakty: dla tych wymagań, których dotyczy tekst kandydata. Rodzaj faktu: `potwierdza`, `luka` (np. „brak informacji o utrzymaniu”) albo `rozbieżność`. Na karcie jest też obszar projektu kandydata i informacja, czy zgadza się z obszarem z ogłoszenia („wiedza zespołu”).

Nad listą w widoku B są dwie uwagi z pliku danych (`listNotes`):
- W3 nie rozróżnia kandydatów, bo wszyscy piszą to samo zdanie.
- W4 nie opisuje nikt z 10 osób.

**Plik danych:** `karta-faktow-dane.json` (w vaulcie `decisions/2026-11-15-karta-faktow-dane.json`) zawiera: firmę, rekruterkę Ewę Malinowską, ogłoszenie, wymagania W1-W5, zadanie i 10 kandydatów. Przy każdym kandydacie są: imię, score, podsumowanie do widoku A, teksty, karta faktów i pole `historical` z decyzją po rozmowie, ukrywane do ekranu wyniku.

**Zgłoszenia:** 10 z 38 zgłoszeń do publikacji, z wynikiem ≥75 (75,6-92,5) i zapisaną decyzją po rozmowie. 3 z nich dostały continue. Wszystkie 10 osób pisało odpowiedź z asystentem.

**Match Score (`dr-match-1`):** LLM ocenia zgodność tekstów (ogłoszenie, profil, odpowiedź) w skali 0-100. Wagi: umiejętności 35%, zadania 30%, doświadczenie 20%, warunki 15%. To nie prawdopodobieństwo zatrudnienia ani test umiejętności.

**Słownik:** aplikacja = zgłoszenie kandydata; kontynuacja (continue) = decyzja po pierwszej rozmowie, nie zatrudnienie; zakup = płatna transakcja.

**Nie wolno dopisywać:** prawdziwych nazwisk, cen, opinii klientów, ocen, logotypów ani liczb spoza tej sekcji. Imiona kandydatów i rekrutera są wymyślone.

## Czego celowo nie robimy

- **Bez prawdziwego AI.** Karty faktów przygotowano ręcznie w vaulcie z tekstów CSV, bez wiedzy o decyzji po rozmowie. Prototyp tego nie ukrywa: przy karcie jest dyskretna etykieta „przygotowane ręcznie”. Nie przypisujemy kartom trafności modelu.
- Bez backendu i synchronizacji między przeglądarkami. Stan w obecnym localStorage scenariusza.
- Bez sortowania i rankingu po score, bez rekomendacji „zaproś tę osobę”.
- Bez zmian w ścieżce kandydata i w istniejących personach.
- Jedna rekrutacja dla obu widoków. Ci sami kandydaci w A i B to uproszczenie: kto zrobi oba widoki, pamięta teksty. Do właściwego T1 potrzebna będzie druga rekrutacja.

## Kierunek wizualny i wzorce

- Design system Poster People z repo (`GUI.md`, `tokens.css`, `docs/design-system/`): ink contours, papierowe powierzchnie, różowe akcje, Geist Serif w nagłówkach. Nowe elementy (karta faktów, przełącznik, licznik wyboru, ekran wyniku) budowane z istniejących prymitywów Base UI i dopasowane do obecnych list i `RecordSheet`.
- `MatchScore` bez zmian (kolory z FEATURES OPS-07).
- Responsywnie: lista i karta czytelne na 390 px.

## Kiedy gotowe i jak sprawdzimy

**Prototyp gotowy, gdy:**
- persona rekrutera Punkt Labs → lista → widok A → wybór 3 → zaproszenie → ekran wyniku przechodzi do końca; to samo dla widoku B, potem zestawienie A vs B i reset;
- dane na ekranie wyniku zgadzają się z `karta-faktow-dane.json` (3 continue na 10);
- dotychczasowe ścieżki działają: Anna i Marek aplikują, BrightLabs przechodzi decyzje rekrutacyjne, import/eksport/reset scenariusza;
- `npm run check` przechodzi; nowe zachowania mają testy (model i e2e ścieżki).

**Po pokazaniu ludziom (T1, poza prototypem):** liczba wybranych osób z continue / 3, osobno dla A i B; czas wyboru; na co rekruter wskazuje jako powód. Próg sukcesu ustala Błażej - na razie brak.

## Co wraca do vaulta

Commit i link do forka, wersja briefu, screenshoty (A, B, wybór, wynik), lista elementów symulowanych, wnioski z przejścia scenariusza i ewentualne zmiany zakresu. Trafiają do `log.md`, nowej notatki w `prototypes/` i szkicu posta na Circle (publikuje Błażej).
