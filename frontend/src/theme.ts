import { createTheme } from '@mui/material/styles';
export const theme = createTheme({
  palette: {
    primary: { main: '#334d40', dark: '#21362c', light: '#e8eee8', contrastText: '#fff' },
    secondary: { main: '#a27c4d' },
    background: { default: '#f6f5f1', paper: '#fff' },
    text: { primary: '#202923', secondary: '#6e766f' },
    divider: '#e5e7e0',
    error: { main: '#b4483d' },
    success: { main: '#3d7257' },
    warning: { main: '#a06b28' },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h1: {
      fontSize: 'clamp(2.4rem, 5vw, 4.8rem)',
      fontWeight: 600,
      letterSpacing: '-0.06em',
      lineHeight: 1.08,
    },
    h2: { fontSize: 'clamp(1.8rem, 3vw, 2.7rem)', fontWeight: 600, letterSpacing: '-0.045em' },
    h3: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.035em' },
    h4: { fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 600, letterSpacing: '-0.04em' },
    h5: { fontSize: '1.35rem', fontWeight: 600, letterSpacing: '-0.025em' },
    h6: { fontSize: '1.1rem', fontWeight: 600 },
    body1: { fontSize: '0.95rem', lineHeight: 1.7 },
    body2: { fontSize: '0.85rem', lineHeight: 1.65 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '-0.01em' },
    overline: { fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.17em', lineHeight: 2 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiContainer: {
      defaultProps: { maxWidth: 'lg' },
      styleOverrides: { maxWidthLg: { maxWidth: '1280px !important' } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, minHeight: 42, padding: '9px 20px' },
        sizeSmall: { minHeight: 34, padding: '5px 12px' },
        sizeLarge: { minHeight: 50 },
        outlined: { borderColor: '#d8ded6' },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { border: '1px solid #e5e7e0' },
      },
    },
    MuiCard: { styleOverrides: { root: { boxShadow: 'none', border: '1px solid #e5e7e0' } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: '#fff', borderRadius: 8 },
        notchedOutline: { borderColor: '#dce1d8' },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 6, fontWeight: 500, fontSize: '0.72rem' } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: '#edf0e9', padding: '18px 20px' },
        head: {
          backgroundColor: '#f5f6f2',
          color: '#6e766f',
          fontSize: '0.72rem',
          fontWeight: 600,
        },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiSkeleton: { styleOverrides: { root: { backgroundColor: '#e9ece5' } } },
  },
});
