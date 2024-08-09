import React from 'react';
import styled from 'styled-components';

const AppContainer = styled.div`
  padding: 10px;
`;

const AppHeader = styled.div`
  background-color: #d4d0c8;
  padding: 5px;
  display: flex;
  justify-content: space-between;
`;

const MusicApp = () => {
  return (
    <AppContainer>
      <AppHeader>
        <span>Music Player</span>
        <button>X</button>
      </AppHeader>
      <div>
        <p>Now playing: Retro Beats</p>
        <button>Play</button>
        <button>Pause</button>
        <button>Next</button>
      </div>
    </AppContainer>
  );
};

export default MusicApp;