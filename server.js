const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files
app.use(express.static(__dirname));

// MongoDB Schema
const trackerSchema = new mongoose.Schema({
  docId: { type: String, default: 'main', unique: true },
  habits: { type: Array, default: [] },
  checks: { type: Object, default: {} },
  currentYear: { type: Number, default: new Date().getFullYear() },
  currentMonth: { type: Number, default: new Date().getMonth() }
}, { minimize: false }); // minimize: false keeps empty objects like checks: {}

const Tracker = mongoose.model('Tracker', trackerSchema);

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// GET /api/data — Load data from MongoDB
app.get('/api/data', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    let doc = await Tracker.findOne({ docId: 'main' });
    if (!doc) {
      // First time: create a default document
      doc = await Tracker.create({
        docId: 'main',
        habits: [],
        checks: {},
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth()
      });
    }
    res.json({
      habits: doc.habits,
      checks: doc.checks,
      currentYear: doc.currentYear,
      currentMonth: doc.currentMonth
    });
  } catch (err) {
    console.error('Error loading data:', err);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// POST /api/data — Save data to MongoDB
const payloadSchema = z.object({
  habits: z.array(z.any()),
  checks: z.record(z.string(), z.boolean()),
  currentYear: z.number().int(),
  currentMonth: z.number().int()
});

app.post('/api/data', async (req, res) => {
  try {
    const parsedData = payloadSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ error: 'Invalid data format', details: parsedData.error.issues });
    }
    const { habits, checks, currentYear, currentMonth } = parsedData.data;
    await Tracker.findOneAndUpdate(
      { docId: 'main' },
      { habits, checks, currentYear, currentMonth },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving data:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
