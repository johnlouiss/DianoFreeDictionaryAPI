<?php
require_once 'config/config.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LexiQuest - Discover the Power of Words</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" type="image/x-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>">
</head>
<body>
    <div id="app">
        <?php include 'components/header.php'; ?>
        
        <main>
            <?php include 'components/hero.php'; ?>
        </main>

        <?php include 'components/history-drawer.php'; ?>
        
        <div id="toast" class="toast"></div>
        <div id="loading" class="loading-overlay">
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Discovering words...</p>
            </div>
        </div>
    </div>

    <script src="js/app.js"></script>
    <script src="js/history.js"></script>
</body>
</html>