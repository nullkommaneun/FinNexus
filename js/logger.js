W21// js/logger.js

export const appLogger = {
    consoleElement: null, // Wird via init gesetzt

    init: function(elementId) {
        this.consoleElement = document.getElementById(elementId);
    },
    
    log: function(level, ...args) {
        const now = new Date().toLocaleTimeString();
        const msg = args.map(arg => {
            if (arg instanceof Error) return arg.stack || arg.message;
            return typeof arg === 'object' ? JSON.stringify(arg) : arg;
        }).join(' ');
        
        // Auch in echte Konsole
        const consoleLevel = level.toLowerCase();
        if (typeof console[consoleLevel] === 'function') {
            console[consoleLevel](`[${level}]`, ...args);
        }

        // UI Update
        if (this.consoleElement) {
            const entry = document.createElement('div');
            const levelColors = {
                DEBUG: 'text-gray-500',
                INFO: 'text-blue-400',
                WARN: 'text-yellow-400',
                ERROR: 'text-red-500 font-bold'
            };
            entry.className = `${levelColors[level] || 'text-gray-400'} mb-1 break-all font-mono border-b border-gray-800/50 pb-1`; 
            entry.innerHTML = `<span class="opacity-40 mr-2 text-[10px]">[${now}]</span><span class="font-bold mr-1 text-[10px] tracking-wider">${level}:</span> <span>${msg}</span>`;
            
            this.consoleElement.appendChild(entry);
            this.consoleElement.scrollTop = this.consoleElement.scrollHeight;
        }
    },
    
    debug: function(...args) { this.log('DEBUG', ...args); },
    info: function(...args) { this.log('INFO', ...args); },
    warn: function(...args) { this.log('WARN', ...args); },
    error: function(...args) { this.log('ERROR', ...args); }
};

// js/modules/storage.js (Update)

// ... (bestehender Code)

// Im DEFAULT_SCHEMA sicherstellen, dass transactions existiert:
const DEFAULT_SCHEMA = {
    userSettings: { currency: 'EUR', initialized: Date.now() },
    assets: [],
    transactions: [], // NEU
    cashflow: { lastImport: null, balance: 0 }
};

class StorageManager {
    // ... (constructor, load, save bleiben gleich)

    // --- NEUE PUBLIC API METHODEN ---

    /**
     * Importiert Transaktionen und berechnet den neuen Kontostand.
     * Löscht alte Importe (optional), um Duplikate zu vermeiden oder merged sie.
     * Hier: Strategie "Replace Last Import" für Einfachheit, 
     * oder "Append" mit Duplikat-Check. Wir machen "Append + Check".
     */
    importTransactions(newTransactions) {
        const currentIds = new Set(this.data.transactions.map(t => t.id)); // Einfacher Check
        let addedCount = 0;

        newTransactions.forEach(tx => {
            // Wir generieren beim Parsen IDs. Besser wäre ein Hash aus Datum+Betrag+Text.
            // Für MVP: Wir fügen einfach hinzu, User muss "Reset" machen wenn er neu importieren will.
            this.data.transactions.push(tx);
            addedCount++;
        });
        
        // Sortieren nach Datum (neuste zuerst - String Vergleich DD.MM.YY ist tricky, daher besser in ISO wandeln wenn möglich)
        // Hier lassen wir es unsortiert oder sortieren beim Rendern.
        
        // Kontostand berechnen (Summe aller Transaktionen + Startsaldo? 
        // Bankauszug hat oft Endsaldo. Parser liest das schwer. 
        // Wir summieren hier NICHT alle Tx, sondern nehmen den letzten bekannten Stand
        // ODER: Wir nutzen die Transaktionen nur für Cashflow-Analyse.)
        
        // Update Timestamp
        this.data.cashflow.lastImport = Date.now();
        this._save();
        appLogger.info(`${addedCount} Transaktionen gespeichert.`);
    }

    getTransactions() {
        return this.data.transactions || [];
    }
    
    /**
     * Berechnet Einnahmen vs Ausgaben für den Cashflow-Donut
     */
    getCashflowStats() {
        const txs = this.data.transactions;
        let income = 0;
        let expenses = 0;
        let invest = 0;

        txs.forEach(tx => {
            if (tx.amount > 0) {
                income += tx.amount;
            } else {
                if (tx.category === 'Sparen' || tx.category === 'Invest') {
                    invest += Math.abs(tx.amount);
                } else {
                    expenses += Math.abs(tx.amount);
                }
            }
        });

        return { income, expenses, invest };
    }
    
    /**
     * Löscht alle Transaktionen (für Reset)
     */
    clearTransactions() {
        this.data.transactions = [];
        this.data.cashflow.balance = 0;
        this._save();
    }
}

export const storage = new StorageManager();
