const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new DatabaseSync(path.join(dataDir, 'tvdinner.db'));

db.exec(`PRAGMA journal_mode = WAL`);

db.exec(`
  CREATE TABLE IF NOT EXISTS meals (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    photo_path  TEXT,
    calories    INTEGER,
    protein     REAL,
    carbs       REAL,
    fat         REAL,
    rating      INTEGER CHECK(rating BETWEEN 1 AND 5),
    notes       TEXT,
    servings    INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS meal_history (
    id          TEXT PRIMARY KEY,
    meal_id     TEXT NOT NULL,
    name        TEXT,
    photo_path  TEXT,
    calories    INTEGER,
    protein     REAL,
    carbs       REAL,
    fat         REAL,
    rating      INTEGER,
    notes       TEXT,
    servings    INTEGER,
    changed_at  TEXT NOT NULL,
    change_note TEXT
  );

  CREATE TABLE IF NOT EXISTS consumption_log (
    id          TEXT PRIMARY KEY,
    meal_id     TEXT NOT NULL,
    meal_name   TEXT NOT NULL,
    servings    INTEGER NOT NULL DEFAULT 1,
    consumed_at TEXT NOT NULL
  );
`);

module.exports = db;
