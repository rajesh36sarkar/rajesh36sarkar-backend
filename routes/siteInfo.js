const express = require('express');
const SiteInfo = require('../models/SiteInfo');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Public: Get site info
router.get('/', async (req, res) => {
  try {
    let siteInfo = await SiteInfo.findOne();
    if (!siteInfo) {
      // Create default if doesn't exist
      siteInfo = new SiteInfo({
        hero: {
          name: 'John Doe',
          title: 'Full Stack Developer',
          bio: 'Building amazing web experiences',
        },
        skills: [],
        social: {},
      });
      await siteInfo.save();
    }
    res.json(siteInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update site info
router.put('/', authMiddleware, async (req, res) => {
  try {
    let siteInfo = await SiteInfo.findOne();
    if (!siteInfo) {
      siteInfo = new SiteInfo(req.body);
    } else {
      Object.assign(siteInfo, req.body);
      siteInfo.updatedAt = Date.now();
    }
    await siteInfo.save();
    res.json(siteInfo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;