import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 350px;
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
  background-image: url(${props => props.thumbnail});
  background-size: cover;
  background-position: center;
  animation: ${rotate} 5s linear infinite;
  animation-play-state: ${props => props.isPlaying ? 'running' : 'paused'};
  border: 10px solid #ddd;
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
  ${({ isActive }) => isActive && `
    background-color: #8b7765;
    color: white;
  `}
`;

const YouTubePlayerApp = ({ playlist, currentIndex = 0, onClose }) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(currentIndex);
  const playerRef = useRef(null);

  const playVideo = useCallback(() => {
    if(player) {
      player.playVideo();
    }
  }, [player]);

  const pauseVideo = () => {
    player.pauseVideo();
  };

  const onPlayerReady = useCallback((event) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
    playVideo()
  }, [playVideo]);

  const playNextTrack = useCallback(() => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  }, [playlist, currentTrackIndex, setCurrentTrackIndex]);

  const onPlayerStateChange = useCallback((event) => {
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
    if (event.data === window.YT.PlayerState.ENDED) {
      playNextTrack();
    }
  }, [setIsPlaying, playNextTrack]);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: playlist[currentTrackIndex].videoId,
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
        playerVars: {
          controls: 0,
          disablekb: 1,
        },
      });
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [currentTrackIndex, onPlayerReady, onPlayerStateChange, playlist]);

  useEffect(() => {
    if (playerRef.current && playlist[currentTrackIndex]) {
      playerRef.current.loadVideoById(playlist[currentTrackIndex].videoId);
    }
  }, [currentTrackIndex, playlist]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(playerRef.current.getCurrentTime());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const stopVideo = () => {
    player.stopVideo();
    setCurrentTime(0);
  };

  const playPreviousTrack = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    player.seekTo(time);
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Container>
      <CloseButton onClick={onClose}>×</CloseButton>
      <Title>YouTube Music Player</Title>
      <br></br>
      <CDContainer>
        <CD 
          thumbnail={playlist[currentTrackIndex]?.videoInfo.thumbnails?.high?.url} 
          isPlaying={isPlaying}
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
        <h3>Playlist</h3>
        {playlist.map((track, index) => {
          const isActive = index === currentTrackIndex;
          return <PlaylistItem 
            key={index} 
            isActive={isActive}
            onClick={() => setCurrentTrackIndex(index)}
           >
          {track.videoInfo.title}
          </PlaylistItem>
        })}
      </PlaylistContainer>
      <div id="youtube-player" style={{ display: 'none' }}></div> {/* Hidden YouTube player */}
    </Container>
  );
};

export default YouTubePlayerApp;
