const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
    // Step 1: Ask OpenRouter to generate the SQL query
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

    // Step 2: Run the SQL query on the local SQLite database
    db.all(sql, [], async (err, rows) => {
      if (err) {
        console.error('❌ SQL execution error:', err.message);
        return res.status(500).json({ error: err.message, sql });
      }

      // Step 3: Ask GPT to summarize the results
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
