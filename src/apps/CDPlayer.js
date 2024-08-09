import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

const Container = styled.div`
  background-color: #f0f0f0;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  width: 320px;
  height: 450px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 10px;
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const CD = styled.div.attrs(props => ({
  style: {
    backgroundImage: `url(${props.$albumArt})`,
  },
}))`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-size: cover;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${rotate} 5s linear infinite;
  animation-play-state: ${props => props.$isPlaying ? 'running' : 'paused'};
`;

const InnerCircle = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ddd;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

const Button = styled.button`
  margin-bottom: 10px;
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

const ProgressBar = styled.input`
  width: 100%;
  cursor: pointer;
`;

const TimeDisplay = styled.div`
  font-size: 0.8em;
  color: #333;
  margin-top: 5px;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const CDPlayer = ({ track, token }) => {
  const [player, setPlayer] = useState(null);
  const [setDeviceId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  useEffect(() => {
    if (!token) return;

    spotifyApi.setAccessToken(token);

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'CDPlayer',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      setPlayer(player);

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        
        spotifyApi.transferMyPlayback([device_id]).then(() => {
          console.log('Playback transferred to CDPlayer');
          spotifyApi.play({
            uris: [track.uri],
            device_id: device_id
          }).then(() => {
            setIsPlaying(true);
          }).catch(error => {
            console.error('Error starting playback:', error);
          });
        }).catch(error => {
          console.error('Error transferring playback:', error);
        });
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('player_state_changed', (state) => {
        if (!state) return;

        const durationInSeconds = state.duration / 1000;
        const currentTimeInSeconds = state.position / 1000;

        setIsPlaying(!state.paused);
        setCurrentTime(formatTime(currentTimeInSeconds));
        setDuration(formatTime(durationInSeconds));
        setProgress((currentTimeInSeconds / durationInSeconds) * 100);
      });

      player.connect().then(success => {
        if (success) {
          console.log('The Web Playback SDK successfully connected to Spotify!');
        }
      }).catch(error => {
        console.error('Failed to connect to Spotify:', error);
      });
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [player, setDeviceId, token, track.uri]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const togglePlay = () => {
    if (player) {
      player.togglePlay().then(() => {
        setIsPlaying(!isPlaying);
      });
    }
  };

  const handleProgressChange = (e) => {
    const newProgress = e.target.value;
    if (player) {
      player.seek(duration * (newProgress / 100) * 1000);
    }
    setProgress(newProgress);
  };

  return (
    <Container>
      <Title>SplashPlayer 69</Title>
      <CD $albumArt={track.album.images[0].url} $isPlaying={isPlaying}>
        <InnerCircle />
      </CD>
      <Controls>
        <Button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</Button>
        <ProgressBarContainer>
          <ProgressBar
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
          />
        </ProgressBarContainer>
        <TimeDisplay>
          <span>{currentTime}</span>
          <span>{duration}</span>
        </TimeDisplay>
      </Controls>
      <div>
        {track.name} - {track.artists.map(artist => artist.name).join(', ')}
      </div>
    </Container>
  );
};

export default CDPlayer;
