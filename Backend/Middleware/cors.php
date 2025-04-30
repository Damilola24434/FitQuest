<?php
function handleCors() {
    $allowedOrigins = [
        "http://127.0.0.1:3000",
        "http://localhost:3000"
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Max-Age: 3600");
        header("Content-Type: application/json");

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    } 
}


// Session configuration that works with CORS
function configureSession() {
    if (session_status() === PHP_SESSION_NONE) {
        ini_set('session.cookie_samesite', 'None');
        session_set_cookie_params([
            'lifetime' => 86400,
            'path' => '/',
            'domain' =>  '127.0.0.1',
            'secure' => false, 
            'httponly' => true,
            'samesite' => 'None'
        ]);
        session_start();
    }
}

