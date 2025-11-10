// Main Application JavaScript
class LexiQuest {
    constructor() {
        this.currentWord = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initFloatingLetters();
        this.loadSearchHistory();
        this.setupAutoFocus();
    }

    setupEventListeners() {
        // Search forms
        document.getElementById('searchForm').addEventListener('submit', (e) => this.handleSearch(e));
        document.getElementById('heroSearchForm').addEventListener('submit', (e) => this.handleSearch(e));
        
        // History button
        document.getElementById('historyButton').addEventListener('click', () => this.toggleHistory());
        document.getElementById('closeHistory').addEventListener('click', () => this.toggleHistory());
        document.getElementById('historyOverlay').addEventListener('click', () => this.toggleHistory());
        
        // Clear history
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Click outside to close history
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    setupAutoFocus() {
        // Auto-focus search input on page load
        const searchInput = document.getElementById('heroSearchInput') || document.getElementById('searchInput');
        if (searchInput) {
            setTimeout(() => {
                searchInput.focus();
            }, 500);
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl+K or Cmd+K for search focus
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput') || document.getElementById('heroSearchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Escape key to close history
        if (e.key === 'Escape') {
            this.toggleHistory(false);
        }
    }

    handleOutsideClick(e) {
        const historyDrawer = document.getElementById('historyDrawer');
        const historyButton = document.getElementById('historyButton');
        
        if (historyDrawer.classList.contains('active') && 
            !historyDrawer.contains(e.target) && 
            !historyButton.contains(e.target)) {
            this.toggleHistory(false);
        }
    }

    initFloatingLetters() {
        const container = document.getElementById('floatingLetters');
        if (!container) return;
        
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const totalLetters = 25;
        
        for (let i = 0; i < totalLetters; i++) {
            const letter = document.createElement('div');
            letter.className = 'letter';
            letter.textContent = letters[Math.floor(Math.random() * letters.length)];
            
            // Random positioning and animation
            letter.style.left = `${Math.random() * 100}%`;
            letter.style.animationDelay = `${Math.random() * 15}s`;
            letter.style.fontSize = `${Math.random() * 2 + 1}rem`;
            letter.style.opacity = Math.random() * 0.3 + 0.1;
            
            container.appendChild(letter);
        }
    }

    handleSearch(event) {
        event.preventDefault();
        
        let input;
        if (event.target.id === 'searchForm') {
            input = document.getElementById('searchInput');
        } else {
            input = document.getElementById('heroSearchInput');
        }
        
        const searchTerm = input.value.trim();
        
        if (searchTerm) {
            this.searchWord(searchTerm);
            // Don't clear input - let user see what they searched
        } else {
            this.showToast('Please enter a word to search', true);
        }
    }

    async searchWord(word) {
        if (!word || typeof word !== 'string') return;
        
        this.currentWord = word;
        this.showLoading();
        
        try {
            const response = await fetch(`api/dictionary.php?word=${encodeURIComponent(word)}`);
            const data = await response.json();
            
            this.hideLoading();
            
            if (data.success) {
                this.displayResults(data.data);
                this.addToHistory(word);
            } else {
                this.showError(data.error || 'Word not found', word);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.hideLoading();
            this.showError('Network error. Please check your connection and try again.', word);
        }
    }

    displayResults(data) {
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Remove hero section if it exists
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.display = 'none';
        }
        
        // Create or update results section
        let resultsSection = document.querySelector('.search-results');
        if (!resultsSection) {
            resultsSection = document.createElement('div');
            resultsSection.className = 'search-results';
            document.querySelector('main').appendChild(resultsSection);
        }
        
        resultsSection.innerHTML = this.generateResultsHTML(data);
        this.setupResultInteractions();
        
        // Update page title
        document.title = `${this.currentWord} - LexiQuest`;
    }

    generateResultsHTML(data) {
        if (!data || data.length === 0) {
            return this.getErrorHTML('No data received for this word.');
        }

        return data.map((entry, entryIndex) => `
            <div class="word-card" data-word="${entry.word}">
                <div class="word-header">
                    <div>
                        <h2 class="word-title">${this.escapeHtml(entry.word)}</h2>
                        ${entry.phonetic ? `<p class="word-phonetic">${this.escapeHtml(entry.phonetic)}</p>` : ''}
                    </div>
                    <div class="word-actions">
                        ${this.getAudioButtons(entry.phonetics)}
                        <button class="action-btn" onclick="copyToClipboard('${this.escapeHtml(entry.word)}')" title="Copy word">
                            <span>📋</span>
                        </button>
                        <button class="action-btn" onclick="lexiQuest.shareWord('${this.escapeHtml(entry.word)}')" title="Share word">
                            <span>📤</span>
                        </button>
                    </div>
                </div>
                
                ${entry.meanings && entry.meanings.length > 0 ? 
                    entry.meanings.map((meaning, meaningIndex) => `
                        <div class="meaning-section">
                            <div class="meaning-header">
                                <span class="part-of-speech">${this.escapeHtml(meaning.partOfSpeech)}</span>
                            </div>
                            
                            <div class="definition-list">
                                ${meaning.definitions && meaning.definitions.length > 0 ?
                                    meaning.definitions.map((def, defIndex) => `
                                        <div class="definition-item">
                                            <p class="definition-text">
                                                <strong>${defIndex + 1}.</strong> ${this.escapeHtml(def.definition)}
                                            </p>
                                            ${def.example ? `
                                                <div class="example">
                                                    "${this.escapeHtml(def.example)}"
                                                </div>
                                            ` : ''}
                                            <button class="tag" onclick="copyToClipboard('${this.escapeHtml(def.definition.replace(/'/g, "\\'"))}')">
                                                Copy Definition
                                            </button>
                                        </div>
                                    `).join('') :
                                    '<p>No definitions available.</p>'
                                }
                            </div>
                            
                            ${this.getSynonymsAntonymsHTML(meaning)}
                        </div>
                    `).join('') :
                    '<p>No meanings available for this word.</p>'
                }
            </div>
        `).join('');
    }

    getAudioButtons(phonetics) {
        if (!phonetics || phonetics.length === 0) return '';
        
        const audioPhonetics = phonetics.filter(p => p.audio && p.audio.trim() !== '');
        
        if (audioPhonetics.length === 0) return '';
        
        // Return multiple audio buttons if available
        return audioPhonetics.map((phonetic, index) => `
            <button class="action-btn" onclick="playAudio('${phonetic.audio}')" title="Play pronunciation ${index + 1}">
                <span>🔊</span>
            </button>
        `).join('');
    }

    getSynonymsAntonymsHTML(meaning) {
        const hasSynonyms = meaning.synonyms && meaning.synonyms.length > 0;
        const hasAntonyms = meaning.antonyms && meaning.antonyms.length > 0;
        
        if (!hasSynonyms && !hasAntonyms) return '';
        
        let html = '<div class="synonyms-antonyms">';
        
        if (hasSynonyms) {
            html += `
                <div>
                    <h4>Synonyms</h4>
                    <div class="tags-container">
                        ${meaning.synonyms.map(syn => `
                            <button class="tag tag-synonym" onclick="lexiQuest.searchWord('${this.escapeHtml(syn)}')">
                                ${this.escapeHtml(syn)}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (hasAntonyms) {
            html += `
                <div>
                    <h4>Antonyms</h4>
                    <div class="tags-container">
                        ${meaning.antonyms.map(ant => `
                            <button class="tag tag-antonym" onclick="lexiQuest.searchWord('${this.escapeHtml(ant)}')">
                                ${this.escapeHtml(ant)}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupResultInteractions() {
        // Add intersection observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all word cards
        document.querySelectorAll('.word-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }

    showError(message, word) {
        const main = document.querySelector('main');
        const hero = document.querySelector('.hero');
        
        if (hero) {
            hero.style.display = 'none';
        }
        
        let resultsSection = document.querySelector('.search-results');
        if (!resultsSection) {
            resultsSection = document.createElement('div');
            resultsSection.className = 'search-results';
            main.appendChild(resultsSection);
        }
        
        resultsSection.innerHTML = this.getErrorHTML(message, word);
    }

    getErrorHTML(message, word = '') {
        return `
            <div class="error-state">
                <div class="error-icon">🔍</div>
                <h2 class="error-title">${word ? `"${this.escapeHtml(word)}" Not Found` : 'Search Error'}</h2>
                <p class="error-message">${this.escapeHtml(message)}</p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="lexiQuest.goHome()">
                        Back to Home
                        <span>🏠</span>
                    </button>
                    <button class="btn btn-outline" onclick="lexiQuest.toggleHistory()">
                        View History
                        <span>📜</span>
                    </button>
                </div>
            </div>
        `;
    }

    goHome() {
        const hero = document.querySelector('.hero');
        const resultsSection = document.querySelector('.search-results');
        
        if (hero) {
            hero.style.display = 'flex';
        }
        if (resultsSection) {
            resultsSection.remove();
        }
        
        document.title = 'LexiQuest - Discover the Power of Words';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Re-focus search input
        this.setupAutoFocus();
    }

    showLoading() {
        document.getElementById('loading').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading').classList.remove('active');
    }

    showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${isError ? 'error' : ''}`;
        toast.classList.add('active');
        
        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }

    shareWord(word) {
        if (navigator.share) {
            navigator.share({
                title: `Look up "${word}" on LexiQuest`,
                text: `Check out the definition of "${word}" on LexiQuest`,
                url: window.location.href
            }).catch(() => {
                this.copyShareLink(word);
            });
        } else {
            this.copyShareLink(word);
        }
    }

    copyShareLink(word) {
        const url = `${window.location.origin}${window.location.pathname}?word=${encodeURIComponent(word)}`;
        copyToClipboard(url);
    }
}

// Global functions
function searchWord(word) {
    lexiQuest.searchWord(word);
}

function playAudio(audioUrl) {
    if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play().catch(e => {
            console.log('Audio play failed:', e);
            lexiQuest.showToast('Audio playback failed', true);
        });
    } else {
        lexiQuest.showToast('No audio available for this word', true);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        lexiQuest.showToast('✓ Copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            lexiQuest.showToast('✓ Copied to clipboard!');
        } catch (err) {
            lexiQuest.showToast('Failed to copy text', true);
        }
        document.body.removeChild(textArea);
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.lexiQuest = new LexiQuest();
    
    // Check for word in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const wordParam = urlParams.get('word');
    if (wordParam) {
        lexiQuest.searchWord(wordParam);
    }
});