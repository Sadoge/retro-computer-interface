import React, { useState } from 'react';
import styled from 'styled-components';
import { usePlaylist } from '../PlaylistContext';
import { YouTubePlayerApp, OldRadioPlayerApp } from './index';
import PlaylistImporter from '../PlaylistImporter';

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

const RenameInput = styled.input`
  margin: 5px;
  padding: 5px;
  width: 150px;
`;

const Section = styled.div`
  margin-bottom: 15px;
`;

const SectionHeader = styled.h3`
  cursor: pointer;
  user-select: none;
`;

const CollapsibleContent = styled.div`
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const HorizontalLayout = styled.div`
  display: flex;
  justify-content: space-between;
  height: 300px; // Adjust this value as needed
`;

const PlaylistListSection = styled.div`
  flex: 1;
  margin-right: 15px;
  overflow-y: auto;
`;

const SelectedPlaylistSection = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const PlaylistManagerApp = ({ onClose, openNewWindow, playerPreference, setPlayerPreference }) => {
  const { playlists, removePlaylist, createPlaylist, renamePlaylist } = usePlaylist();
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [renamingPlaylist, setRenamingPlaylist] = useState(null);
  const [newName, setNewName] = useState('');
  const [importSectionOpen, setImportSectionOpen] = useState(false);
  const [createSectionOpen, setCreateSectionOpen] = useState(false);

  const handleCreatePlaylist = () => {
    if (newPlaylistName && !playlists[newPlaylistName]) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName('');
    }
  };

  const handleRenamePlaylist = (oldName) => {
    if (newName && newName !== oldName && !playlists[newName]) {
      renamePlaylist(oldName, newName);
      setRenamingPlaylist(null);
      setNewName('');
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
      
      <Section>
        <SectionHeader onClick={() => setImportSectionOpen(!importSectionOpen)}>
          {importSectionOpen ? '▼' : '▶'} Import Playlist
        </SectionHeader>
        <CollapsibleContent isOpen={importSectionOpen}>
          <PlaylistImporter />
        </CollapsibleContent>
      </Section>
      
      <Section>
        <SectionHeader onClick={() => setCreateSectionOpen(!createSectionOpen)}>
          {createSectionOpen ? '▼' : '▶'} Create New Playlist
        </SectionHeader>
        <CollapsibleContent isOpen={createSectionOpen}>
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="New playlist name"
          />
          <Button onClick={handleCreatePlaylist}>Create Playlist</Button>
        </CollapsibleContent>
      </Section>

      <HorizontalLayout>
        <PlaylistListSection>
          <h3>Playlists</h3>
          <PlaylistList>
            {Object.entries(playlists).map(([name, tracks]) => (
              <PlaylistItem key={name}>
                {renamingPlaylist === name ? (
                  <>
                    <RenameInput
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="New name"
                    />
                    <Button onClick={() => handleRenamePlaylist(name)}>Save</Button>
                    <Button onClick={() => setRenamingPlaylist(null)}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <span onClick={() => setSelectedPlaylist(name === selectedPlaylist ? null : name)}>
                      {name} ({tracks.length} tracks)
                    </span>
                    <Button onClick={() => playPlaylist(name)}>Play</Button>
                    <Button onClick={() => setRenamingPlaylist(name)}>Rename</Button>
                    <Button onClick={() => removePlaylist(name)}>Delete</Button>
                  </>
                )}
              </PlaylistItem>
            ))}
          </PlaylistList>
        </PlaylistListSection>

        <SelectedPlaylistSection>
          {selectedPlaylist && (
            <>
              <h3>{selectedPlaylist}</h3>
              <SongList>
                {playlists[selectedPlaylist].map((song, index) => (
                  <SongItem key={index}>
                    <span>{song.videoInfo.title}</span>
                  </SongItem>
                ))}
              </SongList>
            </>
          )}
        </SelectedPlaylistSection>
      </HorizontalLayout>

      <Button onClick={onClose}>Close</Button>
    </Container>
  );
};

export default PlaylistManagerApp;