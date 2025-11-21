// js/modules/utils.js

/**
 * Formatiert eine Zahl als Währung (EUR).
 * Nutzt Intl.NumberFormat für locale-korrekte Darstellung.
 */
export const formatCurrency = (number) => {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
};

/**
 * Formatiert eine Zahl als Prozentwert.
 */
export const formatPercent = (number) => {
    return new Intl.NumberFormat('de-DE', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
        signDisplay: "exceptZero" // Zeigt + oder - automatisch an
    }).format(number / 100);
};

/**
 * Erstellt einen sicheren Zeitstempel.
 */
export const getTimestamp = () => {
    return new Date().toLocaleString('de-DE');
};

/**
 * Generiert eine einfache UUID für Datenbank-Einträge.
 */
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
