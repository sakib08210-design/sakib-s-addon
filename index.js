const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Ek stable public music API use kar rahe hain jo block nahi hoti
const API_BASE = "https://saavn.dev/api";

const manifestData = {
  id: "octave.music.addon",
  name: "Octave Music",
  version: "1.0.0",
  description: "Music streaming addon for Bitchord",
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
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query parameter 'q' is required" });

  try {
    const targetUrl = `${API_BASE}/search/songs?query=${encodeURIComponent(query)}`;
    const response = await fetch(targetUrl);
    const data = await response.json();

    // Bitchord ke format ke mutabiq songs map karna
    if (data.success && data.data && data.data.results) {
      const formattedTracks = data.data.results.map(song => ({
        id: song.id,
        title: song.name,
        artist: song.artists.primary.map(a => a.name).join(", "),
        duration: song.duration,
        thumbnail: song.image[2]?.url || song.image[0]?.url,
        streamUrl: song.downloadUrl[4]?.url || song.downloadUrl[3]?.url || song.downloadUrl[0]?.url
      }));
      res.json({ results: formattedTracks });
    } else {
      res.json({ results: [] });
    }
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});

// 2. Stream Endpoint
app.get('/stream', async (req, res) => {
  const { url, title, artist } = req.query;
  
  res.json({
    success: true,
    title: title || "Unknown Title",
    artist: artist || "Unknown Artist",
    streamUrl: url
  });
});

app.listen(PORT, () => {
  console.log(`Addon is running on port ${PORT}`);
});
