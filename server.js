const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const configRoutes = require('./src/routes/configRoutes');
const userRoutes = require('./src/routes/userRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const metricRoutes = require('./src/routes/metricRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  console.log('[SERVER] Health check');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/config', configRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/metrics', metricRoutes);

app.use((err, req, res, next) => {
  console.error('[SERVER] Error middleware:', err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`[SERVER] Backend iniciado en http://localhost:${PORT}`);
});
