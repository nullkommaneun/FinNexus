// js/app.js
import { appLogger } from './logger.js';
import { storage } from './modules/storage.js';
import { formatCurrency, generateId } from './modules/utils.js';

// DOM Elements Cache
const ui = {
    totalWealth: document.getElementById('display-total-wealth'),
    assetTableBody: document.getElementById('asset-table-body'),
    btnOpenAssetModal: document.getElementById('btn-open-asset-modal'),
    modalAsset: document.getElementById('modal-add-asset'),
    formAsset: document.getElementById('form-add-asset'),
    btnCancelAsset: document.getElementById('btn-cancel-asset'),
    // NFR
    debugPanel: document.getElementById('nfr-debug-panel'),
    auditModal: document.getElementById('nfr-audit-modal'),
    auditContent: document.getElementById('audit-content')
};

// --- Render Logic ---

function renderDashboard() {
    appLogger.debug('Rendere Dashboard...');

    // 1. Assets Liste rendern
    const assets = storage.getAssets();
    ui.assetTableBody.innerHTML = '';

    if (assets.length === 0) {
        ui.assetTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-600 italic">Keine Assets gefunden. Füge das erste hinzu!</td></tr>`;
    } else {
        assets.forEach(asset => {
            const row = document.createElement('tr');
            row.className = "border-b border-gray-700/50 hover:bg-gray-800/50 transition group";
            row.innerHTML = `
                <td class="px-4 py-3 font-medium text-white">${asset.name}</td>
                <td class="px-4 py-3 text-gray-400 text-xs uppercase">${asset.category}</td>
                <td class="px-4 py-3 text-right font-mono text-gray-300">${formatCurrency(asset.value)}</td>
                <td class="px-4 py-3 text-right">
                    <button onclick="window.deleteAsset('${asset.id}')" class="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition text-xs">Löschen</button>
                </td>
            `;
            ui.assetTableBody.appendChild(row);
        });
    }

    // 2. Big Number berechnen
    const total = storage.calculateTotalWealth();
    ui.totalWealth.textContent = formatCurrency(total);
    
    // Update Page Title (Privacy Feature: Zeige Wert nicht im Titel, nur Status)
    document.title = `FinNexus • ${assets.length} Assets`;
}

// --- Event Handlers ---

function setupEventListeners() {
    // Modal öffnen/schließen
    ui.btnOpenAssetModal.addEventListener('click', () => {
        ui.modalAsset.classList.remove('hidden');
        document.getElementById('input-asset-name').focus();
    });
    
    const closeModal = () => {
        ui.modalAsset.classList.add('hidden');
        ui.formAsset.reset();
    };
    ui.btnCancelAsset.addEventListener('click', closeModal);

    // Asset Hinzufügen
    ui.formAsset.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('input-asset-name').value;
        const category = document.getElementById('input-asset-category').value;
        const value = parseFloat(document.getElementById('input-asset-value').value);

        if (!name || isNaN(value)) {
            appLogger.warn('Validierung fehlgeschlagen: Ungültige Eingabe.');
            return;
        }

        const newAsset = {
            id: generateId(),
            name,
            category,
            value,
            updatedAt: Date.now()
        };

        storage.addAsset(newAsset);
        renderDashboard();
        closeModal();
        appLogger.info('UI aktualisiert.');
    });

    // NFR Buttons
    document.getElementById('btn-toggle-debug').addEventListener('click', () => {
        ui.debugPanel.classList.toggle('hidden');
    });
    
    document.getElementById('btn-toggle-audit').addEventListener('click', () => {
        ui.auditModal.classList.remove('hidden');
        // Live Audit generieren
        const total = storage.calculateTotalWealth();
        ui.auditContent.innerHTML = `
            ROOT CHECK:<br>
            ----------------<br>
            Assets Sum: ${formatCurrency(total)}<br>
            Items: ${storage.getAssets().length}<br>
            Status: OK
        `;
    });
    document.getElementById('btn-close-audit').addEventListener('click', () => ui.auditModal.classList.add('hidden'));
}

// Global Exposure für HTML on-click Events (Module Scope ist sonst geschlossen)
window.deleteAsset = (id) => {
    if(confirm('Asset wirklich löschen?')) {
        storage.removeAsset(id);
        renderDashboard();
    }
};

// --- Init ---

function init() {
    appLogger.init('debug-console');
    appLogger.info('FinNexus Core gestartet.');
    
    setupEventListeners();
    renderDashboard();
}

document.addEventListener('DOMContentLoaded', init);
