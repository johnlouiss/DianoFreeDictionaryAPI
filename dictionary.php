<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/config.php';

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!isset($_GET['word']) || empty(trim($_GET['word']))) {
    echo json_encode(['success' => false, 'error' => 'Please enter a word to search']);
    exit;
}

$word = trim($_GET['word']);
$cacheFile = $cacheConfig['path'] . md5(strtolower($word)) . '.json';

// Create cache directory if it doesn't exist
if (!is_dir($cacheConfig['path'])) {
    mkdir($cacheConfig['path'], 0755, true);
}

// Check cache first
if ($cacheConfig['enabled'] && file_exists($cacheFile) && 
    time() - filemtime($cacheFile) < $cacheConfig['duration']) {
    
    $cachedData = file_get_contents($cacheFile);
    echo $cachedData;
    exit;
}

// Call the real API
$apiUrl = DICTIONARY_API . urlencode(strtolower($word));

// Initialize cURL
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_USERAGENT => 'LexiQuest Dictionary App/1.0'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false) {
    echo json_encode(['success' => false, 'error' => 'Network error. Please check your connection and try again.']);
    exit;
}

if ($httpCode !== 200) {
    $errorData = json_decode($response, true);
    $errorMessage = $errorData['message'] ?? 'Word not found. Please check the spelling.';
    echo json_encode(['success' => false, 'error' => $errorMessage]);
    exit;
}

$data = json_decode($response, true);

if (json_last_error() !== JSON_ERROR_NONE || empty($data)) {
    echo json_encode(['success' => false, 'error' => 'Invalid response from dictionary service.']);
    exit;
}

// Format the response for our app
$formattedData = [];
foreach ($data as $entry) {
    $formattedEntry = [
        'word' => $entry['word'] ?? '',
        'phonetic' => $entry['phonetic'] ?? '',
        'phonetics' => [],
        'meanings' => []
    ];

    // Process phonetics
    if (isset($entry['phonetics']) && is_array($entry['phonetics'])) {
        foreach ($entry['phonetics'] as $phonetic) {
            if (!empty($phonetic['text']) || !empty($phonetic['audio'])) {
                $formattedEntry['phonetics'][] = [
                    'text' => $phonetic['text'] ?? '',
                    'audio' => $phonetic['audio'] ?? ''
                ];
            }
        }
    }

    // Process meanings
    if (isset($entry['meanings']) && is_array($entry['meanings'])) {
        foreach ($entry['meanings'] as $meaning) {
            $formattedMeaning = [
                'partOfSpeech' => $meaning['partOfSpeech'] ?? '',
                'definitions' => [],
                'synonyms' => $meaning['synonyms'] ?? [],
                'antonyms' => $meaning['antonyms'] ?? []
            ];

            if (isset($meaning['definitions']) && is_array($meaning['definitions'])) {
                foreach ($meaning['definitions'] as $definition) {
                    $formattedDefinition = [
                        'definition' => $definition['definition'] ?? '',
                        'example' => $definition['example'] ?? ''
                    ];
                    $formattedMeaning['definitions'][] = $formattedDefinition;
                }
            }

            $formattedEntry['meanings'][] = $formattedMeaning;
        }
    }

    $formattedData[] = $formattedEntry;
}

$response = [
    'success' => true,
    'data' => $formattedData
];

// Cache the successful response
if ($cacheConfig['enabled']) {
    file_put_contents($cacheFile, json_encode($response));
}

echo json_encode($response);
?>