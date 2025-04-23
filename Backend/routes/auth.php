<?php
// Enable all CORS for local development
require_once __DIR__ . '/../Middleware/cors.php'; 
handleCors();
configureSession();
header("Content-Type: application/json");

require_once __DIR__ . '/../config/database.php';

// Get input data safely
$data = json_decode(file_get_contents("php://input"), true) ?? [];
$type = $data['type'] ?? null;

if (!$type) {
    http_response_code(400);
    echo json_encode(["message" => "Type parameter missing"]);
    exit;
}

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

    // Check for duplicates
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email OR username = :username");
    $stmt->execute(['email' => $email, 'username' => $username]);
    
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["message" => "Email or username already exists."]);
        exit;
    }

    // Insert new user
    $stmt = $pdo->prepare("INSERT INTO users (email, username, password) VALUES (:email, :username, :password)");
    $stmt->execute(['email' => $email, 'username' => $username, 'password' => $password]);

    echo json_encode(["message" => "Signed up successfully."]);
    exit;

} elseif ($type === 'login') {
    // Validate required fields
    if (empty($data['identifier']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(["message" => "Identifier and password are required"]);
        exit;
    }

    $identifier = trim($data['identifier']);
    $password = $data['password'];

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :id OR username = :id");
    $stmt->execute(['id' => $identifier]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(["message" => "Invalid email/username or password."]);
        exit;
    }

    // Set session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];

    echo json_encode([
        "message" => "Logged in successfully",
        "user" => [
            "id" => $user['id'],
            "email" => $user['email'],
            "username" => $user['username']
        ]
    ]);
    exit;

} elseif ($type === 'logout') {
    session_destroy();
    echo json_encode(["message" => "Logged out"]);
    exit;
}

http_response_code(400);
echo json_encode(["message" => "Bad request"]);
?>