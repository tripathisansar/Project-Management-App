import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#f97316',
    },
    background: {
      default: '#f8fafc',
    },
  },
  shape: {
    borderRadius: 14,
  },
});

const AppContent = () => {
  const { currentUser } = useAppContext();
  return currentUser ? <Dashboard /> : <LoginPage />;
};

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AppContent />
  </ThemeProvider>
);

const RootApp = () => (
  <AppProvider>
    <App />
  </AppProvider>
);

export default RootApp;
