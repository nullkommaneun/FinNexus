// js/modules/storage.js
import { appLogger } from '../logger.js';

const DB_KEY = 'finnexus_data_v1';

// Initiales Schema, falls noch keine Daten existieren
const DEFAULT_SCHEMA = {
    userSettings: {
        currency: 'EUR',
        initialized: Date.now()
    },
    assets: [], // { id, name, category, value, updatedAt }
    cashflow: {
        lastImport: null,
        balance: 0
    }
};

class StorageManager {
    constructor() {
        this.data = this._load();
    }

    /**
     * Lädt Daten aus dem LocalStorage oder initialisiert sie.
     */
    _load() {
        try {
            const raw = localStorage.getItem(DB_KEY);
            if (!raw) {
                appLogger.info('Storage: Keine Daten gefunden. Initialisiere neue DB.');
                return { ...DEFAULT_SCHEMA };
            }
            return JSON.parse(raw);
        } catch (e) {
            appLogger.error('Storage: FATAL ERROR beim Laden der Daten (JSON Corrupt?)', e);
            return { ...DEFAULT_SCHEMA };
        }
    }

    /**
     * Speichert den aktuellen State in den LocalStorage.
     */
    _save() {
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(this.data));
            appLogger.debug('Storage: Daten erfolgreich persistiert.');
        } catch (e) {
            appLogger.error('Storage: Konnte Daten nicht speichern (Quota exceeded?)', e);
            alert('Kritischer Fehler: Speicher voll!');
        }
    }

    // --- Public API ---

    getAssets() {
        return this.data.assets || [];
    }

    addAsset(asset) {
        this.data.assets.push(asset);
        this._save();
        appLogger.info(`Asset hinzugefügt: ${asset.name}`);
    }

    removeAsset(id) {
        this.data.assets = this.data.assets.filter(a => a.id !== id);
        this._save();
        appLogger.info(`Asset gelöscht: ID ${id}`);
    }

    calculateTotalWealth() {
        const assetSum = this.data.assets.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
        const cashSum = this.data.cashflow.balance || 0;
        return assetSum + cashSum;
    }
}

export const storage = new StorageManager();
