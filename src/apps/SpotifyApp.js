import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SpotifyWebApi from 'spotify-web-api-js';
import CDPlayer from './CDPlayer';

const spotifyApi = new SpotifyWebApi();

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  font-family: 'Tahoma', sans-serif;
`;

const SearchBar = styled.input`
  margin-bottom: 10px;
  padding: 5px;
  font-family: 'Tahoma', sans-serif;
  border: 1px solid #999;
`;

const ResultsList = styled.div`
  overflow-y: auto;
  flex-grow: 1;
  border: 1px solid #999;
  background-color: white;
`;

const TrackItem = styled.div`
  display: flex;
  align-items: center;
  padding: 5px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  &:hover {
    background-color: #e8e8e8;
  }
  &:last-child {
    border-bottom: none;
  }
`;

const TrackIcon = styled.div`
  width: 16px;
  height: 16px;
  margin-right: 8px;
  background-color: #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const TrackName = styled.div`
  font-weight: bold;
`;

const TrackArtist = styled.div`
  font-size: 0.8em;
  color: #666;
`;

const SpotifyApp = ({ openNewWindow }) => {
  const [token, setToken] = useState(localStorage.getItem('spotifyToken') || '');
  const [tokenExpiry, setTokenExpiry] = useState(localStorage.getItem('spotifyTokenExpiry') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const checkTokenValidity = () => {
    if (!token || !tokenExpiry) {
      return false;
    }
    const now = new Date().getTime();
    return now < parseInt(tokenExpiry, 10);
  };

  const authenticateSpotify = () => {
    const clientId = '3f487c5c696f4a8da70ce1d7657830f6';
    const redirectUri = encodeURIComponent('http://myapp.local:3000'); // Updated for dynamic URL
    const scopes = encodeURIComponent('streaming user-read-private user-read-email user-modify-playback-state user-read-currently-playing user-read-playback-state');
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scopes}`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    if (!checkTokenValidity()) {
      const hash = window.location.hash
        .substring(1)
        .split('&')
        .reduce((initial, item) => {
          if (item) {
            const parts = item.split('=');
            initial[parts[0]] = decodeURIComponent(parts[1]);
          }
          return initial;
        }, {});

      const _token = hash.access_token;
      const _expiresIn = hash.expires_in; // Token expiry time in seconds

      if (_token) {
        const expiresAt = new Date().getTime() + parseInt(_expiresIn, 10) * 1000;
        setToken(_token);
        setTokenExpiry(expiresAt);
        localStorage.setItem('spotifyToken', _token);
        localStorage.setItem('spotifyTokenExpiry', expiresAt);
        spotifyApi.setAccessToken(_token);
        window.history.replaceState(null, null, ' '); // Optionally remove the hash from the URL
      } else {
        authenticateSpotify(); // Re-authenticate if no valid token found
      }
    } else {
      spotifyApi.setAccessToken(token);
    }
  }, [token, tokenExpiry]);

  const handleTrackSelect = (track) => {
    const width = 320;
    const height = 450;

    openNewWindow('CDPlayer', <CDPlayer track={track} token={token} />, {
      width: width,
      height: height,
      resizable: false
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;

    try {
      const results = await spotifyApi.searchTracks(searchTerm);
      setSearchResults(results.tracks.items);
    } catch (error) {
      console.error('Error searching tracks:', error);
      if (error.status === 401) {
        authenticateSpotify(); // Re-authenticate if token is invalid
      }
    }
  };

  if (!token) {
    return (
      <Container>
        <h2>Spotify App</h2>
        <p>Please log in to Spotify to use this app.</p>
        <a onClick={authenticateSpotify}>
          Login to Spotify
        </a>
      </Container>
    );
  }

  return (
    <Container>
      <h2>Spotify File Explorer</h2>
      <form onSubmit={handleSearch}>
        <SearchBar
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a song..."
        />
      </form>
      <ResultsList>
        {searchResults.map((track) => (
          <TrackItem key={track.id} onClick={() => handleTrackSelect(track)}>
            <TrackIcon>🎵</TrackIcon>
            <TrackInfo>
              <TrackName>{track.name}</TrackName>
              <TrackArtist>{track.artists.map(artist => artist.name).join(', ')}</TrackArtist>
            </TrackInfo>
          </TrackItem>
        ))}
      </ResultsList>
    </Container>
  );
};

export default SpotifyApp;
