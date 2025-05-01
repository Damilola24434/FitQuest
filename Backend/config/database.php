<?php
// Use Render's DATABASE_URL env variable
$databaseUrl = getenv("DATABASE_URL");

if (!$databaseUrl) {
    die("🔴 DATABASE_URL not set.");
}

// Parse the URL
$dbParts = parse_url($databaseUrl);

$host = $dbParts['host'];
$port = $dbParts['port'] ?? '5432';;
$user = $dbParts['user'];
$pass = $dbParts['pass'];
$db   = ltrim($dbParts['path'], '/');

$dsn = "pgsql:host=$host;port=$port;dbname=$db";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    die("🔴 Database connection failed: " . $e->getMessage());
}
?>
