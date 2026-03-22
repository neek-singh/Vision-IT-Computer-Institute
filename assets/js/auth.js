/**
 * ════════════════════════════════════════════
 * auth.js — Vision IT Computer Institute
 * Firebase Auth: login, signup, logout, profile,
 * password reset, photo upload
 * ════════════════════════════════════════════
 */

import { auth, storage } from './firebase-config.js';
import { db }            from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';
import { checkRateLimit } from './db-helpers.js';

// ── Auth state observer ──
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ── Login ──
export async function loginUser(email, password) {
  if (!checkRateLimit('login', 5000)) return;
  return await signInWithEmailAndPassword(auth, email, password);
}

// ── Sign Up ──
export async function signupUser(name, email, password, mobile = '') {
  if (!checkRateLimit('signup', 10000)) return;
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  // Save to Firestore
  await setDoc(doc(db, 'users', cred.user.uid), {
    displayName: name,
    email,
    mobile,
    role:      'student',
    createdAt: serverTimestamp()
  }, { merge: true });
  return cred;
}

// ── Google Sign-In ──
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  // Upsert to Firestore
  await setDoc(doc(db, 'users', cred.user.uid), {
    displayName: cred.user.displayName,
    email:       cred.user.email,
    photoURL:    cred.user.photoURL,
    role:        'student',
    lastLogin:   serverTimestamp()
  }, { merge: true });
  return cred;
}

// ── Logout ──
export async function logoutUser() {
  await signOut(auth);
  window.VIT_USER = null;
}
window.logoutUser = logoutUser;

// ── Password Reset ──
export async function resetPassword(email) {
  return await sendPasswordResetEmail(auth, email);
}

// ── Update Display Name ──
export async function updateDisplayName(name) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not logged in');
  await updateProfile(user, { displayName: name });
  await setDoc(doc(db, 'users', user.uid), { displayName: name }, { merge: true });
}

// ── Upload Profile Photo ──
export async function uploadProfilePhoto(file) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not logged in');

  const MAX = 2 * 1024 * 1024; // 2 MB
  if (file.size > MAX) throw new Error('Photo 2MB se bada nahi hona chahiye');

  const storageRef = ref(storage, `avatars/${user.uid}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  await updateProfile(user, { photoURL: url });
  await setDoc(doc(db, 'users', user.uid), { photoURL: url }, { merge: true });
  return url;
}

// ── Password strength util ──
export function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8)                    score++;
  if (/[A-Z]/.test(password))                  score++;
  if (/[0-9]/.test(password))                  score++;
  if (/[^A-Za-z0-9]/.test(password))           score++;
  const levels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: levels[score] || '' };
}

// ── Toggle password visibility ──
export function togglePwd(inputId, iconId) {
  const inp  = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    if (icon) icon.className = 'fas fa-eye-slash text-sm';
  } else {
    inp.type = 'password';
    if (icon) icon.className = 'fas fa-eye text-sm';
  }
}
window.togglePwd = togglePwd;

// ── Admin check: verify email matches admin list ──
const ADMIN_EMAILS = [
  'visionitpratappur@gmail.com',
  // Add more admin emails here
];

export function isAdmin(user) {
  if (!user) return false;
  return ADMIN_EMAILS.includes(user.email?.toLowerCase());
}

export { auth };
