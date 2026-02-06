require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const leadsRoutes = require('./routes/leads');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');
const galleryRoutes = require('./routes/gallery');
const auditRoutes = require('./routes/audit');
const chatbotRoutes = require('./routes/chatbot');
const rpaRoutes = require('./routes/rpa');
const backupRoutes = require('./routes/backup');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.appUrl || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '300kb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/rpa', rpaRoutes);
app.use('/api/backup', backupRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || process.env.BACKEND_PORT || 5000;
(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
})();
