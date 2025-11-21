// js/logger.js

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
