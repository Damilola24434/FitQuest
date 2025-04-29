<?php
require_once '../Middleware/cors.php';
handleCors();
configureSession();

header("Content-Type: application/json");
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $comment = $data['comment'] ?? '';

    if (empty($name) || empty($email) || empty($comment)) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields are required.']);
        exit;
    }

    $query = "INSERT INTO feedback (name, email, comment) VALUES (:name, :email, :comment)";
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        'name' => $name,
        'email' => $email,
        'comment' => $comment
    ]);

    echo json_encode(['message' => 'Feedback submitted successfully.']);

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT id, name, email, comment, created_at FROM feedback ORDER BY created_at DESC");
    $feedbacks = $stmt->fetchAll();

    echo json_encode($feedbacks);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Invalid request method.']);
}
?>
