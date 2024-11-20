-- Create the filesystem table
CREATE TABLE filesystem (
    id TEXT PRIMARY KEY,                -- Unique <uuid>
    parent_id TEXT,                     -- 0 if child of root 

    extension TEXT,                     -- "exe", "png", etc.
    name TEXT NOT NULL,                 -- "puppies.png", "prog.exe", "text", etc.

    primary_project TEXT,               -- "University", "Personal Project", "Photography"
    secondary_project TEXT,             -- "EECS 445", "JDrive", "Cancun Trip"

    file_size INTEGER NOT NULL,         -- Units in bytes
    is_file BOOLEAN NOT NULL,  

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the tags table
CREATE TABLE tags (
    id INTEGER PRIMARY KEY,
    item_id TEXT,                       -- Matches type of filesystem.id
    tag TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES filesystem(id)
);
