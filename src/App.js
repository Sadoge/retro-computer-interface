import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Rnd } from 'react-rnd';
import { ThemeProvider, useTheme } from './ThemeContext';
import { SpotifyApp, YouTubeSearchApp, PlaylistManagerApp } from './apps';
import SignIn from './SignIn';
import { app } from './firebaseConfig';
import { getAuth, signInWithEmailAndPassword , onAuthStateChanged} from 'firebase/auth';
import { PlaylistProvider } from './PlaylistContext';

const Desktop = styled.div`
  background-color: ${props => props.theme.desktop};
  height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: 'Tahoma', sans-serif;
`;

const TopBar = styled.div`
  background: ${props => props.theme.taskbar};
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  color: ${props => props.theme.text};
  font-weight: bold;
`;

const Window = styled.div`
  background-color: ${props => props.theme.window.background};
  border: 1px solid ${props => props.theme.window.border};
  border-radius: 8px 8px 0 0;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
`;

const WindowContent = styled.div`
  padding: 10px;
  flex-grow: 1;
  overflow: auto;
`;

const IconContainer = styled.div`
  position: absolute;
  left: 10px;
  top: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Icon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  cursor: pointer;
  color: ${props => props.theme.icon.text};
  text-shadow: ${props => props.theme.icon.shadow};
`;

const IconImage = styled.div`
  width: 32px;
  height: 32px;
  background-color: #f0f0f0;
  border: 1px solid #999;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
`;

const ThemeSelector = styled.select`
  margin-left: 10px;
`;

const SignOutButton = styled.button`
  margin-left: 10px;
  padding: 5px 10px;
  background-color: #8b7765;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #705d4e;
  }
`;

const AppContent = ({ onSignOut }) => {
  const [time, setTime] = useState(new Date());
  const { toggleTheme } = useTheme();
  const [openApps, setOpenApps] = useState([]);
  const desktopRef = useRef(null);
  const [playerPreference, setPlayerPreference] = useState('modern');

  const apps = [
    {
      id: 'spotifyApp',
      name: 'Spotify',
      icon: '🎧',
      component: SpotifyApp, 
      defaultSize: { width: 376, height: 535 },
    },
    {
      id: 'youtubeSearch',
      name: 'YouTube Music',
      icon: '🎵',
      component: YouTubeSearchApp,
      defaultSize: { width: 800, height: 500 },
    },
    {
      id: 'playlistManager',
      name: 'Playlist Manager',
      icon: '📋',
      component: PlaylistManagerApp,
      defaultSize: { width: 400, height: 600 },
    },
  ];

  const formatTime = (date) => {
    return date.toLocaleString('en-US', { 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true
    });
  };

  const openNewWindow = (appName, component, appProps, size) => {
    const newApp = {
      id: `${appName}-${Date.now()}`,
      name: appName,
      component: component,  
      props: {
        ...appProps,
        onClose: () => closeApp(`${appName}-${Date.now()}`),
      },      
      position: { x: 50, y: 50 },
      size: size || { width: 300, height: 200 }
    };
    setOpenApps([...openApps, newApp]);
  };

  const openApp = (app) => {
    if (!openApps.find(openApp => openApp.id === app.id)) {
      const desktopRect = desktopRef.current.getBoundingClientRect();
      const maxWidth = Math.min(app.defaultSize.width, desktopRect.width * 0.8);
      const maxHeight = Math.min(app.defaultSize.height, desktopRect.height * 0.8);

      setOpenApps([...openApps, { 
        id: app.id,
        name: app.name,
        component: app.component, 
        props: { 
          openNewWindow, 
          onClose: () => closeApp(app.id),
          playerPreference,
          setPlayerPreference
        },
        position: { x: 50, y: 50 }, 
        size: { width: maxWidth, height: maxHeight } 
      }]);
    }
  };

  const closeApp = (appId) => {
    setOpenApps(openApps.filter(app => app.id !== appId));
  };

  const updateAppPosition = (appId, position) => {
    const desktopRect = desktopRef.current.getBoundingClientRect();
    const app = openApps.find(a => a.id === appId);
    
    const newX = Math.max(0, Math.min(position.x, desktopRect.width - app.size.width));
    const newY = Math.max(0, Math.min(position.y, desktopRect.height - app.size.height));

    setOpenApps(openApps.map(app => 
      app.id === appId ? { ...app, position: { x: newX, y: newY } } : app
    ));
  };

  const updateAppSize = (appId, size) => {
    const desktopRect = desktopRef.current.getBoundingClientRect();
    
    const maxWidth = Math.min(parseInt(size.width), desktopRect.width * 0.8);
    const maxHeight = Math.min(parseInt(size.height), desktopRect.height * 0.8);

    setOpenApps(openApps.map(app => 
      app.id === appId ? { ...app, size: { width: maxWidth, height: maxHeight } } : app
    ));
  };

  return (
    <Desktop ref={desktopRef}>
      <TopBar>
        <div>
          Start
          <ThemeSelector onChange={(e) => toggleTheme(e.target.value)}>
            <option>Windows XP</option>
            <option>Windows 95</option>
            <option>macOS</option>
            <option>Old Radio</option>
          </ThemeSelector>
          <SignOutButton onClick={onSignOut}>Sign Out</SignOutButton>
        </div>
        <div>{formatTime(time)}</div>
      </TopBar>

      {openApps.map((app) => (
        <Rnd
          key={app.id}
          default={{
            x: app.position.x,
            y: app.position.y,
            width: app.size.width,
            height: app.size.height,
          }}
          minWidth={200}
          minHeight={150}
          bounds="parent"
          onDragStop={(e, d) => updateAppPosition(app.id, { x: d.x, y: d.y })}
          onResizeStop={(e, direction, ref, delta, position) =>
            updateAppSize(app.id, { width: ref.style.width, height: ref.style.height })
          }
        >
          <Window>
            <WindowContent>
              {typeof app.component === 'function' ? (
                <app.component {...app.props} />
              ) : (
                <div>Error: Invalid Component</div>
              )}
            </WindowContent>
          </Window>
        </Rnd>
      ))}

      <IconContainer>
        {apps.map((app) => (
          <Icon key={app.id} onClick={() => openApp(app)}>
            <IconImage>{app.icon}</IconImage>
            <span>{app.name}</span>
          </Icon>
        ))}
      </IconContainer>
    </Desktop>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleSignIn = async (email, password) => {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Failed to sign in. Please check your credentials.');
    }
  };

  const handleSignOut = () => {
    const auth = getAuth();
    auth.signOut().then(() => {
      console.log('Successfully signed out');
      setIsAuthenticated(false);
      setUser(null);
    }).catch((error) => {
      console.error('Error signing out:', error);
    });
  };

  return (
    <ThemeProvider>
      {!isAuthenticated ? (
        <SignIn onSignIn={handleSignIn} />
      ) : (
        <PlaylistProvider userId={user.uid}>
          <AppContent onSignOut={handleSignOut} user={user} />
        </PlaylistProvider>
      )}
    </ThemeProvider>
  );
};

export default App;