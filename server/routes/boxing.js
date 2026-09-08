const express = require('express');
const router = express.Router();
const data = require('../../lib/boxing-data');
const { resultsData, resultsUpdated } = require('../../lib/results-data');

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.get('/results/boxingscene', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ results: resultsData, updated: resultsUpdated });
});

router.get('/content', (req, res) => {
  res.json(data.getContent());
});

router.get('/fighters', (req, res) => res.json(data.fighters));

router.get('/fighters/:country', (req, res) => {
  const list = data.fighters.filter((f) => f.country === req.params.country.toUpperCase());
  res.json(list);
});

router.get('/rankings', (req, res) => res.json(data.rankings));

router.get('/hero', (req, res) => res.json(data.heroSlides));

router.get('/tabs', (req, res) => res.json(data.tabs));

router.get('/upcoming', (req, res) => res.json(data.upcomingFights));

router.get('/previous', (req, res) => res.json(data.previousEvents));

module.exports = router;