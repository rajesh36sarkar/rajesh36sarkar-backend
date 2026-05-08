const express = require('express');
const ContactMessage = require('../models/ContactMessage');
const authMiddleware = require('../middleware/auth');
const sendContactEmail = require('../utils/mailer');
const router = express.Router();

// Public: Submit contact form (sends email + saves to DB)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Save to database (for admin panel)
    const newMessage = new ContactMessage({ name, email, subject, message });
    await newMessage.save();
    
    // Send email notifications
    await sendContactEmail({ name, email, subject, message });
    
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
});

// Admin: Get all messages
router.get('/', authMiddleware, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Mark message as read
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

// Admin: Delete message
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;