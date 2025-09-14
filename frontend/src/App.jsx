import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShortUrl('');
    setError('');

    if (!longUrl) {
      setError('Please enter a URL.');
      return;
    }

    try {
      // IMPORTANT: The backend is on port 3001
      const response = await axios.post('/api/shorten', {
        longUrl: longUrl,
      });
      setShortUrl(response.data.shortUrl);
    } catch (err) {
      setError('Failed to shorten URL. Please try again.');
      console.error('API Error:', err);
    }
  };

  return (
    <div className="container">
      <h1>URL Shortener</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Enter a long URL"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
        />
        <button type="submit">Shorten</button>
      </form>

      {shortUrl && (
        <div className="result">
          <p>Shortened URL:</p>
          <a href={shortUrl} target="_blank" rel="noopener noreferrer">
            {shortUrl}
          </a>
        </div>
      )}

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
}

export default App;