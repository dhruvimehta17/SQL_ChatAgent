const sqlite3 = require('sqlite3').verbose();

// Use in-memory database on production (Render Free Plan)
const dbPath =
  process.env.NODE_ENV === 'production'
    ? ':memory:'
    : './db.sqlite';

const db = new sqlite3.Database(dbPath);
module.exports = db;
