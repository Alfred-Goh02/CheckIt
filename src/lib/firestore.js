import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Save favorites to Firestore
export const saveFavoritesToFirestore = async (userId, section, favorites) => {
  try {
    // Save or update the document in the user's favorites subcollection
    await setDoc(doc(db, 'users', userId, 'favorites', section), { favorites }, { merge: true });
    console.log(`${section} favorites saved to Firestore`);
  } catch (error) {
    console.error(`Failed to save ${section} favorites to Firestore:`, error);
  }
};

// Retrieve favorites from Firestore
export const getFavoritesFromFirestore = async (userId, section) => {
  try {
    // Reference to the document in the user's favorites subcollection
    const docRef = doc(db, 'users', userId, 'favorites', section);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Return the favorites data if the document exists
      return docSnap.data().favorites || {};
    } else {
      // Log if no favorites found and return an empty object
      console.log(`No ${section} favorites found in Firestore`);
      return {};
    }
  } catch (error) {
    console.error(`Failed to retrieve ${section} favorites from Firestore:`, error);
    return {};
  }
};

