// middlewares/authMiddleware.js

const { admin } = require('../config/firebase');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      console.log('[AUTH] Header inválido');
      return res.status(401).json({ error: 'No autorizado' });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      console.log('[AUTH] Token vacío');
      return res.status(401).json({ error: 'Token requerido' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null
    };

    console.log('[AUTH] OK:', req.user.uid);

    next();

  } catch (error) {
    console.error('[AUTH] Error:', error.message);
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = authMiddleware;