CREATE TABLE
    IF NOT EXISTS users(
        username TEXT UNIQUE NOT NULL,
        email TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        level_reached_at TIMESTAMP DEFAULT (strftime('%s', 'now')),
        level INTEGER DEFAULT 1
    );

CREATE TABLE
    IF NOT EXISTS questions(
        level INTEGER PRIMARY KEY,
        question TEXT,
        image TEXT NOT NULL,
        answer TEXT NOT NULL
    );