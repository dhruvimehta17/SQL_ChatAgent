const sqlite3 = require('sqlite3').verbose();

const dbPath =
  process.env.NODE_ENV === 'production'
    ? ':memory:'
    : './db.sqlite';

console.log('📦 Using DB at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
  }
});

module.exports = db;
