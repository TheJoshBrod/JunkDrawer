-- --------------------------- --
-- Schema for basic filesystem --
-- --------------------------- --

CREATE TABLE filesystem (
    id TEXT PRIMARY KEY,                -- Unique <uuid>
    parent_id TEXT,                     -- 0 if child of root 

    extension TEXT,                     -- "exe", "png", etc.
    name TEXT NOT NULL,                 -- "puppies.png", "prog.exe", "text", etc.

    file_size INTEGER NOT NULL,         -- Units in bytes
    is_file BOOLEAN NOT NULL,  

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Allows for optimized search
CREATE VIRTUAL TABLE filesystem_fts USING fts5(
    name
);

-- ---------------------------- --
-- Triggers for FTS file search --
-- ---------------------------- --

-- Handles new file/directory being added
CREATE TRIGGER filesystem_ai AFTER INSERT ON filesystem
BEGIN
    INSERT INTO filesystem_fts(name) VALUES (NEW.name);
END

-- Handles file/directory being updated
CREATE TRIGGER filesystem_au AFTER UPDATE OF name ON filesystem
BEGIN
    DELETE FROM filesystem_fts WHERE name = OLD.name;
    INSERT INTO filesystem_fts(name) VALUES (NEW.name);
END

-- Handles file/directory being deleted
CREATE TRIGGER filesystem_ad AFTER DELETE ON filesystem
BEGIN
    DELETE FROM filesystem_fts WHERE name = OLD.name;
END                      