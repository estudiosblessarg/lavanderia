import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

import { api } from './api.js';

export async function login(auth, email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function register(auth, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await api('/api/users/register', {
    method: 'POST',
    body: JSON.stringify({
      email: cred.user.email,
      role: 'employee'
    })
  });

  return cred;
}

export async function logout(auth) {
  await signOut(auth);
}
