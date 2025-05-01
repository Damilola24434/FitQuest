<?php
// Get database URL from environment variables
$databaseUrl = getenv("DATABASE_URL");

// Exit if no database URL found
if (!$databaseUrl) {
    die("🔴 DATABASE_URL not set.");
}

// Parse database connection URL into components
$dbParts = parse_url($databaseUrl);

// Extract connection parameters (default port: 5432)
$host = $dbParts['host'];            // Database server
$port = $dbParts['port'] ?? '5432';  // Connection port 
$user = $dbParts['user'];            // Database username
$pass = $dbParts['pass'];            // Database password
$db   = ltrim($dbParts['path'], '/'); // Database name

// Create PDO connection string
$dsn = "pgsql:host=$host;port=$port;dbname=$db";

try {
    // Create database connection with PDO
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,       // Throw exceptions on errors
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,  // Return associative arrays
    ]);
    
} catch (PDOException $e) {
    // Handle connection errors
    die("🔴 Database connection failed: " . $e->getMessage());
}
?>
