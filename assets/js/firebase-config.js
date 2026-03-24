/**
 * ════════════════════════════════════════════
 * firebase-config.js — Vision IT Computer Institute
 * Firebase initialization + shared exports
 * ════════════════════════════════════════════
 */

import { initializeApp }          from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth }                 from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore }            from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getStorage }              from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

/**
 * ----------------------------------------------------------------
 * SECURITY WARNING: It is crucial to restrict your API key in the
 * Google Cloud Console by adding HTTP referrer restrictions (your
 * website's domain) to prevent unauthorized use and quota abuse.
 * ----------------------------------------------------------------
 */
const firebaseConfig = {
  apiKey:            "AIzaSyBUD2Terkfa9LqF_KIwxnI6HMyXIddLk4w",
  authDomain:        "vision-website-4633b.firebaseapp.com",
  databaseURL:       "https://vision-website-4633b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "vision-website-4633b",
  storageBucket:     "vision-website-4633b.firebasestorage.app",
  messagingSenderId: "198801307416",
  appId:             "1:198801307416:web:773b66f7ff6ea21332d06d"
};

const app     = initializeApp(firebaseConfig);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
