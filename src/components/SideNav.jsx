import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import GroupsOutlined from '@mui/icons-material/GroupsOutlined'
import SendToMobileOutlined from '@mui/icons-material/SendToMobileOutlined'
import { useLocation, useNavigate } from 'react-router-dom'
import { SORA } from '../theme.js'

export const SIDE_WIDTH = 256

const NAV_ITEMS = [
  { to: '/owners', label: 'Owners', icon: <GroupsOutlined /> },
  { to: '/broadcast', label: 'Broadcast Agent', icon: <SendToMobileOutlined /> },
]

export function SideContent({ onNavigate }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const go = (to) => {
    onNavigate?.()
    navigate(to)
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        color: '#DFE8F7',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #0A1629 0%, #0C1F3D 55%, #091627 100%)',
      }}
    >
      {/* soft glow */}
      <Box
        sx={{
          position: 'absolute',
          top: -80,
          right: -90,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,247,78,0.12), transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ px: 2.5, pt: 3, pb: 1.5 }}>
        <Typography
          sx={{
            fontFamily: SORA,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '0.24em',
            color: 'rgba(196,211,235,0.4)',
          }}
        >
          WORKSPACE
        </Typography>
      </Box>

      <List sx={{ px: 1.75, gap: 0.5, display: 'flex', flexDirection: 'column' }} disablePadding>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to
          return (
            <ListItemButton
              key={item.to}
              onClick={() => go(item.to)}
              selected={active}
              sx={{
                position: 'relative',
                borderRadius: 2.5,
                px: 1.6,
                py: 1.05,
                color: active ? '#FFFFFF' : 'rgba(222,232,247,0.62)',
                bgcolor: active ? 'rgba(201,247,78,0.13)' : 'transparent',
                '&:hover': {
                  bgcolor: active ? 'rgba(201,247,78,0.13)' : 'rgba(255,255,255,0.05)',
                  color: active ? '#FFFFFF' : '#FFFFFF',
                },
                transition: 'background 0.18s ease, color 0.18s ease',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: 20,
                  borderRadius: 3,
                  bgcolor: '#C9F74E',
                  opacity: active ? 1 : 0,
                  transition: 'opacity 0.18s ease',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 1.6,
                  color: active ? '#C9F74E' : 'rgba(222,232,247,0.66)',
                  '& svg': { fontSize: 21 },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 13.75,
                  fontWeight: 650,
                  fontFamily: active ? SORA : undefined,
                }}
              />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )
}

export default SideContent
