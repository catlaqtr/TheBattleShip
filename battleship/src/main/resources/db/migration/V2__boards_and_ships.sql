CREATE TABLE boards(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    game_id BIGINT NOT NULL,
    owner_user_id BIGINT NOT NULL ,
    size INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_boards_game FOREIGN KEY (game_id)         REFERENCES games(id),
    CONSTRAINT fk_boards_owner FOREIGN KEY (owner_user_id)   REFERENCES users(id),

    CONSTRAINT uq_boards_game_owner UNIQUE (game_id, owner_user_id),

    INDEX idx_boards_game (game_id)
)ENGINE = INNODB;


CREATE TABLE ships(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    board_id BIGINT NOT NULL,
    type ENUM('CARRIER','BATTLESHIP','CRUISER','SUBMARINE','DESTROYER') NOT NULL,
    length INT NOT NULL,
    start_row INT NOT NULL,
    start_col INT NOT NULL,
    orientation ENUM('HORIZONTAL','VERTICAL') NOT NULL,
    sunk BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_ships_board FOREIGN KEY (board_id) REFERENCES boards(id),
    CONSTRAINT uq_ships_type_per_board UNIQUE (board_id,type),
    INDEX idx_ships_board (board_id)
)ENGINE = INNODB;