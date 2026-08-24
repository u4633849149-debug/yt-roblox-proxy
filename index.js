const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = 'AIzaSyBlaSk6w2-G7nl7jN9PrgnCXOYsNxnGjr4';
const CHANNEL_ID = 'UC6fnWNbHioiwZwf5OiTAaUA';

async function fetchSubscribers(res) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`;
    const response = await axios.get(url);

    if (response.data.items && response.data.items.length > 0) {
      const subscriberCount = response.data.items[0].statistics.subscriberCount;
      return res.json({ exactSubscribers: parseInt(subscriberCount, 10) });
    }

    res.status(404).json({ error: 'Kanal nicht gefunden' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Abrufen der YouTube-Daten', details: error.message });
  }
}

// Stellt beide Pfade bereit
app.get('/', (req, res) => fetchSubscribers(res));
app.get('/api/subscribers', (req, res) => fetchSubscribers(res));

app.listen(PORT, () => {
  console.log(`Proxy läuft auf Port ${PORT}`);
});
