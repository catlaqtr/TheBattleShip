CREATE TABLE shots(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    board_id BIGINT NOT NULL,
    shooter_user_id BIGINT NOT NULL,
    target_user_id BIGINT NOT NULL,
    `row` INT NOT NULL,
    `col` INT NOT NULL,
    result ENUM('HIT','MISS','SUNK') NOT NULL,
    sunk_ship_type ENUM('CARRIER','BATTLESHIP','CRUISER','SUBMARINE','DESTROYER') NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_shots_board FOREIGN KEY (board_id) REFERENCES boards(id),
    CONSTRAINT fk_shots_shooter FOREIGN KEY (shooter_user_id) REFERENCES users(id),
    CONSTRAINT fk_shots_target FOREIGN KEY (target_user_id) REFERENCES users(id),

    CONSTRAINT uq_shot_cell_per_board UNIQUE (board_id, `row`, `col`),

    INDEX idx_shots_board_time (board_id, created_at),
    INDEX idx_shots_board_target (board_id, target_user_id)

)ENGINE = INNODB;