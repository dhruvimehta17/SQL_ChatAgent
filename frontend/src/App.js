import React, { useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

function App() {
  const [question, setQuestion] = useState('');
  const [sql, setSql] = useState('');
  const [data, setData] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');

  const askQuestion = async () => {
    setError('');
    setSql('');
    setExplanation('');
    setData([]);

    try {
      const response = await axios.post('http://localhost:3001/ask', { question });
      setSql(response.data.sql);
      setExplanation(response.data.explanation);
      setData(response.data.rows);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleCSVDownload = () => {
    if (!data || !data.length) return;
    const header = Object.keys(data[0]);
    const csv = [header.join(','), ...data.map(row => header.map(h => row[h]).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'query_results.csv');
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🧠 AI SQL Chat Agent</h1>

      <div style={{ marginBottom: '1rem' }}>
        <input
          style={{ width: '60%', padding: '0.5rem', fontSize: '1rem' }}
          type="text"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
        />
        <button
          style={{ padding: '0.5rem 1rem', marginLeft: '1rem', fontSize: '1rem', cursor: 'pointer' }}
          onClick={askQuestion}
        >
          Ask
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {sql && (
        <>
          <h3>Generated SQL:</h3>
          <pre style={{ background: '#f0f0f0', padding: '1rem' }}>{sql}</pre>
        </>
      )}

      {explanation && (
        <>
          <h3>Explanation:</h3>
          <p style={{ background: '#fefefe', border: '1px solid #ccc', padding: '1rem' }}>{explanation}</p>
        </>
      )}

      {data.length > 0 && (
        <>
          <h3>Table Result:</h3>
          <table border="1" cellPadding="8" style={{ marginBottom: '1rem', width: '100%' }}>
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <button
            style={{ marginBottom: '2rem', padding: '0.5rem 1rem' }}
            onClick={handleCSVDownload}
          >
            ⬇️ Download CSV
          </button>

          <h3>Chart (first 2 numeric columns):</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={Object.keys(data[0])[0]} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={Object.keys(data[0])[1]} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}

export default App;