// Manual entry point for creating/checking the database file and schema —
// run with `npm run db:init`. Feature code doesn't need this: connection.js
// applies the schema automatically the first time getDb() is called.
const { getDb, DB_PATH } = require('./connection');

const db = getDb();
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
  .all()
  .map((row) => row.name);

console.log(`Database ready at ${DB_PATH}`);
console.log('Tables:', tables.join(', '));
