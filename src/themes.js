// src/themes.js

export const windowsXP = {
  name: 'Windows XP',
  desktop: '#3a6ea5',
  taskbar: 'linear-gradient(to bottom, #1f2f86 0%, #2754e6 8%, #2b5aeb 40%, #2d5ff4 88%, #2d5ff4 93%, #2b5cee 95%, #2851da 96%, #2851da 100%)',
  window: {
    background: '#ECE9D8',
    border: '#0054E3',
    titleBar: 'linear-gradient(to bottom, #0058ee 0%, #3a93ff 3%, #288eff 5%, #127dff 16%, #036ffc 22%, #0262ee 33%, #0057e5 50%, #0054e3 66%, #004fe0 72%, #004bda 77%, #0042cc 88%, #003fc5 95%, #003bbb 100%)',
    titleText: 'white',
  },
  text: 'black',
  icon: {
    text: 'white',
    shadow: '1px 1px 1px black',
  },
};

export const windows95 = {
  name: 'Windows 95',
  desktop: '#008080',
  taskbar: '#c0c0c0',
  window: {
    background: '#c0c0c0',
    border: '#ffffff #808080 #808080 #ffffff',
    titleBar: '#000080',
    titleText: 'white',
  },
  text: 'black',
  icon: {
    text: 'white',
    shadow: '1px 1px 1px black',
  },
};

export const macOS = {
  name: 'macOS',
  desktop: '#f0f0f0',
  taskbar: 'rgba(255, 255, 255, 0.8)',
  window: {
    background: 'white',
    border: '#cccccc',
    titleBar: 'linear-gradient(to bottom, #f6f6f6, #e6e6e6)',
    titleText: 'black',
  },
  text: 'black',
  icon: {
    text: 'black',
    shadow: 'none',
  },
};

export const oldRadio = {
  name: 'Old Radio',
  desktop: '#f4e1c1',  // Light beige background
  taskbar: 'linear-gradient(to bottom, #8b7765 0%, #705d4e 50%, #4e463a 100%)', // Gradient to give a vintage look
  window: {
    background: '#f4e1c1', // Same light beige color for windows
    border: '#8b7765', // Brown border
    titleBar: 'linear-gradient(to bottom, #8b7765, #705d4e)', // Vintage style gradient for title bar
    titleText: 'white',  // White text on the title bar
  },
  text: '#333333', // Darker text color for better readability
  icon: {
    text: '#8b7765',  // Brown text for icons
    shadow: '1px 1px 1px #4e463a', // Slight dark shadow to give depth
  },
};