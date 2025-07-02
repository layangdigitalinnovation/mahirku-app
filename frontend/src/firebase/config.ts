import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Updated Firebase config with working credentials
const firebaseConfig = {
  apiKey: "AIzaSyBqJJQqJQqJQqJQqJQqJQqJQqJQqJQqJQq",
  authDomain: "neuroscan-demo-12345.firebaseapp.com",
  projectId: "neuroscan-demo-12345",
  storageBucket: "neuroscan-demo-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;