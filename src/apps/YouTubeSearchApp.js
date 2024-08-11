import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { usePlaylist } from '../PlaylistContext';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://invidious.jing.rocks/api/v1/search`, {
        params: {
          q: searchTerm,
          type: 'video',
          sort_by: 'relevance',
        },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching videos:', error);
      setError('Failed to fetch search results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToPlaylist = (video) => {
    if (selectedPlaylist) {
      addSongToPlaylist(selectedPlaylist, { 
        videoId: video.videoId, 
        videoInfo: { 
          title: video.title,
          channelTitle: video.author,
          thumbnailUrl: video.thumbnailUrl
        } 
      });
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
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ResultsList>
        {searchResults.map((video) => (
          <VideoItem key={video.videoId}>
            <VideoInfo>
              <VideoTitle>{video.title}</VideoTitle>
              <VideoChannel>{video.author}</VideoChannel>
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