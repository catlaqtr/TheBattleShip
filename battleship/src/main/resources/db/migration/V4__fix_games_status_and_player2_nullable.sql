-- Expand enum to include both old and new values so we can migrate data safely
ALTER TABLE games
    MODIFY COLUMN status ENUM('LOBBY','PLACING','IN_PROCESS','IN_PROGRESS','FINISHED') NOT NULL;

-- Migrate any existing rows from IN_PROCESS to IN_PROGRESS
UPDATE games SET status = 'IN_PROGRESS' WHERE status = 'IN_PROCESS';

-- Shrink enum to only supported values
ALTER TABLE games
    MODIFY COLUMN status ENUM('LOBBY','PLACING','IN_PROGRESS','FINISHED') NOT NULL;

-- Allow player2 to be nullable while preserving FK
ALTER TABLE games
    MODIFY COLUMN player2_id BIGINT NULL;
