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

const DebugButton = styled.button`
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  cursor: pointer;
`;

const FallbackContent = styled.div`
  text-align: center;
  padding: 20px;
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

const YouTubePlayerApp = ({ playlist, currentIndex = 0, onClose }) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(currentIndex);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  const logPlayerState = useCallback(() => {
    if (player) {
      console.log('Player state:', player.getPlayerState());
      console.log('Video URL:', player.getVideoUrl());
      console.log('Current time:', player.getCurrentTime());
      console.log('Duration:', player.getDuration());
    } else {
      console.log('Player not initialized');
    }
  }, [player]);

  const onPlayerReady = useCallback((event) => {
    console.log('Player is ready');
    setPlayer(event.target);
    setIsPlayerReady(true);
    setDuration(event.target.getDuration());
    logPlayerState();
  }, [logPlayerState]);

  const onPlayerStateChange = useCallback((event) => {
    console.log('Player state changed:', event.data);
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      setIsLoading(false);
    } else {
      setIsPlaying(false);
    }
    if (event.data === window.YT.PlayerState.ENDED) {
      console.log('Video ended, playing next track');
      setCurrentTrackIndex((prevIndex) => 
        prevIndex < playlist.length - 1 ? prevIndex + 1 : prevIndex
      );
    }
  }, [playlist.length]);

  const onPlayerError = useCallback((event) => {
    console.error('Player error:', event.data);
    setError(`Player error: ${event.data}`);
    setIsLoading(false);
    logPlayerState();
  }, [logPlayerState]);

  const loadVideo = useCallback((videoId) => {
    if (player && isPlayerReady) {
      console.log('Loading video:', videoId);
      setIsLoading(true);
      const maxRetries = 3;
      let retryCount = 0;

      const attemptLoad = () => {
        try {
          player.loadVideoById(videoId);
        } catch (error) {
          console.error('Error loading video:', error);
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying video load (${retryCount}/${maxRetries})...`);
            setTimeout(attemptLoad, 1000);
          } else {
            setError(`Error loading video after ${maxRetries} attempts: ${error.message}`);
            setIsLoading(false);
          }
        }
      };

      attemptLoad();
    } else {
      console.warn('Player not ready to load video');
    }
  }, [player, isPlayerReady]);

  const playVideo = useCallback(() => {
    if (player && isPlayerReady) {
      player.playVideo();
    } else {
      console.warn("Player not initialized yet or not ready");
    }
  }, [player, isPlayerReady]);

  const pauseVideo = useCallback(() => {
    if (player && isPlayerReady) {
      player.pauseVideo();
    }
  }, [player, isPlayerReady]);

  const stopVideo = useCallback(() => {
    if (player && isPlayerReady) {
      player.stopVideo();
      setCurrentTime(0);
    }
  }, [player, isPlayerReady]);

  const playNextTrack = useCallback(() => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex((prevIndex) => prevIndex + 1);
    }
  }, [playlist.length, currentTrackIndex]);

  const playPreviousTrack = useCallback(() => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex((prevIndex) => prevIndex - 1);
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    if (!playlist || playlist.length === 0) {
      console.error('Playlist is empty or undefined');
      setError('Playlist is empty or undefined');
      setIsLoading(false);
      return;
    }

    const loadYouTubeAPI = () => {
      return new Promise((resolve, reject) => {
        if (window.YT && window.YT.Player) {
          console.log('YouTube API already loaded');
          resolve(window.YT);
        } else {
          console.log('Loading YouTube API');
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          window.onYouTubeIframeAPIReady = () => {
            console.log('YouTube IFrame API is ready');
            resolve(window.YT);
          };

          tag.onerror = (error) => {
            console.error('Error loading YouTube API:', error);
            reject(error);
          };
        }
      });
    };

    const initializePlayer = async () => {
      try {
        await loadYouTubeAPI();
        const initialVideoId = playlist[currentTrackIndex]?.videoId;
        console.log('Initializing player with video ID:', initialVideoId);
        
        if (!initialVideoId) {
          throw new Error('Invalid video ID');
        }

        if (!containerRef.current) {
          console.error('YouTube player container not found');
          return;
        }

        const playerElement = document.createElement('div');
        playerElement.id = 'youtube-player';
        containerRef.current.appendChild(playerElement);

        playerRef.current = new window.YT.Player('youtube-player', {
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
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (containerRef.current) {
        const playerElement = containerRef.current.querySelector('#youtube-player');
        if (playerElement) {
          containerRef.current.removeChild(playerElement);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (isPlayerReady && playlist[currentTrackIndex]) {
      console.log('Current track changed, loading new video');
      setIsLoading(true);
      loadVideo(playlist[currentTrackIndex].videoId);
    }
  }, [currentTrackIndex, playlist, isPlayerReady, loadVideo]);

  useEffect(() => {
    let interval;
    if (isPlaying && isPlayerReady) {
      interval = setInterval(() => {
        if (player) {
          setCurrentTime(player.getCurrentTime());
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, player, isPlayerReady]);

  const handleSeek = useCallback((e) => {
    const time = parseFloat(e.target.value);
    if (player && isPlayerReady) {
      player.seekTo(time);
      setCurrentTime(time);
    }
  }, [player, isPlayerReady]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <ErrorBoundary>
      <Container ref={containerRef}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <Title>YouTube Music Player</Title>
        <br/>
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
                  max={duration} 
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
        {!isPlayerReady && !isLoading && (
          <FallbackContent>
            <h3>{playlist[currentTrackIndex]?.videoInfo.title}</h3>
            <img 
              src={playlist[currentTrackIndex]?.videoInfo.thumbnailUrl} 
              alt={playlist[currentTrackIndex]?.videoInfo.title} 
              style={{ width: '200px', height: 'auto' }}
            />
          </FallbackContent>
        )}
        <DebugButton onClick={logPlayerState}>Log Player State</DebugButton>
      </Container>
    </ErrorBoundary>
  );
};

export default YouTubePlayerApp;