const { computeMetrics } = require('../services/metricsService');

async function getMetrics(req, res) {
  try {
    const metrics = await computeMetrics();
    console.log('[METRICS] Métricas calculadas');
    return res.json(metrics);
  } catch (error) {
    console.error('[METRICS] Error calcular métricas:', error.message);
    return res.status(500).json({ error: 'Error al calcular métricas' });
  }
}

module.exports = {
  getMetrics
};
