import { useState } from 'react'
import { Box, Drawer, useMediaQuery } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import Navbar from '../components/Navbar.jsx'
import { SIDE_WIDTH, SideContent } from '../components/SideNav.jsx'
import NoticeProvider from '../state/NoticeProvider.jsx'

export default function AppLayout() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <NoticeProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        <Navbar onMenuClick={() => setMobileOpen(true)} />

        <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Desktop side rail */}
          {isDesktop && (
            <Box
              component="aside"
              sx={{
                width: SIDE_WIDTH,
                flexShrink: 0,
                borderRight: '1px solid rgba(11,27,51,0.35)',
                display: { xs: 'none', md: 'block' },
              }}
            >
              <SideContent />
            </Box>
          )}

          {/* Mobile side rail */}
          <Drawer
            variant="temporary"
            open={!isDesktop && mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { width: SIDE_WIDTH, border: 'none' },
            }}
          >
            <SideContent onNavigate={() => setMobileOpen(false)} />
          </Drawer>

          {/* Page content */}
          <Box
            component="main"
            sx={{
              flex: 1,
              minWidth: 0,
              overflowY: 'auto',
              px: { xs: 2, sm: 3, lg: 4 },
              py: { xs: 2.5, lg: 3.5 },
              background:
                'radial-gradient(1100px 320px at 85% -10%, rgba(62,99,221,0.05), transparent 60%), linear-gradient(180deg, #F1F4F9 0%, #EDF1F7 320px)',
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </NoticeProvider>
  )
}
