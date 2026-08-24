const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;
const CHANNEL_ID = 'UC6fnWNbHioiwZwf5OiTAaUA';

async function fetchSubscribers(res) {
  try {
    const url = `https://www.youtube.com/channel/${CHANNEL_ID}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const match = response.data.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"/);

    if (match && match[1]) {
      const rawCount = match[1].replace(/[^0-9]/g, '');
      return res.json({ exactSubscribers: parseInt(rawCount, 10) });
    }

    const fallbackMatch = response.data.match(/"subscriberCountText":\{"simpleText":"([^"]+)"/);
    if (fallbackMatch && fallbackMatch[1]) {
      return res.json({ exactSubscribers: fallbackMatch[1] });
    }

    res.status(404).json({ error: 'Zahl im HTML nicht gefunden' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Abrufen', details: error.message });
  }
}

// Beide Pfade abdecken:
app.get('/', (req, res) => fetchSubscribers(res));
app.get('/api/subscribers', (req, res) => fetchSubscribers(res));

app.listen(PORT, () => {
  console.log(`Proxy läuft auf Port ${PORT}`);
});
