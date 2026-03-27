const { admin, db } = require('../config/firebase');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    console.log('[AUTH] Token no enviado');
    return res.status(401).json({ error: 'Token no enviado' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      console.log('[AUTH] Usuario no registrado en Firestore:', decodedToken.uid);
      return res.status(401).json({ error: 'Usuario no registrado' });
    }

    const userData = userDoc.data();
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role || 'employee'
    };
    console.log('[AUTH] Usuario autenticado:', req.user.uid, req.user.role);
    next();
  } catch (error) {
    console.error('[AUTH] Error de verificación de token:', error.message);
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = authMiddleware;
