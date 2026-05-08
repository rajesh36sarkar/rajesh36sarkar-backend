const express = require('express');
const ContactMessage = require('../models/ContactMessage');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Public: Submit contact form (saves to DB, tries email but doesn't block)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // 1. Save to database (critical)
    const newMessage = new ContactMessage({ name, email, subject, message });
    await newMessage.save();
    console.log('Message saved to DB, id:', newMessage._id);
    
    // 2. Attempt to send email (non‑blocking)
    try {
      const sendContactEmail = require('../utils/mailer');
      await sendContactEmail({ name, email, subject, message });
      console.log('Email sent successfully');
    } catch (emailErr) {
      console.error('Email error (non‑blocking):', emailErr.message);
      // Do not fail the response
    }
    
    res.status(201).json({ message: 'Thank you! Your message has been received.' });
  } catch (error) {
    console.error('Contact form critical error:', error);
    res.status(500).json({ message: 'Server error. Could not save your message.' });
  }
});

// Admin routes (unchanged)...
router.get('/', authMiddleware, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;