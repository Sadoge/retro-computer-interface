import React, { useState } from 'react';
import styled from 'styled-components';
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

const PlaylistManagerApp = ({ playlists, savePlaylist, removePlaylist, removeSongFromPlaylist, onClose, openNewWindow }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = () => {
    if (newPlaylistName && !playlists[newPlaylistName]) {
      savePlaylist(newPlaylistName, []);
      setNewPlaylistName('');
    }
  };

  const playPlaylist = (playlistName) => {
    if (playlists[playlistName] && playlists[playlistName].length > 0) {
      console.log('Opening YouTube Player with playlist:', playlists[playlistName]);
      openNewWindow('OldRadioPlayer', OldRadioPlayerApp, { 
        playlist: playlists[playlistName], 
        currentIndex: 0, 
        onClose: () => {} 
      }, { width: 376, height: 535 });
      // openNewWindow('YouTubePlayer', YouTubePlayerApp, { 
      //   playlist: playlists[playlistName], 
      //   currentIndex: 0, 
      //   onClose: () => {} 
      // }, { width: 376, height: 535 });
    } else {
      console.error('Playlist is empty or does not exist');
    }
  };

  return (
    <Container>
      <h2>Playlist Manager</h2>
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
              <Button onClick={() => removeSongFromPlaylist(selectedPlaylist, index)}>Remove</Button>
            </SongItem>
          ))}
        </SongList>
      )}
      <Button onClick={onClose}>Close</Button>
    </Container>
  );
};

export default PlaylistManagerApp;