const { getUserByUid, createUserProfile, countUsers } = require('../services/userService');

async function registerUser(req, res) {
  try {
    if (!req.user || !req.user.uid) {
      console.error("[AUTH] req.user inválido:", req.user);
      return res.status(401).json({ error: "No autenticado" });
    }

    const { uid, email } = req.user;

    console.log("[USER] Registrando UID:", uid);

    const userRef = db.collection("users").doc(uid);
    const doc = await userRef.get();

    // 🔍 SI YA EXISTE
    if (doc.exists) {
      console.log("[USER] Ya existe en DB:", uid);
      return res.json(doc.data());
    }

    // 🔥 SI NO EXISTE → CREA AUTOMÁTICAMENTE
    console.log("[USER] No existe, creando...");

    const totalSnapshot = await db.collection("users").get();
    const totalUsers = totalSnapshot.size;

    const role = totalUsers === 0 ? "admin" : "employee";

    const newUser = {
      uid,
      email: email || null,
      role,
      createdAt: new Date()
    };

    await userRef.set(newUser);

    console.log("[USER] Creado correctamente:", newUser);

    return res.status(201).json(newUser);

  } catch (error) {
    console.error("[USER] Error crear usuario:", error);
    return res.status(500).json({
      error: "Error al registrar usuario",
      detail: error.message
    });
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
