// js/modules/parser.js
import { appLogger } from '../logger.js';

/**
 * Einfache Keywords für die Auto-Kategorisierung.
 * Kann später in die Settings ausgelagert werden.
 */
const CATEGORY_RULES = {
    'Wohnen': ['miete', 'strom', 'stadtwerke', 'nebenkosten'],
    'Lebensmittel': ['rewe', 'aldi', 'lidl', 'edeka', 'dm', 'rossmann', 'kaufland'],
    'Mobilität': ['tankstelle', 'shell', 'aral', 'db vertrieb', 'uber', 'tier', 'parking'],
    'Versicherung': ['allianz', 'huk', 'tk', 'aok', 'versicherung'],
    'Gehalt': ['gehalt', 'lohn', 'bezüge', 'rentenversicherung bund'],
    'Sparen': ['trade republic', 'scalable', 'ing', 'depot'],
    'Abo': ['netflix', 'spotify', 'amazon prime', 'apple', 'youtube']
};

/**
 * Hilfsfunktion: Konvertiert deutschen Betrag (1.000,50) in Float
 */
const parseGermanNumber = (str) => {
    // Entferne Tausender-Punkte und ersetze Komma durch Punkt
    const cleanStr = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanStr);
};

/**
 * Analysiert den Text und bestimmt die Kategorie
 */
const categorizeTransaction = (text) => {
    const lowerText = text.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
        if (keywords.some(k => lowerText.includes(k))) {
            return category;
        }
    }
    return 'Sonstiges'; // Fallback
};

export const parseDKBStatement = async (file) => {
    appLogger.info(`Starte Parsing für: ${file.name}`);
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        appLogger.debug(`PDF geladen. Seitenanzahl: ${pdf.numPages}`);
        
        let fullText = "";
        const transactions = [];

        // Schleife durch alle Seiten
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // PDF Text-Items kommen oft zerstückelt. Wir joinen sie erstmal grob mit Leerzeichen.
            // DKB PDFs sind meist zeilenbasiert sauber genug für diesen Ansatz.
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + "\n";
        }

        // --- DKB LOGIK (RegEx Magie) ---
        // DKB Format ändert sich gelegentlich. Wir suchen nach dem Muster:
        // Datum (DD.MM.YY) ... Text ... Betrag (X,XX oder X.XXX,XX) und evtl Minuszeichen
        
        // Regex Erklärung:
        // (\d{2}\.\d{2}\.\d{2,4}) -> Datum Gruppe 1
        // .*?                     -> Irgendein Text (non-greedy)
        // ([-+]?[\d.]*,\d{2})     -> Betrag Gruppe 2 (optionales Vorzeichen, Punkte erlaubt, Komma, 2 Dezimalen)
        
        // Anmerkung: DKB hat oft "Wertstellung" und "Buchungstag". Wir nehmen das erste Datum.
        const dkbRegex = /(\d{2}\.\d{2}\.\d{2})\s+(?:(?!\d{2}\.\d{2}\.\d{2}).)*?\s+([-+]?[\d.]*,\d{2})/g;
        
        // Wir splitten den Text erst grob in Segmente, da Regex über den ganzen Text manchmal fehlschlägt
        // Ein "Segment" ist bei DKB oft visuell getrennt. Hier nutzen wir eine robustere "Match All" Strategie über den Gesamttext.
        
        let match;
        let count = 0;

        // Da der Text-Stream von PDF.js manchmal chaotisch ist, müssen wir etwas "fuzzy" suchen.
        // Wir extrahieren Datum und Betrag. Der Text dazwischen ist der Verwendungszweck.
        while ((match = dkbRegex.exec(fullText)) !== null) {
            const rawDate = match[1];
            const rawAmount = match[2];
            
            // Den Text drumherum extrahieren (etwas hacky, aber effektiv für PDFs ohne OCR)
            // Wir nehmen 50 Zeichen vor dem Betrag als Beschreibung
            const matchIndex = match.index;
            const rawDescription = fullText.substring(matchIndex + 10, matchIndex + match[0].length - rawAmount.length).trim();

            // Bereinigung
            const amount = parseGermanNumber(rawAmount);
            const category = categorizeTransaction(rawDescription);

            transactions.push({
                id: `tx_${Date.now()}_${count}`,
                date: rawDate,
                description: rawDescription.replace(/\s+/g, ' ').substring(0, 60), // Whitespace cleanen
                amount: amount,
                category: category,
                source: 'DKB_Import'
            });
            count++;
        }

        if (transactions.length === 0) {
            appLogger.warn('Parser lief durch, hat aber 0 Transaktionen gefunden. Format geändert?');
            throw new Error('Keine Transaktionen erkannt. Bitte prüfen, ob es ein DKB Kontoauszug ist.');
        }

        appLogger.info(`${count} Transaktionen erfolgreich extrahiert.`);
        return transactions;

    } catch (error) {
        appLogger.error('PDF Parsing fehlgeschlagen:', error);
        throw error;
    }
};
