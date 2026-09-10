const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', '..', '..', 'data', 'inzicht.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db;

// A single shared connection, created on first use and reused after that —
// better-sqlite3 connections are synchronous and cheap to hold open for the
// life of the process, unlike a typical async driver's connection pool.
function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  }
  return db;
}

module.exports = { getDb, DB_PATH };
