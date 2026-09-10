import { useState } from 'react'
import {
  AppBar, Avatar, Badge, Box, Divider, IconButton, List, ListItemButton,
  ListItemText, Menu, MenuItem, Popover, Stack, Toolbar, Tooltip, Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import Circle from '@mui/icons-material/Circle'
import ManageAccountsOutlined from '@mui/icons-material/ManageAccountsOutlined'
import LogoutRounded from '@mui/icons-material/LogoutRounded'
import PulseLogo from './brand.jsx'
import { useNotice } from '../state/notice.jsx'
import { SORA } from '../theme.js'
import { useLocation } from 'react-router-dom'

const ROUTE_LABELS = [
  { path: '/owners', label: 'Owners' },
  { path: '/broadcast', label: 'Broadcast Agent' },
]

const DEMO_NOTIFS = [
  { title: '6 owners flagged for follow-up', when: '12m ago', tone: '#D97706' },
  { title: 'Bulk import finished — 3 owners added', when: '1h ago', tone: '#0E9F6E' },
  { title: 'Broadcast “Quarterly update” opened 41%', when: '3h ago', tone: '#3E63DD' },
]

function Crumb({ pathname }) {
  const current = ROUTE_LABELS.find((r) => r.path === pathname) ?? ROUTE_LABELS[0]
  return (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ display: { xs: 'none', sm: 'flex' } }}>
      <Typography fontSize={13.5} color="text.secondary" fontWeight={600}>
        CRM
      </Typography>
      <ChevronRightRounded sx={{ fontSize: 17, color: '#A6B2C4' }} />
      <Typography fontSize={13.5} fontWeight={700} color="text.primary" sx={{ fontFamily: SORA }}>
        {current.label}
      </Typography>
    </Stack>
  )
}

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const notify = useNotice()
  const [bellAnchor, setBellAnchor] = useState(null)
  const [avatarAnchor, setAvatarAnchor] = useState(null)

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E2E8F1',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ gap: 2, px: { xs: 2, md: 3 }, minHeight: { xs: 62, md: 68 } }}>
        <IconButton
          onClick={onMenuClick}
          sx={{ display: { md: 'none' }, color: 'text.primary' }}
          aria-label="Open navigation"
        >
          <MenuIcon />
        </IconButton>

        <PulseLogo size={33} />

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, display: { xs: 'none', sm: 'block' } }} />
        <Crumb pathname={pathname} />

        <Box sx={{ flexGrow: 1 }} />

        {/* Live status */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            alignItems: 'center',
            gap: 0.9,
            px: 1.4,
            py: 0.65,
            borderRadius: 99,
            bgcolor: '#EFF6F2',
            border: '1px solid #D6EAE0',
          }}
        >
          <Circle className="dot-breathe" sx={{ fontSize: 9, color: '#10B981' }} />
          <Typography fontSize={12.5} fontWeight={700} color="#0E7A55">
            All systems live
          </Typography>
        </Box>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton onClick={(e) => setBellAnchor(e.currentTarget)} aria-label="Notifications">
            <Badge badgeContent={3} color="error" overlap="circular">
              <NotificationsNoneOutlined sx={{ fontSize: 21 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Account */}
        <Box sx={{ ml: 0.5 }}>
          <Tooltip title="Account">
            <IconButton onClick={(e) => setAvatarAnchor(e.currentTarget)} sx={{ p: 0.3 }} aria-label="Account menu">
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: '#14314F',
                  fontSize: 13,
                  fontWeight: 700,
                  border: '2px solid #E7ECF3',
                }}
              >
                HM
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Bell popover */}
      <Popover
        open={Boolean(bellAnchor)}
        anchorEl={bellAnchor}
        onClose={() => setBellAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 1 }}
        slotProps={{ paper: { sx: { width: 320, p: 0.75 } } }}
      >
        <Box sx={{ px: 1.5, pt: 1.1, pb: 0.6 }}>
          <Typography fontSize={13} fontWeight={700} sx={{ fontFamily: SORA }}>
            Notifications
          </Typography>
        </Box>
        <List disablePadding>
          {DEMO_NOTIFS.map((n) => (
            <ListItemButton
              key={n.title}
              sx={{ borderRadius: 2, mx: 0.5, px: 1.2, py: 1 }}
              onClick={() => setBellAnchor(null)}
            >
              <Circle sx={{ fontSize: 8, color: n.tone, mr: 1.4, flexShrink: 0 }} />
              <ListItemText
                primary={n.title}
                primaryTypographyProps={{ fontSize: 13.25, fontWeight: 650, lineHeight: 1.35 }}
                secondary={n.when}
                secondaryTypographyProps={{ fontSize: 11.5 }}
              />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ px: 1.25, pb: 0.75, pt: 0.25 }}>
          <Typography
            fontSize={12}
            fontWeight={700}
            color="primary"
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => {
              setBellAnchor(null)
              notify('Demo workspace — no real activity stream yet', 'info')
            }}
          >
            View all activity
          </Typography>
        </Box>
      </Popover>

      {/* Account menu */}
      <Menu
        anchorEl={avatarAnchor}
        open={Boolean(avatarAnchor)}
        onClose={() => setAvatarAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 230, mt: 0.75, p: 0.75 } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 1.25, py: 1 }}>
          <Avatar sx={{ width: 38, height: 38, bgcolor: '#14314F', fontSize: 14, fontWeight: 700 }}>HM</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontSize={13.5} fontWeight={700} noWrap>
              Heman
            </Typography>
            <Typography fontSize={12} color="text.secondary" noWrap>
              Admin · pulse workspace
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 0.75 }} />
        <MenuItem
          sx={{ gap: 1.2 }}
          onClick={() => {
            setAvatarAnchor(null)
            notify('Settings are part of a later iteration', 'info')
          }}
        >
          <ManageAccountsOutlined sx={{ fontSize: 19 }} /> Profile &amp; settings
        </MenuItem>
        <MenuItem
          sx={{ gap: 1.2, color: 'error.main' }}
          onClick={() => {
            setAvatarAnchor(null)
            notify('Demo only — sign-out is not wired yet', 'info')
          }}
        >
          <LogoutRounded sx={{ fontSize: 19 }} /> Sign out
        </MenuItem>
      </Menu>
    </AppBar>
  )
}
