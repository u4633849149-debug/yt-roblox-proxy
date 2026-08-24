const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;
const CHANNEL_ID = 'UC6fnWNbHioiwZwf5OiTAaUA';

app.get('/api/subscribers', async (req, res) => {
  try {
    const url = `https://www.youtube.com/channel/${CHANNEL_ID}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    // Sucht nach der ungerundeten Abonnentenzahl im HTML-Quelltext
    const match = response.data.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"/);

    if (match && match[1]) {
      // Extrahiert nur die Zahlen aus dem Treffer (z.B. "11.379" -> 11379)
      const rawCount = match[1].replace(/[^0-9]/g, '');
      return res.json({ exactSubscribers: parseInt(rawCount, 10) });
    }

    // Fallback: Direkte Suche im Seiten-Header
    const fallbackMatch = response.data.match(/"subscriberCountText":\{"simpleText":"([^"]+)"/);
    if (fallbackMatch && fallbackMatch[1]) {
      return res.json({ subscribersText: fallbackMatch[1] });
    }

    res.status(404).json({ error: 'Zahl konnte im HTML nicht gefunden werden' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Abrufen der YouTube-Daten', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy läuft auf Port ${PORT}`);
});
