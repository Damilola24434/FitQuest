<?php
ob_start(); // Start output buffering to prevent header errors

// Include and initialize CORS/session handling
require_once __DIR__ . '/../Middleware/cors.php';
handleCors();          // Apply CORS headers
configureSession();    // Set up secure session

// Set default JSON response
header("Content-Type: application/json");
$response = ["loggedIn" => false];

// Check for active session
if (isset($_SESSION['user_id'])) {
    $response["loggedIn"] = true;
    $response["user"] = [
        "id" => $_SESSION['user_id'],
        "username" => $_SESSION['username']
    ];
}

// Return JSON response
echo json_encode($response);