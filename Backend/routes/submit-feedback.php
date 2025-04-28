<?php
// Include CORS middleware at the top to handle all requests
require_once '../Middleware/cors.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include database configuration
require_once '../config/database.php';

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the POST data
    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $comment = $data['comment'] ?? '';

    // Validate input
    if (empty($name) || empty($email) || empty($comment)) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'All fields are required.']);
        exit;
    }

    // Prepare SQL query to insert feedback
    $query = "INSERT INTO Feedback (name, email, comment) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('sss', $name, $email, $comment);

    // Execute query
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Feedback submitted successfully.']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to submit feedback.']);
    }

    $stmt->close();
    $conn->close();
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Invalid request method.']);
}
?>