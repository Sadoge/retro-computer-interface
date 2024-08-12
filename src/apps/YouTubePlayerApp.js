import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 350px;
  padding: 20px;
  background-color: #f4e1c1;
  border: 2px solid #8b7765;
  box-shadow: 5px 5px 0px #8b7765;
  font-family: 'Courier New', Courier, monospace;
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

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const CDContainer = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
`;

const CD = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background-image: url(${props => props.$thumbnail || '/path/to/fallback-image.jpg'});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  animation: ${rotate} 5s linear infinite;
  animation-play-state: ${props => props.$isPlaying ? 'running' : 'paused'};
  border: 10px solid #ddd;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #333;
    box-shadow: inset 0 0 5px rgba(0,0,0,0.5);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle, transparent 70%, rgba(0,0,0,0.3) 100%);
  }
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 20px;
`;

const ControlButtons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
`;

const ControlButton = styled.button`
  padding: 10px;
  font-size: 14px;
  background-color: #8b7765;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-family: 'Courier New', Courier, monospace;

  &:hover {
    background-color: #705d4e;
  }

  &:active {
    background-color: #4e463a;
  }
`;

const ProgressContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProgressBar = styled.input`
  width: 100%;
  margin-bottom: 5px;
`;

const TimeDisplay = styled.div`
  font-size: 12px;
  color: #333;
`;

const Title = styled.div`
  margin-top: 15px;
  font-weight: bold;
  text-align: center;
`;

const PlaylistContainer = styled.div`
  width: 100%;
  margin-top: 20px;
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #8b7765;
  background-color: #f4e1c1;
  font-family: 'Courier New', Courier, monospace;
`;

const PlaylistItem = styled.div`
  padding: 5px;
  cursor: pointer;
  &:hover {
    background-color: #ddd;
  }
  ${({ $isActive }) => $isActive && `
    background-color: #8b7765;
    color: white;
  `}
`;

const ErrorMessage = styled.div`
  color: red;
  margin: 10px 0;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #8b7765;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const YouTubePlayerApp = ({ playlist, currentIndex = 0, onClose }) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(currentIndex);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const playerContainerRef = useRef(null);
  const timeUpdateIntervalRef = useRef(null);

  const updateTimeDisplay = useCallback(() => {
    if (player && player.getCurrentTime && player.getDuration) {
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();

      console.log(currentTime);
      console.log(duration);
      
      if (!isNaN(currentTime) && !isNaN(duration)) {
        setCurrentTime(currentTime);
        setDuration(duration);
      }
    }
  }, [player]);

  const startTimeUpdate = useCallback(() => {
    updateTimeDisplay(); 
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }
    timeUpdateIntervalRef.current = setInterval(updateTimeDisplay, 1000);
  }, [updateTimeDisplay]);

  const stopTimeUpdate = useCallback(() => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }
  }, []);

  const resetTimeDisplay = useCallback(() => {
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const onPlayerReady = useCallback((event) => {
    console.log('Player is ready');
    const playerInstance = event.target;
    setPlayer(playerInstance);
    setIsPlayerReady(true);
    setIsLoading(false);
    resetTimeDisplay();
    startTimeUpdate();
  }, [startTimeUpdate, resetTimeDisplay]);

  const onPlayerStateChange = useCallback((event) => {
    console.log('Player state changed:', event.data);
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      setIsLoading(false);
      startTimeUpdate();
      updateTimeDisplay(); 
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
      stopTimeUpdate();
      updateTimeDisplay();
    } else if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      stopTimeUpdate();
      console.log('Video ended, playing next track');
      playNextTrack();
    } else if (event.data === window.YT.PlayerState.BUFFERING) {
      setIsLoading(true);
    } else if (event.data === window.YT.PlayerState.CUED) {
      setIsLoading(false);
      resetTimeDisplay();
      updateTimeDisplay();
    }
  }, [startTimeUpdate, stopTimeUpdate, updateTimeDisplay, resetTimeDisplay]);

  const onPlayerError = useCallback((event) => {
    console.error('Player error:', event.data);
    setError(`Player error: ${event.data}`);
    setIsLoading(false);
    stopTimeUpdate();
  }, [stopTimeUpdate]);

  const loadVideo = useCallback((videoId) => {
    if (player && isPlayerReady) {
      console.log('Loading video:', videoId);
      setIsLoading(true);
      resetTimeDisplay();
      player.loadVideoById(videoId);
    } else {
      console.warn('Player not ready to load video');
    }
  }, [player, isPlayerReady, resetTimeDisplay]);

  const playVideo = useCallback(() => {
    if (player && isPlayerReady) {
      player.playVideo();
      setIsPlaying(true);
      startTimeUpdate();
    }
  }, [player, isPlayerReady, startTimeUpdate]);

  const pauseVideo = useCallback(() => {
    if (player && isPlayerReady) {
      player.pauseVideo();
      setIsPlaying(false);
      stopTimeUpdate();
      updateTimeDisplay(); 
    }
  }, [player, isPlayerReady, stopTimeUpdate, updateTimeDisplay]);

  const stopVideo = useCallback(() => {
    if (player && isPlayerReady) {
      player.stopVideo();
      setIsPlaying(false);
      resetTimeDisplay();
      stopTimeUpdate();
    }
  }, [player, isPlayerReady, stopTimeUpdate, resetTimeDisplay]);

  const playNextTrack = useCallback(() => {
    setCurrentTrackIndex((prevIndex) => {
      const nextIndex = prevIndex < playlist.length - 1 ? prevIndex + 1 : 0;
      if (player && isPlayerReady) {
        loadVideo(playlist[nextIndex].videoId);
      }
      return nextIndex;
    });
  }, [playlist, player, isPlayerReady, loadVideo]);

  const playPreviousTrack = useCallback(() => {
    setCurrentTrackIndex((prevIndex) => {
      const nextIndex = prevIndex > 0 ? prevIndex - 1 : playlist.length - 1;
      if (player && isPlayerReady) {
        loadVideo(playlist[nextIndex].videoId);
      }
      return nextIndex;
    });
  }, [playlist, player, isPlayerReady, loadVideo]);

  const handleSeek = useCallback((e) => {
    const time = parseFloat(e.target.value);
    if (player && isPlayerReady && !isNaN(time)) {
      player.seekTo(time);
      setCurrentTime(time);
    }
  }, [player, isPlayerReady]);

  useEffect(() => {
    if (!playlist || playlist.length === 0) {
      setError('Playlist is empty or undefined');
      setIsLoading(false);
      return;
    }

    const loadYouTubeAPI = () => {
      return new Promise((resolve, reject) => {
        if (window.YT && window.YT.Player) {
          resolve(window.YT);
        } else {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          window.onYouTubeIframeAPIReady = () => {
            resolve(window.YT);
          };

          tag.onerror = (error) => {
            reject(error);
          };
        }
      });
    };

    const initializePlayer = async () => {
      try {
        await loadYouTubeAPI();
        if (!playerContainerRef.current) {
          throw new Error('YouTube player container not found');
        }

        const initialVideoId = playlist[currentTrackIndex]?.videoId;
        if (!initialVideoId) {
          throw new Error('Invalid video ID');
        }

        new window.YT.Player(playerContainerRef.current, {
          height: '0',
          width: '0',
          videoId: initialVideoId,
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError,
          },
          playerVars: {
            controls: 0,
            disablekb: 1,
            origin: window.location.origin,
          },
        });
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
        setError(`Error initializing YouTube player: ${error.message}`);
        setIsLoading(false);
      }
    };

    initializePlayer();

    return () => {
      stopTimeUpdate();
    };
  }, [onPlayerReady, onPlayerStateChange, onPlayerError, playlist, currentTrackIndex, stopTimeUpdate]);

  useEffect(() => {
    if (isPlayerReady && playlist[currentTrackIndex]) {
      loadVideo(playlist[currentTrackIndex].videoId);
    }
  }, [currentTrackIndex, playlist, isPlayerReady, loadVideo]);

  const formatTime = (time) => {
    if (isNaN(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Container>
      <div ref={playerContainerRef} style={{ display: 'none' }}></div>
      <CloseButton onClick={onClose}>×</CloseButton>
      <Title>YouTube Music Player</Title>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <CDContainer>
            <CD 
              $thumbnail={playlist[currentTrackIndex]?.videoInfo.thumbnailUrl} 
              $isPlaying={isPlaying}
            />
          </CDContainer>
          <Controls>
            <ControlButtons>
              <ControlButton onClick={playPreviousTrack}>⏮</ControlButton>
              <ControlButton onClick={playVideo}>▶️</ControlButton>
              <ControlButton onClick={pauseVideo}>⏸</ControlButton>
              <ControlButton onClick={stopVideo}>⏹</ControlButton>
              <ControlButton onClick={playNextTrack}>⏭</ControlButton>
            </ControlButtons>
            <ProgressContainer>
              <ProgressBar 
                type="range" 
                min="0" 
                max={duration || 1} 
                value={currentTime} 
                onChange={handleSeek}
              />
              <TimeDisplay>
                {formatTime(currentTime)} / {formatTime(duration)}
              </TimeDisplay>
            </ProgressContainer>
          </Controls>
          <PlaylistContainer>
            <h3>Current Playlist</h3>
            {playlist.map((track, index) => (
              <PlaylistItem
                key={index}
                $isActive={index === currentTrackIndex}
                onClick={() => setCurrentTrackIndex(index)}
              >
                {track.videoInfo.title}
              </PlaylistItem>
            ))}
          </PlaylistContainer>
        </>
      )}
    </Container>
  );
};

export default YouTubePlayerApp;