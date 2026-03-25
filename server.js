const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Connexion MongoDB
const MONGODB_URL = process.env.MONGODB_URL;
mongoose.connect(MONGODB_URL)
.then(() => console.log('✓ Connecté à MongoDB'))
.catch(err => console.error('✗ Erreur MongoDB:', err));

// Schema pour les bilans
const BilanSchema = new mongoose.Schema({
  id: String,
  name: String,
  date: String,
  time: String,
  data: mongoose.Schema.Types.Mixed,
  created_at: Date,
  updated_at: Date
}, { collection: 'bilans' });

const Bilan = mongoose.model('Bilan', BilanSchema);

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// ===== ENDPOINTS BILANS (MongoDB) =====

// GET tous les bilans
app.get('/api/bilans', async (req, res) => {
  try {
    const bilans = await Bilan.find().sort({ created_at: -1 });
    res.json(bilans);
  } catch (error) {
    console.error('Erreur GET bilans:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST créer un nouveau bilan
app.post('/api/bilans', async (req, res) => {
  try {
    const { id, name, date, time, data } = req.body;
    
    const newBilan = new Bilan({
      id,
      name,
      date,
      time,
      data,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    const saved = await newBilan.save();
    res.json(saved);
  } catch (error) {
    console.error('Erreur POST bilan:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET un bilan spécifique
app.get('/api/bilans/:id', async (req, res) => {
  try {
    const bilan = await Bilan.findOne({ id: req.params.id });
    if (!bilan) {
      return res.status(404).json({ error: 'Bilan non trouvé' });
    }
    res.json(bilan);
  } catch (error) {
    console.error('Erreur GET bilan:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT mettre à jour un bilan
app.put('/api/bilans/:id', async (req, res) => {
  try {
    const { data, name } = req.body;
    
    const bilan = await Bilan.findOneAndUpdate(
      { id: req.params.id },
      { data, name, updated_at: new Date() },
      { new: true }
    );
    
    if (!bilan) {
      return res.status(404).json({ error: 'Bilan non trouvé' });
    }
    res.json(bilan);
  } catch (error) {
    console.error('Erreur PUT bilan:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE un bilan
app.delete('/api/bilans/:id', async (req, res) => {
  try {
    const bilan = await Bilan.findOneAndDelete({ id: req.params.id });
    if (!bilan) {
      return res.status(404).json({ error: 'Bilan non trouvé' });
    }
    res.json({ message: 'Bilan supprimé' });
  } catch (error) {
    console.error('Erreur DELETE bilan:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ENDPOINT CLAUDE =====

app.post('/api/claude', async (req, res) => {
  try {
    const { prompt, type } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'prompt requis' });
    }

    // Choisir le modèle selon le type de requête
    let model = 'claude-opus-4-1';
    let max_tokens = 1500;
    
    if (type === 'correction') {
      // Pour corrections: même modèle mais tokens réduits (économies)
      max_tokens = 300;
    } else if (type === 'resume') {
      max_tokens = 800;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: max_tokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    const text = data.content.map(i => i.text || '').join('\n');
    res.json({ text });
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✓ Serveur lancé sur http://localhost:${PORT}`);
  console.log(`✓ Assurez-vous que ANTHROPIC_API_KEY est défini dans le fichier .env`);
});
