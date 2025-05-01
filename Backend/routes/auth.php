<?php
// Initialize CORS and session handling
require_once __DIR__ . '/../Middleware/cors.php'; 
handleCors(); // Apply CORS headers
configureSession(); // Configure secure session

// Set response headers
header("Content-Type: application/json");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

// Database connection
require_once __DIR__ . '/../config/database.php';

// Get and validate input
$data = json_decode(file_get_contents("php://input"), true) ?? [];
$type = $data['type'] ?? null;

if (!$type) {
    http_response_code(400);
    echo json_encode(["message" => "Type parameter missing"]);
    exit;
}

// Handle registration
if ($type === 'register') {
    // Validate required fields
    if (empty($data['email']) || empty($data['username']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(["message" => "All fields are required"]);
        exit;
    }

    $email = trim($data['email']);
    $username = trim($data['username']);
    $password = password_hash($data['password'], PASSWORD_DEFAULT);

    // Check for existing user
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email OR username = :username");
    $stmt->execute(['email' => $email, 'username' => $username]);
    
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["message" => "Email or username already exists."]);
        exit;
    }

    // Create new user
    $stmt = $pdo->prepare("INSERT INTO users (email, username, password) VALUES (:email, :username, :password)");
    $stmt->execute(['email' => $email, 'username' => $username, 'password' => $password]);

    echo json_encode(["message" => "Signed up successfully."]);
    exit;

// Handle login
} elseif ($type === 'login') {
    // Validate credentials
    if (empty($data['identifier']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(["message" => "Identifier and password are required"]);
        exit;
    }

    $identifier = trim($data['identifier']);
    $password = $data['password'];

    // Find user by email or username
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :id OR username = :id");
    $stmt->execute(['id' => $identifier]);
    $user = $stmt->fetch();

    // Verify password
    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(["message" => "Invalid email/username or password."]);
        exit;
    }

    // Create session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];

    echo json_encode([
        "message" => "Logged in successfully",
        "user" => [
            "id" => $user['id'],
            "email" => $user['email'],
            "username" => $user['username']
        ] // Return user details (excluding password)
    ]);
    exit;

// Handle logout
} elseif ($type === 'logout') {
    session_destroy();
    echo json_encode(["message" => "Logged out"]);
    exit;
}

// Invalid request type
http_response_code(400);
echo json_encode(["message" => "Bad request"]);
?>