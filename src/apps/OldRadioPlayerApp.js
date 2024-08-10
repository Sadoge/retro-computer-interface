import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

const RadioContainer = styled.div`
  width: 400px;
  height: 300px;
  background-color: #8B4513;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  font-family: 'Courier New', Courier, monospace;
`;

const RadioTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const RadioBrand = styled.div`
  color: #FFD700;
  font-size: 24px;
  font-weight: bold;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #FFD700;
  font-size: 24px;
  cursor: pointer;
`;

const RadioScreen = styled.div`
  background-color: #2F4F4F;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7FFF00;
  font-size: 18px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const scrollText = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
`;

const ScrollingText = styled.div`
  white-space: nowrap;
  animation: ${scrollText} 20s linear infinite;
`;

const RadioControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const RadioButton = styled.button`
  background-color: #CD853F;
  color: #8B4513;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #DEB887;
  }
`;

const RadioDial = styled.input`
  width: 100%;
  margin-top: 20px;
`;

const PlaylistContainer = styled.div`
  margin-top: 20px;
  max-height: 100px;
  overflow-y: auto;
  color: #FFD700;
`;

const PlaylistItem = styled.div`
  padding: 5px;
  cursor: pointer;
  &:hover {
    background-color: rgba(255,255,255,0.1);
  }
  ${({ $isActive }) => $isActive && `
    background-color: rgba(255,255,255,0.2);
    font-weight: bold;
  `}
`;

const OldRadioPlayerApp = ({ playlist, currentIndex = 0, onClose }) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(currentIndex);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef(null);

  const onPlayerReady = useCallback((event) => {
    console.log('Player is ready');
    setPlayer(event.target);
    setIsPlayerReady(true);
    setDuration(event.target.getDuration());
  }, []);

  const onPlayerStateChange = useCallback((event) => {
    console.log('Player state changed:', event.data);
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
    if (event.data === window.YT.PlayerState.ENDED) {
      console.log('Video ended, playing next track');
      setCurrentTrackIndex((prevIndex) => 
        prevIndex < playlist.length - 1 ? prevIndex + 1 : prevIndex
      );
    }
  }, [playlist.length]);

  const loadVideo = useCallback((videoId) => {
    if (player && isPlayerReady) {
      console.log('Loading video:', videoId);
      player.loadVideoById(videoId);
    } else {
      console.warn('Player not ready to load video');
    }
  }, [player, isPlayerReady]);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: playlist[currentTrackIndex]?.videoId,
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
  }, []);

  useEffect(() => {
    if (isPlayerReady && playlist[currentTrackIndex]) {
      loadVideo(playlist[currentTrackIndex].videoId);
    }
  }, [currentTrackIndex, playlist, isPlayerReady, loadVideo]);

  const playVideo = () => player?.playVideo();
  const pauseVideo = () => player?.pauseVideo();
  const playNextTrack = () => setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  const playPreviousTrack = () => setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (player && isPlayerReady) {
      player.seekTo(time);
      setCurrentTime(time);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (player && isPlaying) {
        setCurrentTime(player.getCurrentTime());
        setDuration(player.getDuration());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [player, isPlaying]);

  return (
    <RadioContainer>
      <RadioTop>
        <RadioBrand>VintageSound</RadioBrand>
        <CloseButton onClick={onClose}>×</CloseButton>
      </RadioTop>
      <RadioScreen>
        <ScrollingText>
          Now Playing: {playlist[currentTrackIndex]?.videoInfo.title}
        </ScrollingText>
      </RadioScreen>
      <RadioControls>
        <RadioButton onClick={playPreviousTrack}>⏮</RadioButton>
        <RadioButton onClick={isPlaying ? pauseVideo : playVideo}>
          {isPlaying ? '⏸' : '▶'}
        </RadioButton>
        <RadioButton onClick={playNextTrack}>⏭</RadioButton>
      </RadioControls>
      <RadioDial
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={handleSeek}
      />
      <PlaylistContainer>
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
      <div id="youtube-player" style={{ display: 'none' }}></div>
    </RadioContainer>
  );
};

export default OldRadioPlayerApp;