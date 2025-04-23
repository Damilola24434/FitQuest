<?php
ob_start(); // Prevent header issues

require_once __DIR__ . '/../Middleware/cors.php';
handleCors();
configureSession();

header("Content-Type: application/json");

$response = ["loggedIn" => false];

if (isset($_SESSION['user_id'])) {
    $response["loggedIn"] = true;
    $response["user"] = [
        "id" => $_SESSION['user_id'],
        "username" => $_SESSION['username']
    ];
}

echo json_encode($response);
