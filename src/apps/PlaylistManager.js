import React, { useState } from 'react';
import styled from 'styled-components';

const PlaylistContainer = styled.div`
  margin-top: 20px;
  width: 100%;
`;

const PlaylistItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  border-bottom: 1px solid #ddd;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const RemoveButton = styled.button`
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  &:hover {
    background-color: #cc0000;
  }
`;

const PlaylistManager = ({ playlist, currentTrack, onSelectTrack, onRemoveTrack }) => {
  return (
    <PlaylistContainer>
      <h3>Playlist</h3>
      {playlist.map((track, index) => (
        <PlaylistItem key={index} onClick={() => onSelectTrack(index)}>
          <span>{track.videoInfo.title}</span>
          <RemoveButton onClick={(e) => {
            e.stopPropagation();
            onRemoveTrack(index);
          }}>
            Remove
          </RemoveButton>
        </PlaylistItem>
      ))}
    </PlaylistContainer>
  );
};

export default PlaylistManager;