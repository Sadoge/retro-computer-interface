import React, { useState, useEffect, useCallback } from 'react';
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

  const checkTokenValidity = useCallback(() => {
    if (!token || !tokenExpiry) return false;
    return new Date().getTime() < parseInt(tokenExpiry, 10);
  }, [token, tokenExpiry]);

  const authenticateSpotify = () => {
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirectUri = encodeURIComponent(window.location.origin);
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

      if (hash.access_token) {
        const expiresIn = hash.expires_in;
        const expiresAt = new Date().getTime() + parseInt(expiresIn, 10) * 1000;
        setToken(hash.access_token);
        setTokenExpiry(expiresAt.toString());
        localStorage.setItem('spotifyToken', hash.access_token);
        localStorage.setItem('spotifyTokenExpiry', expiresAt.toString());
        spotifyApi.setAccessToken(hash.access_token);
        window.history.replaceState(null, null, ' ');
      } else {
        authenticateSpotify();
      }
    } else {
      spotifyApi.setAccessToken(token);
    }
  }, [checkTokenValidity, token]);

  const handleTrackSelect = (track) => {
    if (!checkTokenValidity()) {
      authenticateSpotify();
      return;
    }

    openNewWindow('CDPlayer', <CDPlayer track={track} token={token} />, {
      width: 320,
      height: 450,
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
        authenticateSpotify();
      }
    }
  };

  if (!checkTokenValidity()) {
    return (
      <Container>
        <h2>Spotify App</h2>
        <p>Please log in to Spotify to use this app.</p>
        <button onClick={authenticateSpotify}>Login to Spotify</button>
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
