import { Box } from '@mui/material'
import { SORA } from '../theme.js'

/** PULSE logo mark — a navy tile with a lime ECG heartbeat. */
export function PulseMark({ size = 34 }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(140deg, #0C1E3C 0%, #123763 70%, #0D2348 100%)',
        borderRadius: '11px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16), 0 4px 12px -4px rgba(11,27,51,0.55)',
      }}
    >
      <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          className="ecg-path"
          d="M4 22.5h7.2l2.6-7.5 4.6 13 3.4-9 1.6 3.5H36"
          stroke="#C9F74E"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

/** Full "PULSE" wordmark lock-up with a small descriptor line. */
export function PulseLogo({ size = 34, descriptor = 'OWNERS CRM', onDark = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
      <PulseMark size={size} />
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1 }}>
        <Box
          component="span"
          sx={{
            fontFamily: SORA,
            fontWeight: 800,
            fontSize: size * 0.56,
            letterSpacing: '0.34em',
            textIndent: '0.34em',
            color: onDark ? '#FFFFFF' : '#0E1A2B',
          }}
        >
          PULSE
        </Box>
        <Box
          component="span"
          sx={{
            mt: 0.35,
            fontSize: size * 0.24,
            fontWeight: 700,
            letterSpacing: '0.44em',
            textIndent: '0.44em',
            color: onDark ? 'rgba(201,247,78,0.85)' : '#8A97AB',
          }}
        >
          {descriptor}
        </Box>
      </Box>
    </Box>
  )
}

export default PulseLogo
