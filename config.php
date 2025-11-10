<?php
// API Configuration
define('DICTIONARY_API', 'https://api.dictionaryapi.dev/api/v2/entries/en/');

// Word of the Day - We'll rotate through different words
$wordOfTheDayList = [
    [
        'word' => 'serendipity',
        'definition' => 'the occurrence and development of events by chance in a happy or beneficial way',
        'partOfSpeech' => 'noun',
        'example' => 'A fortunate stroke of serendipity brought the two lovers together.'
    ],
    [
        'word' => 'ephemeral',
        'definition' => 'lasting for a very short time',
        'partOfSpeech' => 'adjective',
        'example' => 'Fashion is often ephemeral, changing with the seasons.'
    ],
    [
        'word' => 'ubiquitous',
        'definition' => 'present, appearing, or found everywhere',
        'partOfSpeech' => 'adjective',
        'example' => 'Mobile phones have become ubiquitous in modern society.'
    ],
    [
        'word' => 'eloquent',
        'definition' => 'fluent or persuasive in speaking or writing',
        'partOfSpeech' => 'adjective',
        'example' => 'Her eloquent speech moved the entire audience.'
    ],
    [
        'word' => 'resilient',
        'definition' => 'able to withstand or recover quickly from difficult conditions',
        'partOfSpeech' => 'adjective',
        'example' => 'Children are often more resilient than adults in facing challenges.'
    ]
];

// Get different word each day
$dayOfYear = date('z');
$wordOfTheDay = $wordOfTheDayList[$dayOfYear % count($wordOfTheDayList)];

// Feature Toggles
$features = [
    'word_of_day' => true,
    'search_history' => true,
    'audio_pronunciation' => true,
    'synonyms_antonyms' => true
];

// Cache configuration
$cacheConfig = [
    'enabled' => true,
    'duration' => 3600, // 1 hour in seconds
    'path' => __DIR__ . '/../cache/'
];
?>