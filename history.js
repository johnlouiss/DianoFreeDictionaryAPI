// Search History Management
class SearchHistory {
    constructor() {
        this.storageKey = 'lexiquest-history';
        this.maxHistoryItems = 15;
    }

    getHistory() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || [];
        } catch {
            return [];
        }
    }

    addToHistory(word) {
        if (!word || typeof word !== 'string') return;
        
        const history = this.getHistory();
        const normalizedWord = word.trim().toLowerCase();
        
        // Remove existing entry if present (case insensitive)
        const filteredHistory = history.filter(item => 
            item.trim().toLowerCase() !== normalizedWord
        );
        
        // Add to beginning and limit size
        const updatedHistory = [word, ...filteredHistory].slice(0, this.maxHistoryItems);
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(updatedHistory));
            this.updateHistoryDisplay();
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }

    clearHistory() {
        try {
            localStorage.removeItem(this.storageKey);
            this.updateHistoryDisplay();
            lexiQuest.showToast('History cleared');
        } catch (e) {
            lexiQuest.showToast('Failed to clear history', true);
        }
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        const emptyHistory = document.getElementById('emptyHistory');
        const clearHistoryBtn = document.getElementById('clearHistory');
        
        if (!historyList || !emptyHistory) return;
        
        const history = this.getHistory();
        
        if (history.length === 0) {
            historyList.style.display = 'none';
            emptyHistory.style.display = 'block';
            clearHistoryBtn.style.display = 'none';
            return;
        }
        
        historyList.style.display = 'block';
        emptyHistory.style.display = 'none';
        clearHistoryBtn.style.display = 'block';
        
        historyList.innerHTML = history.map(word => `
            <div class="history-item" onclick="lexiQuest.searchWord('${word.replace(/'/g, "\\'")}'); lexiQuest.toggleHistory();">
                <span class="history-word">${this.escapeHtml(word)}</span>
                <button class="history-remove" onclick="event.stopPropagation(); historyManager.removeFromHistory('${word.replace(/'/g, "\\'")}');" title="Remove from history">
                    ×
                </button>
            </div>
        `).join('');
    }

    removeFromHistory(word) {
        const history = this.getHistory();
        const normalizedWord = word.trim().toLowerCase();
        const updatedHistory = history.filter(item => 
            item.trim().toLowerCase() !== normalizedWord
        );
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(updatedHistory));
            this.updateHistoryDisplay();
            lexiQuest.showToast('Removed from history');
        } catch (e) {
            lexiQuest.showToast('Failed to remove from history', true);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Extend LexiQuest class with history methods
Object.assign(LexiQuest.prototype, {
    loadSearchHistory() {
        this.historyManager = new SearchHistory();
        this.historyManager.updateHistoryDisplay();
    },

    addToHistory(word) {
        if (this.historyManager) {
            this.historyManager.addToHistory(word);
        }
    },

    toggleHistory(show) {
        const overlay = document.getElementById('historyOverlay');
        const drawer = document.getElementById('historyDrawer');
        
        if (show === undefined) {
            show = !drawer.classList.contains('active');
        }
        
        if (show) {
            this.historyManager.updateHistoryDisplay();
            overlay.classList.add('active');
            drawer.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            drawer.classList.remove('active');
            setTimeout(() => {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }, 300);
        }
    },

    clearHistory() {
        if (this.historyManager) {
            this.historyManager.clearHistory();
        }
    }
});

// Initialize history manager
const historyManager = new SearchHistory();