/**
 * ════════════════════════════════════════════
 * db-helpers.js — Vision IT Computer Institute
 * Firestore CRUD helpers shared across all pages
 * ════════════════════════════════════════════
 */

import { db, storage } from './firebase-config.js';
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  deleteDoc, setDoc, query, orderBy, where, limit,
  serverTimestamp, increment, onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import {
  ref, uploadBytesResumable, getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

// ── Re-export Firestore primitives so pages don't need to import them separately ──
export {
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  deleteDoc, setDoc, query, orderBy, where, limit,
  serverTimestamp, increment, onSnapshot,
  ref, uploadBytesResumable, getDownloadURL
};

// ════════════════════════════════════════════
// COURSES
// ════════════════════════════════════════════

/** Fetch all courses ordered by name */
export async function fetchCourses() {
  try {
    const snap = await getDocs(query(collection(db, 'courses'), orderBy('name', 'asc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('fetchCourses:', e);
    return [];
  }
}

/** Add or update a course */
export async function saveCourse(data, id = null) {
  if (id) {
    await updateDoc(doc(db, 'courses', id), { ...data, updatedAt: serverTimestamp() });
  } else {
    await addDoc(collection(db, 'courses'), { ...data, createdAt: serverTimestamp() });
  }
}

/** Delete a course */
export async function deleteCourse(id) {
  await deleteDoc(doc(db, 'courses', id));
}

// ════════════════════════════════════════════
// BLOGS
// ════════════════════════════════════════════

/** Fetch all published blogs */
export async function fetchBlogs() {
  try {
    const snap = await getDocs(query(collection(db, 'blogs'), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('fetchBlogs:', e);
    return [];
  }
}

/** Add or update a blog post */
export async function saveBlog(data, id = null) {
  if (id) {
    await updateDoc(doc(db, 'blogs', id), { ...data, updatedAt: serverTimestamp() });
  } else {
    await addDoc(collection(db, 'blogs'), {
      ...data, likes: 0, comments: 0, createdAt: serverTimestamp()
    });
  }
}

/** Delete a blog post */
export async function deleteBlog(id) {
  await deleteDoc(doc(db, 'blogs', id));
}

/** Load comments for a blog */
export async function fetchComments(blogId) {
  try {
    const snap = await getDocs(
      query(collection(db, `blogs/${blogId}/comments`), orderBy('timestamp', 'asc'))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('fetchComments:', e);
    return [];
  }
}

/** Add comment to a blog */
export async function addComment(blogId, text, user) {
  await addDoc(collection(db, `blogs/${blogId}/comments`), {
    text,
    userId:    user.uid,
    userName:  user.displayName || user.email?.split('@')[0] || 'User',
    userEmail: user.email,
    timestamp: serverTimestamp()
  });
  try { await updateDoc(doc(db, 'blogs', blogId), { comments: increment(1) }); } catch {}
}

/** Delete a comment */
export async function deleteComment(blogId, cmtId) {
  await deleteDoc(doc(db, `blogs/${blogId}/comments`, cmtId));
  try { await updateDoc(doc(db, 'blogs', blogId), { comments: increment(-1) }); } catch {}
}

/** Toggle like on a blog post */
export async function toggleLike(blogId, userId) {
  const likeRef = doc(db, `blogs/${blogId}/likes`, userId);
  const blogRef = doc(db, 'blogs', blogId);
  const ls = await getDoc(likeRef);
  if (ls.exists()) {
    await deleteDoc(likeRef);
    try { await updateDoc(blogRef, { likes: increment(-1) }); } catch {}
    return false; // unliked
  } else {
    await setDoc(likeRef, { userId, timestamp: serverTimestamp() });
    try { await updateDoc(blogRef, { likes: increment(1) }); } catch {}
    return true; // liked
  }
}

// ════════════════════════════════════════════
// GALLERY
// ════════════════════════════════════════════

/** Fetch gallery images */
export async function fetchGallery() {
  try {
    const snap = await getDocs(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('fetchGallery:', e);
    return [];
  }
}

/** Add gallery image */
export async function addGalleryItem(data) {
  return await addDoc(collection(db, 'gallery'), { ...data, createdAt: serverTimestamp() });
}

/** Delete gallery item */
export async function deleteGalleryItem(id) {
  await deleteDoc(doc(db, 'gallery', id));
}

// ════════════════════════════════════════════
// ADMISSIONS
// ════════════════════════════════════════════

/** Submit admission inquiry */
export async function submitAdmission(data) {
  return await addDoc(collection(db, 'admission_queries'), {
    ...data,
    trackerStatus: 'new',
    timestamp:     serverTimestamp()
  });
}

/** Fetch all admissions (admin) */
export async function fetchAdmissions() {
  try {
    const snap = await getDocs(
      query(collection(db, 'admission_queries'), orderBy('timestamp', 'desc'))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('fetchAdmissions:', e);
    return [];
  }
}

/** Update admission status */
export async function updateAdmissionStatus(id, status) {
  await updateDoc(doc(db, 'admission_queries', id), {
    trackerStatus: status,
    updatedAt:     serverTimestamp()
  });
}

// ════════════════════════════════════════════
// CONTACTS
// ════════════════════════════════════════════

/** Submit contact message */
export async function submitContact(data) {
  return await addDoc(collection(db, 'contacts'), {
    ...data,
    timestamp: serverTimestamp()
  });
}

/** Fetch all contacts (admin) */
export async function fetchContacts() {
  try {
    const snap = await getDocs(
      query(collection(db, 'contacts'), orderBy('timestamp', 'desc'))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('fetchContacts:', e);
    return [];
  }
}

// ════════════════════════════════════════════
// SITE SETTINGS (Top Banner, etc.)
// ════════════════════════════════════════════

const BANNER_DOC = 'top_banner';

/** Load top banner settings */
export async function loadBannerSettings() {
  try {
    const snap = await getDoc(doc(db, 'site_settings', BANNER_DOC));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error('loadBannerSettings:', e);
    return null;
  }
}

/** Save top banner settings */
export async function saveBannerSettings(data) {
  await setDoc(doc(db, 'site_settings', BANNER_DOC), {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// ════════════════════════════════════════════
// APP SETTINGS (APK links)
// ════════════════════════════════════════════

/** Get app settings */
export async function getAppSettings(type) {
  try {
    const snap = await getDoc(doc(db, 'app_settings', type));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    return null;
  }
}

/** Save app settings */
export async function saveAppSettings(type, data) {
  await setDoc(doc(db, 'app_settings', type), {
    ...data, updatedAt: serverTimestamp()
  }, { merge: true });
}

// ════════════════════════════════════════════
// FILE UPLOAD (APK / Images)
// ════════════════════════════════════════════

/**
 * Upload a file with progress callback
 * @param {File} file
 * @param {string} path - storage path
 * @param {function} onProgress - (pct) => void
 * @returns {Promise<string>} downloadURL
 */
export function uploadFile(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      'state_changed',
      snap => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        if (onProgress) onProgress(pct, snap);
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

// ════════════════════════════════════════════
// INQUIRY TRACKER
// ════════════════════════════════════════════

/** Track an inquiry by mobile number */
export async function trackInquiry(mobile) {
  try {
    const snap = await getDocs(
      query(collection(db, 'admission_queries'), where('mobile', '==', mobile), limit(5))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('trackInquiry:', e);
    return [];
  }
}

// ════════════════════════════════════════════
// CERTIFICATES
// ════════════════════════════════════════════

/** Verify certificate by ID */
export async function verifyCertificate(certId) {
  try {
    const snap = await getDoc(doc(db, 'certificates', certId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (e) {
    return null;
  }
}

// ════════════════════════════════════════════
// STUDENT RESULTS
// ════════════════════════════════════════════

/** Get results for a student */
export async function getStudentResults(uid) {
  try {
    const snap = await getDocs(
      query(collection(db, 'results'), where('userId', '==', uid), orderBy('createdAt', 'desc'))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
}

// ════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════

/** Format bytes to human-readable string */
export function formatBytes(bytes) {
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/** Sanitize HTML to prevent XSS */
export function sanitizeForHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Rate limit helper — prevent form spam */
const _rateLimits = {};
export function checkRateLimit(key, ms = 60000) {
  const now = Date.now();
  if (_rateLimits[key] && now - _rateLimits[key] < ms) {
    window.toast?.('Thoda wait karein — baar baar submit mat karein', 'err');
    return false;
  }
  _rateLimits[key] = now;
  return true;
}

/** Validate Indian mobile number */
export function isValidMobile(mobile) {
  return /^[6-9]\d{9}$/.test(mobile.replace(/\D/g, ''));
}
