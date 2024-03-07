import { createTheme } from '@mui/material/styles';

export default createTheme({
  palette: {
    primary: {
      light: '#954bb4',
      main: '#7b1fa2',
      dark: '#561571',
      contrastText: '#fff',
    },
    secondary: {
      light: '#648dae',
      main: '#90caf9',
      dark: '#a6d4fa',
      contrastText: '#000',
    },
    error: {
      main: '#ff3333'
    },
    white: {
      main: '#fff'
    },
    background: {
      paper: '#e1bee7'
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
  },
});
