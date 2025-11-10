<div class="history-overlay" id="historyOverlay"></div>

<div class="history-drawer" id="historyDrawer">
    <div class="history-header">
        <h3>Search History</h3>
        <button class="action-btn" id="closeHistory">
            <span>✕</span>
        </button>
    </div>
    
    <div class="history-content">
        <div class="history-list" id="historyList">
            <!-- History items will be populated by JavaScript -->
        </div>
        
        <div class="empty-history" id="emptyHistory" style="display: none;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📖</div>
            <p>Your search history is empty</p>
            <p style="font-size: 0.9rem; opacity: 0.7;">Start exploring words to build your history!</p>
        </div>
        
        <button class="btn btn-accent" id="clearHistory" style="margin-top: 2rem; width: 100%;">
            Clear All History
            <span>🗑️</span>
        </button>
    </div>
</div>