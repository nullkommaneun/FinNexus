# FinNexus 🚀

**Ihr 100% privates, Client-Side Finanz-Cockpit. Die "Single Source of Truth" für Ihr ganzheitliches Vermögen.**

FinNexus ist eine rein statische Web-Anwendung (gehostet auf GitHub Pages), die Ihnen hilft, ein vollständiges Bild Ihrer finanziellen Situation zu erhalten. Sie kombiniert manuelle Vermögenswerte (Vorsorge, Krypto, Broker) mit importierten Cashflow-Daten (DKB PDF-Upload) und externen Marktdaten.

**Das Wichtigste zuerst: Ihre Daten gehören Ihnen.** Alle eingegebenen Daten, Transaktionen und Salden werden **ausschließlich in Ihrem Browser** (`localStorage`) gespeichert. Es gibt kein Backend, keine Datenbank und keine Server-Logs.

---

## 🏛️ Projekt-Vision & Architektur

Ziel ist ein robustes Dashboard, das ohne serverseitige Logik funktioniert. Dies wird durch eine 100% Client-Side-Architektur erreicht.

* **Plattform:** Statisches Hosting (GitHub Pages)
* **Technologie:** Vanilla JavaScript (ES6+), TailwindCSS (CDN)
* **Datenbank:** `localStorage` (Browser-Speicher)
* **Kern-Prinzip:** Privacy-First. Keine Datenerfassung.

---

## ✨ Kern-Features

FinNexus ist in fünf Hauptsektionen (Module) unterteilt:

1.  **📈 Gesamtvermögen ("Big Number")**
    * Summe aller manuellen Assets (Vorsorge, Krypto etc.) und liquiden Mittel (letzter PDF-Import).
    * Inklusive prozentualer Veränderung zum Vormonat.

2.  **💸 Monats-Check (Cashflow)**
    * Robuster, Client-seitiger PDF-Parser für DKB-Kontoauszüge.
    * Regelbasierte Engine zur automatischen Kategorisierung von Transaktionen (Wohnen, Investment, Konsum).
    * Analyse von Einnahmen vs. Konsum vs. Investitionen.

3.  **📊 Vermögensbilanz (Assets)**
    * Visuelle Aufteilung des Gesamtvermögens (z.B. Donut-Chart).
    * CRUD-Schnittstelle zur manuellen Verwaltung Ihrer Assets (z.B. *Signal Iduna Rente*, *RaspiBlitz Bitcoin*).

4.  **🧭 Navigator (Intelligente Aktionen)**
    * Ein Logik-Modul, das Ihre Daten analysiert und proaktiv Hinweise gibt.
    * *Beispiele:* "Abo-Alarm: 'zock box' wurde 2x abgebucht." oder "Update-Reminder: Neue Sparrate an 'Signal Iduna' erkannt. Bitte Asset-Wert aktualisieren."

5.  **🌍 Markt-Radar (Externer Kontext)**
    * Autonom abgerufene Marktdaten (via CoinGecko, etc.) für den globalen Kontext.
    * Zeigt z.B. BTC-Preis, S&P 500 und Inflationsdaten (VPI).

---

## 🔒 Datenschutz & Sicherheit (Das Fundament)

Dieses Projekt behandelt sensible Finanzdaten. Sicherheit und Transparenz sind daher nicht-verhandelbar.

* **Kein Server:** Die App kommuniziert *niemals* mit einem Backend, um Ihre Finanzdaten zu speichern.
* **Lokale Speicherung:** Alle Ihre Assets und Transaktionen verlassen Ihren Browser nicht. `localStorage` ist der einzige Speicherort.
* **Vorsicht:** Da die Daten nur lokal gespeichert werden, ist ein Löschen des Browser-Caches (Cache oder "Website-Daten") gleichbedeutend mit dem Löschen aller Ihrer Daten. (Zukünftige Versionen können einen JSON-Export/Import anbieten).

---

## 🛠️ Einzigartige technische Features (NFRs)

Um Vertrauen und Nutzbarkeit (besonders auf Mobilgeräten) zu gewährleisten, wurden zwei kritische Non-Functional Requirements (NFRs) umgesetzt:

1.  **App-Interner Debugger:**
    * Da mobile Browser keine F12-Konsole haben, verfügt FinNexus über ein eigenes, einklappbares Debug-Panel.
    * Alle kritischen Operationen (PDF-Parsing, API-Aufrufe) loggen ihren Status hier.

2.  **Finanz-Validierungs-Modul (Audit-Tab):**
    * Ein "Audit"-Tab, der alle Kernberechnungen (z.B. die Summe des Gesamtvermögens) transparent und nachvollziehbar aufschlüsselt.
    * Zeigt genau, wie die "Big Number" zustande kommt, um 100%iges Vertrauen in die Zahlen zu schaffen.

---

## 🚀 Getting Started (Demo)

Da dies ein GitHub Pages-Projekt ist, können Sie die Live-Version direkt nutzen:

[https://<Ihr-GitHub-Name>.github.io/FinNexus/](https://<Ihr-GitHub-Name>.github.io/FinNexus/)
