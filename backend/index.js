const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3001;
app.use(cors());
app.use(express.json());

// Database Connection 
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: {
        rejectUnauthorized: false
    }
});

async function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS urls (
      id SERIAL PRIMARY KEY,
      short_code VARCHAR(10) UNIQUE NOT NULL,
      long_url TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    const client = await pool.connect();
    console.log("Successfully connected to the database.");
    await client.query(createTableQuery);
    console.log("Table 'urls' has been checked/created.");
    client.release();
  } catch (err) {
    console.error("!!! DATABASE INITIALIZATION FAILED !!!");
    console.error("Error details:", err);
    process.exit(1); 
  }
}

// Helper Function to Generate Short Code
function generateShortCode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// API Endpoints

// Shorten URL Endpoint
app.post('/api/shorten', async (req, res) => {
    const { longUrl } = req.body;
    if (!longUrl) {
        return res.status(400).json({ error: 'longUrl is required' });
    }

    try {
        // First, try to find the long URL in the database
        const lookupResult = await pool.query('SELECT short_code FROM urls WHERE long_url = $1', [longUrl]);

        // If it exists, return the existing short URL
        if (lookupResult.rows.length > 0) {
            const existingShortCode = lookupResult.rows[0].short_code;
            const existingUrl = `${publicDomain}/${existingShortCode}`;

            return res.status(200).json({ shortUrl: existingUrl });
        }

        // If it does not exist, create a new one
        const shortCode = generateShortCode();

        const insertResult = await pool.query(
            'INSERT INTO urls (long_url, short_code) VALUES ($1, $2) RETURNING short_code',
            [longUrl, shortCode]
        );
        const publicDomain = process.env.PUBLIC_DOMAIN || `http://localhost:${PORT}`;
        const newUrl = `${publicDomain}/${insertResult.rows[0].short_code}`;

        // Status 201 Created because we created a new resource.
        res.status(201).json({ shortUrl: newUrl });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Redirect Endpoint
app.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;

    try {
        const result = await pool.query('SELECT long_url FROM urls WHERE short_code = $1', [shortCode]);

        if (result.rows.length > 0) {
            const { long_url } = result.rows[0];
            res.redirect(long_url);
        } else {
            res.status(404).send('URL not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start Server
async function startServer() {
  await initializeDatabase(); // Wait for the database to be ready
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();