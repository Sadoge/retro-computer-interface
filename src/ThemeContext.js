import React, { createContext, useState, useContext } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { windowsXP, windows95, macOS } from './themes';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(windows95);

  const toggleTheme = (themeName) => {
    switch (themeName) {
      case 'Windows XP':
        setTheme(windowsXP);
        break;
      case 'Windows 95':
        setTheme(windows95);
        break;
      case 'macOS':
        setTheme(macOS);
        break;
      default:
        setTheme(windowsXP);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};