<section class="hero">
    <div class="floating-letters" id="floatingLetters"></div>
    
    <div class="hero-content">
        <h1 class="hero-title">Discover the Power of Words</h1>
        <p class="hero-subtitle">
            LexiQuest transforms dictionary lookup into an immersive exploration of language. 
            Dive deep into meanings, discover synonyms, and expand your vocabulary.
        </p>
        
        <form class="hero-search" id="heroSearchForm">
            <input 
                type="text" 
                class="search-input" 
                id="heroSearchInput"
                placeholder="Enter a word to begin your quest..."
                autocomplete="off"
            >
            <button type="submit" class="search-button">
                <span>🚀</span>
            </button>
        </form>
        
        <?php if ($features['word_of_day']): ?>
        <div class="word-of-day">
            <h3 class="wotd-title">
                <span>⭐</span>
                Word of the Day
            </h3>
            <h4 class="wotd-word"><?php echo $wordOfTheDay['word']; ?></h4>
            <p class="wotd-pos"><?php echo $wordOfTheDay['partOfSpeech']; ?></p>
            <p class="wotd-def"><?php echo $wordOfTheDay['definition']; ?></p>
            <?php if (isset($wordOfTheDay['example'])): ?>
                <p class="example"><?php echo $wordOfTheDay['example']; ?></p>
            <?php endif; ?>
            <button class="btn btn-accent" onclick="searchWord('<?php echo $wordOfTheDay['word']; ?>')">
                Explore Word
                <span>🔍</span>
            </button>
        </div>
        <?php endif; ?>
    </div>
</section>