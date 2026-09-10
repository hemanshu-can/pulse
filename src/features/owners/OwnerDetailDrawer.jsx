import { Avatar, Box, Button, Chip, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material'
import CloseRounded from '@mui/icons-material/CloseRounded'
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded'
import CallOutlined from '@mui/icons-material/CallOutlined'
import BusinessOutlined from '@mui/icons-material/BusinessOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import BroadcastOnPersonalOutlined from '@mui/icons-material/BroadcastOnPersonalOutlined'
import CampaignOutlined from '@mui/icons-material/CampaignOutlined'
import EmailOutlined from '@mui/icons-material/EmailOutlined'
import NotesRounded from '@mui/icons-material/NotesRounded'
import RefreshRounded from '@mui/icons-material/RefreshRounded'
import PersonAddAltRounded from '@mui/icons-material/PersonAddAltRounded'
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined'
import { useNotice } from '../../state/notice.jsx'
import { daysSince, fmtDate, hueOf, initialsOf, relDate, statusOf, timelineFor } from '../../data/owners.js'
import { SORA } from '../../theme.js'

const ACTIVITY_ICON = {
  broadcast: { icon: CampaignOutlined, color: '#3E63DD', bg: '#EDF1FE' },
  open: { icon: EmailOutlined, color: '#0E9F6E', bg: '#E7F6EF' },
  call: { icon: CallOutlined, color: '#D97706', bg: '#FDF2E0' },
  note: { icon: NotesRounded, color: '#7C3AED', bg: '#F3EDFE' },
  update: { icon: RefreshRounded, color: '#0E7490', bg: '#E4F6FA' },
  add: { icon: PersonAddAltRounded, color: '#8A97AB', bg: '#EFF2F6' },
}

export default function OwnerDetailDrawer({ owner, open, onClose, onEdit, onDelete }) {
  const notify = useNotice()
  if (!owner) return null

  const hue = hueOf(owner.id)
  const meta = statusOf(owner.status)
  const activity = timelineFor(owner)
  const daysSinceAdd = daysSince(owner.addedOn)

  return (
    <Drawer anchor="right" open={open} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 400 }, maxWidth: '100%' } } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ position: 'relative', p: 2.5, pb: 2.75, background: 'linear-gradient(150deg, #0B1B33 0%, #14315B 100%)', color: '#fff' }}>
          <IconButton onClick={onClose} sx={{ position: 'absolute', top: 14, right: 14, color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff' } }} aria-label="Close profile">
            <CloseRounded />
          </IconButton>

          <Stack direction="row" spacing={1.8} alignItems="center" sx={{ pt: 1 }}>
            <Avatar
              sx={{
                width: 58,
                height: 58,
                fontSize: 20,
                fontWeight: 800,
                bgcolor: `hsl(${hue}, 70%, 88%)`,
                color: `hsl(${hue}, 55%, 24%)`,
                boxShadow: '0 0 0 3px rgba(255,255,255,0.22)',
              }}
            >
              {initialsOf(owner.name)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontFamily: SORA, fontSize: 19, fontWeight: 700, lineHeight: 1.2, pr: 4 }} noWrap>
                {owner.name}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mt: 0.35 }}>
                <BusinessOutlined sx={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }} />
                <Typography fontSize={13} fontWeight={600} color="rgba(255,255,255,0.75)" noWrap>
                  {owner.company || 'Independent owner'}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.8} sx={{ mt: 1.9 }}>
            <Chip
              size="small"
              label={meta.label}
              sx={{
                height: 22,
                fontSize: 11.5,
                fontWeight: 700,
                bgcolor: 'rgba(255,255,255,0.14)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.2)',
                '& .MuiChip-label': { px: 1.2 },
              }}
              icon={<Box component="span" sx={{ width: 7, height: 7, borderRadius: 99, bgcolor: meta.color, ml: 0.8 }} />}
            />
            <Chip
              size="small"
              label={`Source · ${owner.source}`}
              sx={{
                height: 22,
                fontSize: 11.5,
                fontWeight: 700,
                bgcolor: 'rgba(201,247,78,0.16)',
                color: '#DCF97D',
                '& .MuiChip-label': { px: 1.2 },
              }}
            />
          </Stack>
        </Box>

        {/* Quick contact */}
        <Stack direction="row" spacing={1} sx={{ mt: -1.6, px: 2.5 }}>
          {[
            { icon: <MailOutlineRounded sx={{ fontSize: 18 }} />, label: 'Email', href: `mailto:${owner.email}`, key: 'email' },
            { icon: <CallOutlined sx={{ fontSize: 18 }} />, label: 'Call', href: `tel:${owner.phone.replace(/\s/g, '')}`, key: 'call' },
            { icon: <BroadcastOnPersonalOutlined sx={{ fontSize: 18 }} />, label: 'Broadcast', key: 'bcast' },
          ].map((act) => (
            <Button
              key={act.key}
              component={act.href ? 'a' : 'button'}
              href={act.href}
              fullWidth
              variant="contained"
              size="small"
              startIcon={act.icon}
              onClick={act.href ? undefined : () => notify('Broadcast composer lives in the Broadcast Agent tab', 'info')}
              sx={{
                height: 42,
                bgcolor: '#FFFFFF',
                color: '#14314F',
                boxShadow: '0 8px 20px -10px rgba(11,27,51,0.5)',
                '&:hover': { bgcolor: '#F2F6FB' },
                fontSize: 12.5,
              }}
            >
              {act.label}
            </Button>
          ))}
        </Stack>

        {/* Meta */}
        <Box sx={{ px: 2.5, py: 1.75 }}>
          <Stack spacing={1.25} sx={{ bgcolor: '#F7F9FC', border: '1px solid #E8EDF4', borderRadius: 2.5, p: 1.75 }}>
            <MetaRow label="Email" value={owner.email} mono />
            <MetaRow label="Phone" value={owner.phone} />
            <MetaRow label="Owner ID" value={owner.id} mono />
            <MetaRow label="Added" value={`${fmtDate(owner.addedOn)} (${relDate(owner.addedOn)})`} />
            <MetaRow label="Last contact" value={owner.lastContact ? relDate(owner.lastContact) : 'Never contacted'} />
            <MetaRow
              label="WhatsApp broadcast"
              value={owner.broadcastSent ? 'Sent' : 'Not sent'}
              tone={owner.broadcastSent ? '#0E9F6E' : '#8A97AB'}
            />
            <MetaRow label="Days in workspace" value={`${daysSinceAdd} days`} />
          </Stack>

          {owner.tags?.length > 0 && (
            <Stack direction="row" spacing={0.7} sx={{ mt: 1.6, flexWrap: 'wrap', gap: 0.7 }}>
              {owner.tags.map((t) => (
                <Chip
                  key={t}
                  size="small"
                  label={t}
                  sx={{
                    height: 22,
                    fontSize: 11.5,
                    fontWeight: 650,
                    color: '#4B5A72',
                    bgcolor: '#EDF1F7',
                    '& .MuiChip-label': { px: 1.2 },
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>

        <Divider sx={{ mx: 2.5 }} />

        {/* Activity */}
        <Box sx={{ px: 2.5, pt: 1.5, pb: 1, overflowY: 'auto', flex: 1 }}>
          <Typography sx={{ fontFamily: SORA, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#8A97AB' }}>
            RECENT ACTIVITY
          </Typography>
          <Stack spacing={1.6} sx={{ mt: 1.6 }}>
            {activity.map((a) => {
              const cfg = ACTIVITY_ICON[a.kind] ?? ACTIVITY_ICON.add
              const Icon = cfg.icon
              return (
                <Stack key={a.label + a.at} direction="row" spacing={1.4}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '10px', display: 'grid', placeItems: 'center', bgcolor: cfg.bg, color: cfg.color, flexShrink: 0 }}>
                    <Icon sx={{ fontSize: 16.5 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontSize={12.75} fontWeight={650} lineHeight={1.35}>
                      {a.label}
                    </Typography>
                    <Typography fontSize={11.5} color="text.secondary">
                      <CalendarTodayOutlined sx={{ fontSize: 11, verticalAlign: '-1.5px', mr: 0.5, color: '#A6B2C4' }} />
                      {fmtDate(a.at)}
                    </Typography>
                  </Box>
                </Stack>
              )
            })}
          </Stack>
        </Box>

        {/* Footer actions */}
        <Box sx={{ p: 2.5, borderTop: '1px solid #EDF1F7', display: 'flex', gap: 1.25 }}>
          <Button fullWidth variant="contained" startIcon={<EditOutlined sx={{ fontSize: 17 }} />} onClick={() => { onClose(); onEdit(owner) }}>
            Edit owner
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlined sx={{ fontSize: 17 }} />}
            onClick={() => { onClose(); onDelete(owner) }}
          >
            Delete
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

function MetaRow({ label, value, mono, tone }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ gap: 2 }}>
      <Typography fontSize={12} fontWeight={650} color="#8A97AB" sx={{ letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography
        fontSize={12.75}
        fontWeight={600}
        color={tone ?? 'text.primary'}
        noWrap
        sx={mono ? { fontFamily: 'ui-monospace, monospace', fontSize: 12 } : undefined}
      >
        {value}
      </Typography>
    </Stack>
  )
}
