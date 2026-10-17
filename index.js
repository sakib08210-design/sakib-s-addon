const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

const API_BASE = "https://api.octavestreaming.com";

const HEADERS = {
  "accept": "*/*",
  "accept-language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
  "origin": "https://music.octavestreaming.com",
  "referer": "https://music.octavestreaming.com/",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36"
};

const manifestData = {
  id: "octave.music.addon",
  name: "Octave Music",
  version: "1.0.0",
  description: "Octave streaming addon for Bitchord",
  author: "Sakib",
  type: "audio-provider"
};

app.get('/', (req, res) => {
  res.json(manifestData);
});

app.get('/manifest.json', (req, res) => {
  res.json(manifestData);
});

// 1. Search Endpoint (Updated with complete parameters to avoid HTML error)
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query parameter 'q' is required" });

  try {
    // Original cURL wale parameters yahan add kiye gaye hain
    const targetUrl = `${API_BASE}/npLook?sf=us&dz=997388151&title=${encodeURIComponent(query)}`;
    
    const response = await fetch(targetUrl, {
      headers: HEADERS
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});

// 2. Stream Endpoint
app.get('/stream', async (req, res) => {
  const { track, t, a, d, x, k } = req.query;
  
  if (!track || !k) {
    return res.status(400).json({ error: "Missing required track parameters" });
  }

  try {
    const targetUrl = `${API_BASE}/audio/lossless?track=${track}&t=${encodeURIComponent(t || '')}&a=${encodeURIComponent(a || '')}&d=${d || 0}&x=${x || 0}&k=${k}`;
    
    res.json({
      success: true,
      title: t || "Unknown Title",
      artist: a || "Unknown Artist",
      duration: d || 0,
      streamUrl: targetUrl
    });
  } catch (err) {
    console.error("Stream error:", err);
    res.status(500).json({ error: "Failed to fetch stream details" });
  }
});

app.listen(PORT, () => {
  console.log(`Octave Addon is running on port ${PORT}`);
});
