import { createTheme } from '@mui/material/styles'

const SORA = `'Sora Variable', 'Sora', ui-sans-serif, system-ui, sans-serif`
const MANROPE = `'Manrope Variable', 'Manrope', ui-sans-serif, system-ui, sans-serif`

/* ---------------------------------------------------------------- brand --- */
export const BRAND = {
  navy: '#0B1B33',
  navyRaised: '#10243F',
  ink: '#0E1A2B',
  lime: '#C9F74E',
  limeBright: '#DCF97D',
  white: '#FFFFFF',
}

export const colors = {
  ink: '#101C2E',
  muted: '#5B6B85',
  faint: '#8795AB',
  line: '#E2E8F1',
  lineSoft: '#EBF0F7',
  bg: '#EDF1F7',
  card: '#FFFFFF',
  navy: BRAND.navy,
  lime: BRAND.lime,
}

const palette = {
  mode: 'light',
  primary: { main: '#14314F', dark: '#0B1B33', light: '#1F4268', contrastText: '#FFFFFF' },
  text: { primary: colors.ink, secondary: colors.muted, disabled: '#A6B2C4' },
  divider: colors.line,
  background: { default: colors.bg, paper: colors.card },
  success: { main: '#0E9F6E', light: '#E7F6EF' },
  warning: { main: '#D97706', light: '#FDF2E0' },
  error: { main: '#D92D20', light: '#FDECEA' },
  info: { main: '#3E63DD', light: '#EDF1FE' },
}

/* ------------------------------------------------------------- theme ----- */
export const theme = createTheme({
  palette,
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: MANROPE,
    h4: { fontFamily: SORA, fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontFamily: SORA, fontWeight: 700, letterSpacing: '-0.015em' },
    h6: { fontFamily: SORA, fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 650 },
    subtitle2: { fontWeight: 650 },
    button: { textTransform: 'none', fontWeight: 650, letterSpacing: 0 },
    overline: { fontFamily: SORA, fontWeight: 600, letterSpacing: '0.12em' },
    caption: { color: colors.muted },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { '-webkit-font-smoothing': 'antialiased', textRendering: 'optimizeLegibility' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
        sizeMedium: { minHeight: 40 },
        sizeSmall: { minHeight: 32 },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiDialog: {
      defaultProps: { fullWidth: true, maxWidth: 'sm' },
      styleOverrides: {
        paper: { borderRadius: 18, boxShadow: '0 24px 70px -24px rgba(11,27,51,0.4)' },
      },
    },
    MuiMenuItem: {
      styleOverrides: { root: { borderRadius: 8, minHeight: 38, fontSize: 14 } },
    },
    MuiMenu: {
      defaultProps: { PaperProps: { elevation: 4 } },
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: '1px solid #E4EAF3',
          boxShadow: '0 16px 44px -16px rgba(11,27,51,0.28)',
          marginTop: 6,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { backgroundColor: colors.navy, fontSize: 12, padding: '6px 10px' } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderBottom: `1px solid #EDF1F7` } },
    },
    MuiSnackbarContent: { styleOverrides: { root: { borderRadius: 10 } } },
  },
})

export default theme

export { SORA, MANROPE }
