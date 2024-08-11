import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { usePlaylist } from '../PlaylistContext';

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

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

const SearchBar = styled.input`
  margin-bottom: 10px;
  padding: 10px;
  font-size: 14px;
  background-color: #f4e1c1;
  border: 2px solid #8b7765;
  color: #333;
  font-family: 'Courier New', Courier, monospace;
`;

const ResultsList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  border: 1px solid #8b7765;
  background-color: #f4e1c1;
  margin-right: 20px;
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

const Button = styled.button`
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

const PlaylistSelector = styled.select`
  margin-bottom: 10px;
  padding: 10px;
  font-size: 14px;
  background-color: #f4e1c1;
  border: 2px solid #8b7765;
  color: #333;
  font-family: 'Courier New', Courier, monospace;
`;

const YouTubeSearchApp = ({ onClose }) => {
  const { playlists, addSongToPlaylist } = usePlaylist();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');

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

  const handleAddToPlaylist = (video) => {
    if (selectedPlaylist) {
      addSongToPlaylist(selectedPlaylist, { videoId: video.id.videoId, videoInfo: video.snippet });
    } else {
      alert('Please select a playlist first');
    }
  };

  return (
    <Container>
      <h2>YouTube Music Search</h2>
      <form onSubmit={handleSearch}>
        <SearchBar
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for music..."
        />
      </form>
      <PlaylistSelector 
        value={selectedPlaylist} 
        onChange={(e) => setSelectedPlaylist(e.target.value)}
      >
        <option value="">Select a playlist</option>
        {Object.keys(playlists).map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </PlaylistSelector>
      <ResultsList>
        {searchResults.map((video) => (
          <VideoItem key={video.id.videoId}>
            <VideoInfo>
              <VideoTitle>{video.snippet.title}</VideoTitle>
              <VideoChannel>{video.snippet.channelTitle}</VideoChannel>
            </VideoInfo>
            <Button onClick={() => handleAddToPlaylist(video)}>
              Add to Playlist
            </Button>
          </VideoItem>
        ))}
      </ResultsList>
      <Button onClick={onClose}>Close</Button>
    </Container>
  );
};

export default YouTubeSearchApp;