# SQL Chat Agent

A conversational AI agent that lets you ask natural language questions over a complex SQL database — and get:

- Automatically generated SQL queries
- Natural language answers
- Interactive tables and charts

# Live Demo

Frontend: https://your-vercel-app.vercel.app

Backend: https://sql-chatagent.onrender.com

# Tech Stack

- React (Vite) frontend
- Node.js + Express backend
- SQLite database (messy, real-world sample)
- OpenRouter GPT-3.5 (free OpenAI-compatible API)
- Render (for backend deployment)
- Vercel (for frontend deployment)

# Features

- Natural language to SQL using OpenRouter (GPT-3.5)
- Smart explanation in English
- Works on messy schema, duplicates, nulls, casing issues
- Beautiful charts (Recharts) & tables
- Download CSV button
- Loading spinner while thinking
- Fully deployed and production-ready

# Folder Structure

SQL_ChatAgent/

├── backend/

│ ├── server.js

│ ├── db.js

│ ├── seed.js

│ ├── db.sqlite (auto-seeded in memory)

│ ├── .env (OpenRouter API Key)

├── frontend/

│ ├── src/App.js (main React logic)

│ ├── public/

│ └── package.json

└── README.md

# Example Questions You Can Ask

List all products with a rating above 4

What is the average price of Clothing items?

Which category has the highest average rating?

What’s the cheapest product overall?

Show the most expensive Electronics product

Compare average price across categories

# Local Setup

1. Clone the repo:

git clone https://github.com/dhruvimehta17/SQL_ChatAgent

cd SQL_ChatAgent


2. Setup Backend:

cd backend

npm install

touch .env


3. Inside .env:

OPENROUTER_API_KEY=your_key_here


4. Run backend:

node seed.js # optional (for local persistent db)

node server.js


5. Setup Frontend:

cd ../frontend

npm install

npm run dev

# Deploy (Free)

- Backend (Render):

Create Web Service → from GitHub repo

Set root to backend/

Build command: npm install

Start command: node server.js


- Environment:

OPENROUTER_API_KEY = your key

Free tier: use in-memory DB (skip disk)


- Frontend (Vercel):

Import project from GitHub

Set root to frontend/


- Environment variable:

REACT_APP_API_URL = https://sql-chatagent.onrender.com

Vercel auto-deploys on push ✨
