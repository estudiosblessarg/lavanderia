const { getUserByUid, createUserProfile, countUsers } = require('../services/userService');

async function registerUser(req, res) {
  const { uid, email } = req.user;
  try {
    const existing = await getUserByUid(uid);
    if (existing) {
      console.log('[USER] Usuario ya existe:', uid);
      return res.json(existing);
    }

    const totalUsers = await countUsers();
    const role = totalUsers === 0 ? 'admin' : 'employee';
    const profile = await createUserProfile({ uid, email, role });
    return res.status(201).json(profile);
  } catch (error) {
    console.error('[USER] Error crear usuario:', error.message);
    return res.status(500).json({ error: 'Error al registrar usuario' });
  }
}

async function getUserProfile(req, res) {
  const { uid } = req.user;
  try {
    const profile = await getUserByUid(uid);
    if (!profile) {
      console.log('[USER] Perfil no encontrado:', uid);
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    res.json(profile);
  } catch (error) {
    console.error('[USER] Error obtener perfil:', error.message);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
}

module.exports = {
  registerUser,
  getUserProfile
};
