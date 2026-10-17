const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

const API_BASE = "https://tracks.monochrome.st";

const manifestData = {
  id: "custom.music.addon",
  name: "Monochrome Music",
  version: "1.0.0",
  description: "Lossless music streaming addon for Bitchord",
  author: "Sakib",
  type: "audio-provider"
};

app.get('/', (req, res) => {
  res.json(manifestData);
});

app.get('/manifest.json', (req, res) => {
  res.json(manifestData);
});

// Search Endpoint (Direct Lossless Stream URL mapping for Bitchord)
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
    
    // Bitchord ke liye tracks ko direct lossless stream url ke sath map karna
    if (data.tracks) {
      const formattedTracks = data.tracks.map(track => {
        // Direct lossless audio URL banana
        const streamUrl = track.lsrc ? `${API_BASE}${track.lsrc.startsWith('/') ? '' : '/'}${track.lsrc}` : '';
        
        return {
          id: track.id,
          title: track.title,
          artist: track.artistNames || "Unknown Artist",
          duration: Math.round((track.duration || 0) / 1000),
          thumbnail: track.artwork,
          url: streamUrl // Yahan direct lossless link ja raha hai
        };
      });
      res.json({ results: formattedTracks });
    } else {
      res.json(data);
    }
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});

app.listen(PORT, () => {
  console.log(`Addon is running on port ${PORT}`);
});
