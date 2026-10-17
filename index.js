const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Naya Monochrome tracks base URL
const API_BASE = "https://tracks.monochrome.st";

const manifestData = {
  id: "custom.music.addon",
  name: "Monochrome Music",
  version: "1.0.0",
  description: "Music streaming addon using Monochrome API",
  author: "Sakib",
  type: "audio-provider"
};

app.get('/', (req, res) => {
  res.json(manifestData);
});

app.get('/manifest.json', (req, res) => {
  res.json(manifestData);
});

// Search Endpoint
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query parameter 'q' is required" });

  try {
    const targetUrl = `${API_BASE}/search?query=${encodeURIComponent(query)}`;
    const response = await fetch(targetUrl, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});

app.listen(PORT, () => {
  console.log(`Addon is running on port ${PORT}`);
});
