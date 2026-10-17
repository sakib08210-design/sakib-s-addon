const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

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

// 1. Search Endpoint
app.get('/search', async (req, res) => {
  const query = req.query.q || req.query.query;
  const searchQuery = query ? query : "Arijit";

  try {
    const targetUrl = `${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`;
    const response = await fetch(targetUrl, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    const data = await response.json();
    
    // Bitchord ke format ke mutabiq tracks map karna
    if (data.tracks) {
      const formattedTracks = data.tracks.map(track => ({
        id: track.id,
        title: track.title,
        artist: track.artistNames || "Unknown Artist",
        duration: Math.round((track.duration || 0) / 1000),
        thumbnail: track.artwork,
        url: `/stream?id=${track.id}&lsrc=${encodeURIComponent(track.lsrc || '')}`
      }));
      res.json({ results: formattedTracks });
    } else {
      res.json(data);
    }
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});

// 2. Stream Endpoint (Gaana play karne ke liye)
app.get('/stream', async (req, res) => {
  const { id, lsrc } = req.query;

  try {
    // Agar direct lsrc stream source available hai
    if (lsrc) {
      res.json({
        success: true,
        streamUrl: `${API_BASE}${lsrc.startsWith('/') ? '' : '/'}${lsrc}`
      });
    } else {
      res.status(404).json({ error: "Stream URL not found" });
    }
  } catch (err) {
    console.error("Stream error:", err);
    res.status(500).json({ error: "Failed to fetch stream" });
  }
});

app.listen(PORT, () => {
  console.log(`Addon is running on port ${PORT}`);
});
