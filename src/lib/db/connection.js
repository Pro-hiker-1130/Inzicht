const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', '..', '..', 'data', 'inzicht.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db;

// Opens a fresh connection with the schema applied — used directly by tests
// (with dbPath ':memory:' for an isolated, disposable database per test) and
// internally by getDb() for the app's one long-lived connection.
function createDb(dbPath) {
  const connection = new Database(dbPath);
  connection.pragma('journal_mode = WAL');
  connection.pragma('foreign_keys = ON');
  connection.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  return connection;
}

// A single shared connection, created on first use and reused after that —
// better-sqlite3 connections are synchronous and cheap to hold open for the
// life of the process, unlike a typical async driver's connection pool.
function getDb() {
  if (!db) {
    db = createDb(DB_PATH);
  }
  return db;
}

module.exports = { getDb, createDb, DB_PATH };
