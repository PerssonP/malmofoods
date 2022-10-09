import { ThemeProvider, createTheme } from '@mui/material';

const ThemeWrapper = ({ children }) => {
  const theme = createTheme({
    palette: {
      background: {
        default: '#fafafa'
      }
    }
  });

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export default ThemeWrapper;