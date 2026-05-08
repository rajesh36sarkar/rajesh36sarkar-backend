const mongoose = require('mongoose');

const siteInfoSchema = new mongoose.Schema({
  hero: {
    name: String,
    title: String,
    bio: String,
    profileImage: String,
    resumeUrl: String,
  },
  about: {
    description: String,
    experience: Number,
    projects: Number,
    clients: Number,
  },
  skills: [{
    name: String,
    level: Number, // 1-100
    icon: String,
  }],
  social: {
    github: String,
    linkedin: String,
    twitter: String,
    email: String,
  },
  contactEmail: String,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('SiteInfo', siteInfoSchema);