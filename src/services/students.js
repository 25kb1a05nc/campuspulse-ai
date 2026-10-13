
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

import { db, firebaseConfigured } from '../firebase';
import { demoStudents } from '../data/students';

export async function loadStudents() {
  if (!firebaseConfigured || !db) {
    return demoStudents;
  }

  try {
    const snap = await getDocs(collection(db, 'students'));

    if (snap.empty) {
      return demoStudents;
    }

    return snap.docs.map(doc => ({
      ...doc.data(),
      id: doc.data().studentId || doc.id
    }));
  } catch (error) {
    console.error('Firestore load failed:', error);

    // Keep the dashboard usable during the hackathon demo.
    return demoStudents;
  }
}

export async function saveStudent(student) {
  if (!firebaseConfigured || !db) {
    throw new Error(
      'Firebase is not configured. Demo data is read-only in local mode.'
    );
  }

  const { id, ...data } = student;

  const ref = await addDoc(collection(db, 'students'), {
    ...data,
    studentId: id,
    createdAt: serverTimestamp(),
    dataType: 'synthetic-demo'
  });

  return { ...student, id: ref.id };
}

export async function seedStudents() {
  if (!firebaseConfigured || !db) {
    return 'Firebase is not configured; local demo data is active.';
  }

  const snap = await getDocs(collection(db, 'students'));

  if (!snap.empty) {
    return 'Firestore already has records; seed skipped.';
  }

  for (const student of demoStudents) {
    const { id, ...data } = student;

    await addDoc(collection(db, 'students'), {
      ...data,
      studentId: id,
      createdAt: serverTimestamp(),
      dataType: 'synthetic-demo'
    });
  }

  return 'Synthetic demo records saved to Firestore.';
}
