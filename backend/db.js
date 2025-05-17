const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.NODE_ENV === 'production'
  ? '/var/data/db.sqlite'
  : './db.sqlite';

const db = new sqlite3.Database(dbPath);
module.exports = db;
