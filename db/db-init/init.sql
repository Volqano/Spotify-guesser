CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    gamesPlayed INT DEFAULT 0,
    gamesWon INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS match_history (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    player1_email VARCHAR(255) NOT NULL,
    player2_email VARCHAR(255),
    player3_email VARCHAR(255),
    player4_email VARCHAR(255),
    match_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player1_email) REFERENCES users(email),
    FOREIGN KEY (player2_email) REFERENCES users(email),
    FOREIGN KEY (player3_email) REFERENCES users(email),
    FOREIGN KEY (player4_email) REFERENCES users(email)
);