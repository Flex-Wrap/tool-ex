import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './config';

// Get a single document by ID
export const getDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    throw error;
  }
};

// Get all documents from a collection
export const getCollection = async (collectionName: string) => {
  try {
    const collRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collRef);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

// Query documents with conditions
export const queryDocuments = async (
  collectionName: string,
  constraints: ReturnType<typeof where>[]
) => {
  try {
    const collRef = collection(db, collectionName);
    const q = query(collRef, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

// Create a new document
export const createDocument = async (
  collectionName: string,
  docId: string,
  data: DocumentData
) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data);
    return { id: docId, ...data };
  } catch (error) {
    throw error;
  }
};

// Update an existing document
export const updateDocument = async (
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
  } catch (error) {
    throw error;
  }
};

// Delete a document
export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    throw error;
  }
};

// Get documents by a single field query
export const getDocumentsByField = async (
  collectionName: string,
  field: string,
  value: unknown
) => {
  try {
    const q = query(collection(db, collectionName), where(field, '==', value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

// Get all documents from a subcollection
export const getSubcollection = async (
  parentCollection: string,
  parentDocId: string,
  subcollectionName: string
) => {
  try {
    const subcollRef = collection(db, parentCollection, parentDocId, subcollectionName);
    const querySnapshot = await getDocs(subcollRef);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

// Create a document in a subcollection
export const createSubcollectionDocument = async (
  parentCollection: string,
  parentDocId: string,
  subcollectionName: string,
  docId: string,
  data: DocumentData
) => {
  try {
    const docRef = doc(db, parentCollection, parentDocId, subcollectionName, docId);
    await setDoc(docRef, data);
    return { id: docId, ...data };
  } catch (error) {
    throw error;
  }
};

// Update a document in a subcollection
export const updateSubcollectionDocument = async (
  parentCollection: string,
  parentDocId: string,
  subcollectionName: string,
  docId: string,
  data: Partial<DocumentData>
) => {
  try {
    const docRef = doc(db, parentCollection, parentDocId, subcollectionName, docId);
    await updateDoc(docRef, data);
  } catch (error) {
    throw error;
  }
};

// Delete a document in a subcollection
export const deleteSubcollectionDocument = async (
  parentCollection: string,
  parentDocId: string,
  subcollectionName: string,
  docId: string
) => {
  try {
    const docRef = doc(db, parentCollection, parentDocId, subcollectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    throw error;
  }
};
