const { db } = require('../config/firebase');

async function getUserByUid(uid) {
  const snapshot = await db.collection('users').doc(uid).get();
  return snapshot.exists ? snapshot.data() : null;
}

async function createUserProfile({ uid, email, role }) {
  const userRef = db.collection('users').doc(uid);
  const userData = {
    uid,
    email,
    role,
    createdAt: new Date().toISOString()
  };
  await userRef.set(userData);
  console.log('[USER SERVICE] Perfil creado:', uid, role);
  return userData;
}

async function countUsers() {
  const snapshot = await db.collection('users').get();
  return snapshot.size;
}

module.exports = {
  getUserByUid,
  createUserProfile,
  countUsers
};
