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

// 1. Search Endpoint (Gaane search karne ke liye)
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query parameter 'q' is required" });

  try {
    // Octave ki search API ko call karein (apne Network tab se search endpoint yahan adjust kar sakte hain)
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
      headers: HEADERS
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});

// 2. Audio Stream Endpoint (Lossless link fetch karne ke liye)
app.get('/stream', async (req, res) => {
  const { track, t, a, d, x, k } = req.query;
  
  if (!track || !k) {
    return res.status(400).json({ error: "Missing required track parameters" });
  }

  try {
    // Jo cURL aapne bheja hai, wahi exact parameters yahan construct honge
    const targetUrl = `${API_BASE}/audio/lossless?track=${track}&t=${encodeURIComponent(t || '')}&a=${encodeURIComponent(a || '')}&d=${d || 0}&x=${x || 0}&k=${k}`;
    
    // Server ko HEAD ya GET request bhej kar check karenge
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: HEADERS
    });

    // Agar audio URL ya stream redirect mil raha hai
    res.json({
      success: true,
      streamUrl: targetUrl, // Addon is URL ko direct play kar sakega
      status: response.status
    });
  } catch (err) {
    console.error("Stream error:", err);
    res.status(500).json({ error: "Failed to fetch stream" });
  }
});

app.listen(PORT, () => {
  console.log(`Octave Addon is running on port ${PORT}`);
});