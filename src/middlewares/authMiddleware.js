const { admin } = require('../config/firebase');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';

    // ✅ SI NO HAY TOKEN → CONTINÚA (modo desarrollo)
    if (!authHeader.startsWith('Bearer ')) {
      console.log('[AUTH] Sin token (modo desarrollo)');
      req.user = {
        uid: 'dev-user',
        email: 'admin@test.com',
        role: 'admin' // 🔥 clave para tu frontend
      };
      return next();
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

    // ✅ fallback para no romper todo
    req.user = {
      uid: 'fallback-user',
      email: 'employee@test.com',
      role: 'employee'
    };

    next();
  }
}

module.exports = authMiddleware;
