const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL, // your frontend deployment URL (e.g., https://portfolio-frontend.vercel.app)
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/projects', require('./routes/projects'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/site-info', require('./routes/siteInfo'));
app.use('/api/contact', require('./routes/contact'));

// ✅ Root route – fixes 404 on base URL
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Rajesh36sarkar Backend API is running! 🚀',
    status: 'success',
    timestamp: new Date().toISOString(),
    endpoints: {
      projects: '/api/projects',
      admin: '/api/admin/login',
      contact: '/api/contact',
      siteInfo: '/api/site-info'
    }
  });
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});