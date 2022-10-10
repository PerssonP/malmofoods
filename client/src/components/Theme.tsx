import { ThemeProvider, createTheme } from '@mui/material';

const ThemeWrapper = ({ children }: { children: JSX.Element }) => {
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