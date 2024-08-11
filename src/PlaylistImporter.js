import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { usePlaylist } from './PlaylistContext';

const Container = styled.div`
  padding: 20px;
  background-color: #f4e1c1;
  border: 2px solid #8b7765;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #8b7765;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #8b7765;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #705d4e;
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #8b7765;
  border-radius: 4px;
`;

const StatusMessage = styled.div`
  margin-top: 10px;
  padding: 8px;
  border-radius: 4px;
  ${props => props.isError ? `
    color: #721c24;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
  ` : `
    color: #155724;
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
  `}
`;

const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

const PlaylistImporter = () => {
  const [importType, setImportType] = useState('playlist');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const { createPlaylist, addSongToPlaylist } = usePlaylist();

  const handleImport = async () => {
    if (!customName.trim()) {
      setStatus({ message: 'Please enter a name for the imported playlist', isError: true });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const id = spotifyUrl.split(`/${importType}/`)[1]?.split('?')[0];
      if (!id) {
        throw new Error(`Invalid Spotify ${importType} URL`);
      }

      const spotifyToken = await getSpotifyToken();
      const tracks = await getSpotifyTracks(spotifyToken, id, importType);
      const youtubeVideos = await convertToYouTubeVideos(tracks);

      if (youtubeVideos.length > 0) {
        createPlaylist(customName);
        for (let video of youtubeVideos) {
          await addSongToPlaylist(customName, video);
        }
        setStatus({
          message: `Successfully imported ${youtubeVideos.length} out of ${tracks.length} songs to "${customName}"`,
          isError: false
        });
        setCustomName('');
        setSpotifyUrl('');
      } else {
        setStatus({
          message: 'No matching YouTube videos found for any of the Spotify tracks',
          isError: true
        });
      }
    } catch (error) {
      console.error('Import failed:', error);
      setStatus({ message: error.message, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const getSpotifyToken = async () => {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
        }
      }
    );
    return response.data.access_token;
  };

  const getSpotifyTracks = async (token, id, type) => {
    const endpoint = type === 'playlist' 
      ? `https://api.spotify.com/v1/playlists/${id}/tracks`
      : `https://api.spotify.com/v1/albums/${id}/tracks`;
    
    const response = await axios.get(endpoint, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    return response.data.items.map(item => ({
      name: item.track ? item.track.name : item.name,
      artist: item.track ? item.track.artists[0].name : item.artists[0].name
    }));
  };

  const convertToYouTubeVideos = async (spotifyTracks) => {
    const youtubeVideos = [];
    for (let track of spotifyTracks) {
      try {
        const videoData = await searchYouTubeVideoAlternative(track.name, track.artist);
        if (videoData) {
          youtubeVideos.push({
            videoId: videoData.videoId,
            videoInfo: { 
              title: `${track.artist} - ${track.name}`,
              thumbnailUrl: videoData.thumbnailUrl
            }
          });
        }
      } catch (error) {
        console.warn(`Couldn't find YouTube video for: ${track.artist} - ${track.name}`);
        // Continue with the next track
      }
    }
    return youtubeVideos;
  };

  const searchYouTubeVideoAlternative = async (title, artist) => {
    try {
      const query = encodeURIComponent(`${artist} ${title}`);
      const url = `https://invidious.jing.rocks/api/v1/search?q=${query}&type=video`;
      const response = await axios.get(url);
      
      if (response.data && response.data.length > 0) {
        const video = response.data[0];
        const thumbnailUrl = video.videoThumbnails.reduce((highest, current) => {
          return (current.width > highest.width) ? current : highest;
        }).url;

        return {
          videoId: video.videoId,
          thumbnailUrl: thumbnailUrl
        };
      } else {
        throw new Error('No matching video found');
      }
    } catch (error) {
      console.error('Error searching YouTube via Invidious:', error);
      throw error;
    }
  };
  
  return (
    <Container>
      <h3>Import Spotify {importType === 'playlist' ? 'Playlist' : 'Album'}</h3>
      <Select value={importType} onChange={(e) => setImportType(e.target.value)}>
        <option value="playlist">Playlist</option>
        <option value="album">Album</option>
      </Select>
      <Input 
        type="text" 
        placeholder={`Paste Spotify ${importType} URL here`}
        value={spotifyUrl} 
        onChange={(e) => setSpotifyUrl(e.target.value)} 
      />
      <Input 
        type="text" 
        placeholder={`Enter a name for the imported ${importType}`}
        value={customName} 
        onChange={(e) => setCustomName(e.target.value)} 
      />
      <Button onClick={handleImport} disabled={isLoading}>
        {isLoading ? 'Importing...' : 'Import'}
      </Button>
      {status && (
        <StatusMessage isError={status.isError}>
          {status.message}
        </StatusMessage>
      )}
    </Container>
  );
};

export default PlaylistImporter;