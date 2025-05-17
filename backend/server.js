const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dbPath = process.env.NODE_ENV === 'production' ? ':memory:' : './db.sqlite';
const db = new sqlite3.Database(dbPath);
console.log('📦 Using DB at:', dbPath);

// 🌱 Auto-seed SQLite if empty
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    category TEXT,
    price REAL,
    rating REAL
  )`);

  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (row.count === 0) {
      console.log('🌱 Seeding in-memory DB...');
      const stmt = db.prepare('INSERT INTO products VALUES (?, ?, ?, ?, ?)');
      const data = [
        [1, 'Product A', 'Electronics', 199.99, 4.2],
        [2, 'Product B', 'Clothing', 49.99, 3.8],
        [3, 'Product C', 'Electroniks', 299.99, 4.7],
        [4, 'Product D', 'Furniture', 499.99, null],
        [5, 'Product E', 'clothing', 89.99, 3.5],
        [6, null, 'Furniture', 899.99, 4.9],
        [7, 'Product G', 'Electronics', 149.99, 4.0],
        [8, 'Product H', 'Electronics', null, 2.8],
        [9, 'Product I', 'Clothing', 39.99, 4.3],
        [10, 'Product J', 'Furnitures', 599.99, 4.4]
        // You can add the rest of your 50 products here if you want
      ];
      data.forEach(row => stmt.run(row));
      stmt.finalize();
      console.log('✅ Seeding complete.');
    }
  });
});

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post('/ask', async (req, res) => {
  const question = req.body.question;

  const prompt = `
You are a helpful assistant that converts natural language questions into valid SQLite SQL queries.

Your database contains the following table:

products(id INTEGER, name TEXT, category TEXT, price REAL, rating REAL)

Some rows may have null or invalid data. Write a valid SQLite query to answer the question.

Only output the raw SQL query. No explanation, no markdown, no code blocks.

Question: "${question}"
`;

  try {
    const sqlResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a SQL assistant for SQLite.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    const sqlData = await sqlResponse.json();
    const rawMessage = sqlData.choices?.[0]?.message?.content?.trim();
    console.log('🧠 GPT raw response:', rawMessage);

    const sql = rawMessage?.toLowerCase().includes('select') ? rawMessage : null;

    if (!sql) {
      console.error('❌ Invalid SQL from GPT:', rawMessage);
      return res.status(500).json({ error: 'Failed to generate valid SQL', raw: rawMessage });
    }

    console.log('✅ SQL from GPT:', sql);

    db.all(sql, [], async (err, rows) => {
      if (err) {
        console.error('❌ SQL execution error:', err.message);
        return res.status(500).json({ error: err.message, sql });
      }

      const summaryPrompt = `
You are a helpful assistant. Given the SQL query and the rows returned, write a plain English explanation of the result.

SQL: ${sql}

Rows: ${JSON.stringify(rows)}

Answer (1-2 lines only):`;

      const explainResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You summarize SQL results into plain English.' },
            { role: 'user', content: summaryPrompt }
          ]
        })
      });

      const explainData = await explainResponse.json();
      const explanation = explainData.choices?.[0]?.message?.content?.trim();

      res.json({ sql, rows, explanation });
    });

  } catch (err) {
    console.error('❌ OpenRouter error:', err.message || err);
    res.status(500).json({ error: 'OpenRouter error' });
  }
});

app.listen(3001, () => {
  console.log('🚀 OpenRouter GPT-3.5 backend running at http://localhost:3001');
});
