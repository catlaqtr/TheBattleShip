CREATE TABLE users(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)ENGINE = INNODB;

CREATE TABLE games(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    status ENUM('LOBBY','PLACING','IN_PROCESS','FINISHED') NOT NULL,
    player1_id BIGINT NOT NULL,
    player2_id BIGINT NOT NULL,
    current_turn_user_id BIGINT NULL,
    winner_user_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_games_player1  FOREIGN KEY (player1_id)           REFERENCES users(id),
    CONSTRAINT fk_games_player2  FOREIGN KEY (player2_id)           REFERENCES users(id),
    CONSTRAINT fk_games_turn     FOREIGN KEY (current_turn_user_id) REFERENCES users(id),
    CONSTRAINT fk_games_winner   FOREIGN KEY (winner_user_id)       REFERENCES users(id),

    INDEX idx_games_status_created (status, created_at)

)ENGINE = INNODB;