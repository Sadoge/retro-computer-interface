import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const savePlaylistsToCloud = async (playlists) => {
  try {
    await set(ref(database, 'playlists'), playlists);
    console.log('Playlists saved to cloud successfully');
  } catch (error) {
    console.error('Error saving playlists to cloud:', error);
  }
};

export const getPlaylistsFromCloud = async () => {
  try {
    const snapshot = await get(ref(database, 'playlists'));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log('No playlists found in cloud');
      return {};
    }
  } catch (error) {
    console.error('Error getting playlists from cloud:', error);
    return {};
  }
};

export const removePlaylistFromCloud = async (playlistName) => {
  try {
    await remove(ref(database, `playlists/${playlistName}`));
    console.log('Playlist removed from cloud successfully');
  } catch (error) {
    console.error('Error removing playlist from cloud:', error);
  }
};