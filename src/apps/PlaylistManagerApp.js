import React, { useState } from 'react';
import styled from 'styled-components';
import { usePlaylist } from '../PlaylistContext';
import { YouTubePlayerApp, OldRadioPlayerApp } from './index';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  background-color: #f4e1c1;
  border: 2px solid #8b7765;
  box-shadow: 5px 5px 0px #8b7765;
  font-family: 'Courier New', Courier, monospace;
`;

const PlaylistList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
`;

const PlaylistItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #8b7765;
  cursor: pointer;
  &:hover {
    background-color: #e6d0a8;
  }
`;

const SongList = styled.div`
  flex: 2;
  overflow-y: auto;
`;

const SongItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #8b7765;
`;

const Button = styled.button`
  padding: 5px 10px;
  margin: 5px;
  background-color: #8b7765;
  color: white;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: #705d4e;
  }
`;

const PlayerPreferenceSelector = styled.select`
  margin-bottom: 10px;
  padding: 10px;
  font-size: 14px;
  background-color: #f4e1c1;
  border: 2px solid #8b7765;
  color: #333;
  font-family: 'Courier New', Courier, monospace;
`;

const PlaylistManagerApp = ({ onClose, openNewWindow, playerPreference, setPlayerPreference }) => {
  const { playlists, removePlaylist, createPlaylist } = usePlaylist();
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = () => {
    if (newPlaylistName && !playlists[newPlaylistName]) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName('');
    }
  };

  const playPlaylist = (playlistName) => {
    if (playlists[playlistName] && playlists[playlistName].length > 0) {
      openNewWindow(
        playerPreference === 'modern' ? 'YouTubePlayer' : 'OldRadioPlayer',
        playerPreference === 'modern' ? YouTubePlayerApp : OldRadioPlayerApp,
        { 
          playlist: playlists[playlistName], 
          currentIndex: 0, 
        },
        { width: playerPreference === 'modern' ? 376 : 400, height: playerPreference === 'modern' ? 535 : 300 }
      );
    } else {
      console.error('Playlist is empty or does not exist');
    }
  };

  return (
    <Container>
      <h2>Playlist Manager</h2>
      <PlayerPreferenceSelector 
        value={playerPreference} 
        onChange={(e) => setPlayerPreference(e.target.value)}
      >
        <option value="modern">Modern Player</option>
        <option value="vintage">Vintage Radio Player</option>
      </PlayerPreferenceSelector>
      <div>
        <input
          type="text"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          placeholder="New playlist name"
        />
        <Button onClick={handleCreatePlaylist}>Create Playlist</Button>
      </div>
      <PlaylistList>
        <h3>Playlists</h3>
        {Object.entries(playlists).map(([name, tracks]) => (
          <PlaylistItem key={name} onClick={() => setSelectedPlaylist(name)}>
            {name} ({tracks.length} tracks)
            <Button onClick={() => playPlaylist(name)}>Play</Button>
            <Button onClick={() => removePlaylist(name)}>Delete</Button>
          </PlaylistItem>
        ))}
      </PlaylistList>
      {selectedPlaylist && (
        <SongList>
          <h3>{selectedPlaylist}</h3>
          {playlists[selectedPlaylist].map((song, index) => (
            <SongItem key={index}>
              <span>{song.videoInfo.title}</span>
            </SongItem>
          ))}
        </SongList>
      )}
      <Button onClick={onClose}>Close</Button>
    </Container>
  );
};

export default PlaylistManagerApp;