import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Save favorites to Firestore
export const saveFavoritesToFirestore = async (userId, section, favorites) => {
  try {
    await setDoc(doc(db, 'users', userId, 'favorites', section), { favorites }, { merge: true });
    console.log(`${section} favorites saved to Firestore`);
  } catch (error) {
    console.error(`Failed to save ${section} favorites to Firestore:`, error);
  }
};

// Retrieve favorites from Firestore
export const getFavoritesFromFirestore = async (userId, section) => {
  try {
    const docRef = doc(db, 'users', userId, 'favorites', section);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().favorites || [];
    } else {
      console.log(`No ${section} favorites found in Firestore`);
      return [];
    }
  } catch (error) {
    console.error(`Failed to retrieve ${section} favorites from Firestore:`, error);
    return [];
  }
};
