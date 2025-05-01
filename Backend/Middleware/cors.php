<?php
/**
 * Handles Cross-Origin Resource Sharing (CORS) headers
 * Allows requests from specified origins with credentials
 */
function handleCors() {
    // List of allowed origin domains
    $allowedOrigins = [
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "https://fitquest-1skw.onrender.com",
        "https://fitquest-frontend.onrender.com"
    ];
    // Get the request origin
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    // If origin is allowed, set CORS headers
    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Max-Age: 3600");
        header("Content-Type: application/json");

        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    } 
}


// Session configuration that works with CORS
function configureSession() {
    // Only configure if session not already started
    if (session_status() === PHP_SESSION_NONE) {
        ini_set('session.cookie_samesite', 'None');
        ini_set('session.cookie_secure', '1');
        session_set_cookie_params([
            'lifetime' => 86400,
            'path' => '/',
            'domain' =>  '',
            'secure' => true, 
            'httponly' => true,
            'samesite' => 'None'
        ]);
        session_start();
    }
}

