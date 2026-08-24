const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;
const CHANNEL_ID = 'UC6fnWNbHioiwZwf5OiTAaUA';

async function fetchSubscribers(res) {
  try {
    // Ruft die interne YouTube-Web-API ab, die ungerundete Werte nutzt
    const response = await axios.post(
      `https://www.youtube.com/youtubei/v1/browse?key=YAIzaSyAO_C2f3A-13_a-z_1234567890`,
      {
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240101.00.00"
          }
        },
        browseId: CHANNEL_ID
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      }
    );

    const jsonString = JSON.stringify(response.data);
    
    // Sucht im Datenstrom nach der ungefilterten Abonnenten-Zeile
    const match = jsonString.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"/);

    if (match && match[1]) {
      const exactNumber = match[1].replace(/[^0-9]/g, '');
      if (exactNumber) {
        return res.json({ exactSubscribers: parseInt(exactNumber, 10) });
      }
    }

    // Fallback auf Socialcounts-Dienst über Server
    const scResponse = await axios.get(`https://api.socialcounts.org/youtube-live-subscriber-count/${CHANNEL_ID}`);
    if (scResponse.data && scResponse.data.counters && scResponse.data.counters[0]) {
      return res.json({ exactSubscribers: scResponse.data.counters[0] });
    }

    res.status(404).json({ error: 'Exakte Zahl konnte nicht ausgelesen werden' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Abrufen', details: error.message });
  }
}

app.get('/', (req, res) => fetchSubscribers(res));
app.get('/api/subscribers', (req, res) => fetchSubscribers(res));

app.listen(PORT, () => {
  console.log(`Proxy läuft auf Port ${PORT}`);
});
