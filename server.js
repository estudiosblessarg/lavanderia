const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const configRoutes = require('./src/routes/configRoutes');
const userRoutes = require('./src/routes/userRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const metricRoutes = require('./src/routes/metricRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= STATIC FRONTEND =================
// Sirve archivos desde /public (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store'); // evita cache en WebView
  }
}));

// ================= HEALTH =================
app.get('/health', (req, res) => {
  console.log('[SERVER] Health check');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ================= API =================
app.use('/api/config', configRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/metrics', metricRoutes);

// ================= SPA FALLBACK =================
// Cualquier ruta que no sea /api devuelve index.html
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) return next();

  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error('[SERVER] Error middleware:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Server error'
  });
});

// ================= START =================
app.listen(PORT, () => {
  console.log(`[SERVER] Backend iniciado en http://localhost:${PORT}`);
});
