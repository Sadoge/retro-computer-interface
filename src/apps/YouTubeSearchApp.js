import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { YouTubePlayerApp } from './index';

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  background-color: #f4e1c1; /* Light beige color */
  border: 2px solid #8b7765; /* Brown border */
  box-shadow: 5px 5px 0px #8b7765; /* Vintage shadow effect */
  font-family: 'Courier New', Courier, monospace; /* Retro font */
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: transparent;
  border: none;
  color: #8b7765;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    color: #4e463a;
  }
`;

const SearchBar = styled.input`
  margin-bottom: 10px;
  padding: 10px;
  font-size: 14px;
  background-color: #f4e1c1;
  border: 2px solid #8b7765;
  color: #333;
  font-family: 'Courier New', Courier, monospace;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-grow: 1;
  overflow: hidden;
`;

const ResultsList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  border: 1px solid #8b7765;
  background-color: #f4e1c1;
  margin-right: 20px; /* Space between results and playlist */
`;

const VideoItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  font-family: 'Courier New', Courier, monospace;
  &:hover {
    background-color: #ddd;
  }
`;

const VideoInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 10px;
`;

const VideoTitle = styled.div`
  font-weight: bold;
  font-size: 14px;
`;

const VideoChannel = styled.div`
  font-size: 12px;
  color: #666;
`;

const AddToPlaylistButton = styled.button`
  margin-left: auto;
  padding: 5px 10px;
  background-color: #8b7765;
  color: white;
  border: none;
  cursor: pointer;
  font-family: 'Courier New', Courier, monospace;
  border-radius: 3px;

  &:hover {
    background-color: #705d4e;
  }

  &:active {
    background-color: #4e463a;
  }
`;

const PlaylistContainer = styled.div`
  width: 300px; /* Fixed width for the playlist */
  max-height: 100%;
  overflow-y: auto;
  border: 1px solid #8b7765;
  background-color: #f4e1c1;
`;

const PlaylistItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #8b7765;
  font-family: 'Courier New', Courier, monospace;

  &:hover {
    background-color: #ddd;
  }
`;

const YouTubeSearchApp = ({ openNewWindow, onClose, playlists, savePlaylist }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [playlistName, setPlaylistName] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          part: 'snippet',
          q: searchTerm,
          type: 'video',
          videoCategoryId: '10',
          key: API_KEY,
        },
      });
      setSearchResults(response.data.items);
    } catch (error) {
      console.error('Error searching videos:', error);
    }
  };

  const addToPlaylist = (video) => {
    setCurrentPlaylist([...currentPlaylist, { videoId: video.id.videoId, videoInfo: video.snippet }]);
  };

  const saveCurrentPlaylist = () => {
    if (playlistName && currentPlaylist.length > 0) {
      savePlaylist(playlistName, currentPlaylist);
      setPlaylistName('');
      setCurrentPlaylist([]);
    }
  };

  const playPlaylist = () => {
    if (currentPlaylist.length > 0) {
      openNewWindow('YouTubePlayer', YouTubePlayerApp, { playlist: currentPlaylist, currentIndex: 0, onClose }, { width: 376, height: 535 });
    }
  };

  return (
    <Container>
      <CloseButton onClick={onClose}>×</CloseButton>
      <h2>YouTube Music Search</h2>
      <form onSubmit={handleSearch}>
        <SearchBar
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for music..."
        />
      </form>
      <ContentContainer>
        <ResultsList>
          {searchResults.map((video) => (
            <VideoItem key={video.id.videoId}>
              <VideoInfo>
                <VideoTitle>{video.snippet.title}</VideoTitle>
                <VideoChannel>{video.snippet.channelTitle}</VideoChannel>
              </VideoInfo>
              <AddToPlaylistButton onClick={() => addToPlaylist(video)}>
                Add to Playlist
              </AddToPlaylistButton>
            </VideoItem>
          ))}
        </ResultsList>
        <PlaylistContainer>
          <h3>Current Playlist</h3>
          {currentPlaylist.map((item, index) => (
            <PlaylistItem key={index}>
              <span>{item.videoInfo.title}</span>
            </PlaylistItem>
          ))}
          <input
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="Playlist name"
          />
          <button onClick={saveCurrentPlaylist}>Save Playlist</button>
          {currentPlaylist.length > 0 && (
            <button onClick={playPlaylist}>Play Playlist</button>
          )}
        </PlaylistContainer>
      </ContentContainer>
    </Container>
  );
};

export default YouTubeSearchApp;