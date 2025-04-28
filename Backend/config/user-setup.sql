-- Drop the users table if it exists (optional, based on your needs)
DROP TABLE IF EXISTS users;

-- Drop the comments table if it exists
DROP TABLE IF EXISTS comments;

-- Create the users table (adjust this as needed)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
    -- Add any other fields for users
);

CREATE TABLE Feedback (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    comment TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



