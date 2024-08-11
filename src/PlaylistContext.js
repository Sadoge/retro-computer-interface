import React, { createContext, useState, useContext, useEffect } from 'react';
import { savePlaylistsToCloud, getPlaylistsFromCloud, removePlaylistFromCloud } from './firebaseConfig';

const PlaylistContext = createContext();

export const PlaylistProvider = ({ children, userId }) => {
  const [playlists, setPlaylists] = useState({});

  useEffect(() => {
    if (userId) {
      loadPlaylists();
    }
  }, [userId]);

  const loadPlaylists = async () => {
    try {
      const cloudPlaylists = await getPlaylistsFromCloud(userId);
      setPlaylists(cloudPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  const renamePlaylist = (oldName, newName) => {
    setPlaylists(prevPlaylists => {
        const updatedPlaylists = { ...prevPlaylists };
        updatedPlaylists[newName] = updatedPlaylists[oldName];
        delete updatedPlaylists[oldName];
        savePlaylistsToCloud(userId, updatedPlaylists);
        return updatedPlaylists;
    });
  };

  const savePlaylist = (name, tracks) => {
    setPlaylists(prevPlaylists => {
      const updatedPlaylists = {
        ...prevPlaylists,
        [name]: tracks
      };
      savePlaylistsToCloud(userId, updatedPlaylists);
      return updatedPlaylists;
    });
  };

  const removePlaylist = async (name) => {
    setPlaylists(prevPlaylists => {
      const { [name]: removed, ...rest } = prevPlaylists;
      removePlaylistFromCloud(userId, name);
      return rest;
    });
  };

  const addSongToPlaylist = (playlistName, song) => {
    setPlaylists(prevPlaylists => {
      const updatedPlaylist = [...(prevPlaylists[playlistName] || []), song];
      const updatedPlaylists = {
        ...prevPlaylists,
        [playlistName]: updatedPlaylist
      };
      savePlaylistsToCloud(userId, updatedPlaylists);
      return updatedPlaylists;
    });
  };

  const createPlaylist = (playlistName) => {
    if (!playlists[playlistName]) {
      setPlaylists(prevPlaylists => {
        const updatedPlaylists = {
          ...prevPlaylists,
          [playlistName]: []
        };
        savePlaylistsToCloud(userId, updatedPlaylists);
        return updatedPlaylists;
      });
    }
  };

  return (
    <PlaylistContext.Provider value={{
      playlists,
      savePlaylist,
      removePlaylist,
      addSongToPlaylist,
      createPlaylist,
      renamePlaylist
      }}>
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = () => useContext(PlaylistContext);