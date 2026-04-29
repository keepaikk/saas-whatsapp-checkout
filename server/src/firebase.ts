/**
 * Firebase Admin SDK stub
 *
 * When migrating from local JSON DB to Firebase:
 * 1. Uncomment the import below
 * 2. Uncomment the initializeApp block
 * 3. Wrap JSON DB calls in conditional: if (process.env.FIREBASE_PROJECT_ID) use Firebase, else use JsonDb
 *
 * ⚠️ NEVER commit real credentials. Set FIREBASE_* vars via Dokploy env panel.
 */

// import admin from 'firebase-admin';

// const app = admin.initializeApp({
//   credential: admin.credential.cert({
//     projectId: process.env.FIREBASE_PROJECT_ID,
//     privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//     clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//   }),
//   databaseURL: process.env.FIREBASE_DATABASE_URL,
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
// });

// export const db = admin.firestore(app);
// export const storage = admin.storage(app);

export {};
