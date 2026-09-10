import { useMemo, useState } from 'react'
import {
  Box, Button, Chip, FormControl, InputLabel, MenuItem, Paper, Select, Stack,
  TextareaAutosize, Typography,
} from '@mui/material'
import SendRounded from '@mui/icons-material/SendRounded'
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined'
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded'
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded'
import SmsOutlined from '@mui/icons-material/SmsOutlined'
import LockClockOutlined from '@mui/icons-material/LockClockOutlined'
import CampaignOutlined from '@mui/icons-material/CampaignOutlined'
import RouteOutlined from '@mui/icons-material/RouteOutlined'
import CheckCircleOutlineRounded from '@mui/icons-material/CheckCircleOutlineRounded'
import { makeOwners } from '../data/owners.js'
import { useNotice } from '../state/notice.jsx'
import { launchWhatsAppSignup } from '../utils/whatsappSignup.js'
import { SORA } from '../theme.js'

const DRAFT =
  'Hi {name}, quick update from {company} — we have a few listings in your area this month. Want a look?\n\nReply “YES” and we will send the list over. — PULSE'

const CHANNELS = [
  { key: 'whatsapp', label: 'WhatsApp Business', note: 'High open rates · two-way replies', icon: <ChatBubbleOutlineRounded />, color: '#0E9F6E', bg: '#E7F6EF' },
  { key: 'email', label: 'Email', note: 'Best for rich updates & documents', icon: <MailOutlineRounded />, color: '#3E63DD', bg: '#EDF1FE' },
  { key: 'sms', label: 'SMS', note: 'Fallback for critical reminders', icon: <SmsOutlined />, color: '#7C3AED', bg: '#F3EDFE' },
]

export default function BroadcastPage() {
  const notify = useNotice()
  const owners = useMemo(() => makeOwners(32), [])
  const audience = useMemo(() => {
    const atRisk = owners.filter((o) => o.status === 'atRisk').length
    return { all: owners.length, active: owners.filter((o) => o.status === 'active').length, followup: atRisk }
  }, [owners])
  const [target, setTarget] = useState('all')
  const [body, setBody] = useState(DRAFT)
  const [waAccount, setWaAccount] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const chars = body.length

  const toast = () => notify('Demo mode — broadcasts need the integration layer (WhatsApp / Email / SMS)', 'info')

  const connectWhatsApp = async () => {
    setConnecting(true)
    try {
      const { wabaId, phoneNumberId } = await launchWhatsAppSignup()
      setWaAccount({ wabaId, phoneNumberId })
      notify('WhatsApp Business connected', 'success')
    } catch (err) {
      notify(err.message ?? 'WhatsApp signup failed', 'error')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* header */}
      <Box className="rise" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography sx={{ fontFamily: SORA, fontSize: { xs: 22, md: 26 }, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.15 }}>
            Broadcast Agent
          </Typography>
          <Typography fontSize={13.25} color="text.secondary" sx={{ mt: 0.55, fontWeight: 550, maxWidth: 560 }}>
            Compose scheduled reach-outs and send them to owner segments. The UI is ready — messaging channels arrive with the API layer.
          </Typography>
        </Box>
        <Button
          variant={waAccount ? 'outlined' : 'contained'}
          disabled={connecting || Boolean(waAccount)}
          startIcon={
            waAccount
              ? <CheckCircleOutlineRounded sx={{ fontSize: 18, color: '#0E9F6E' }} />
              : <ChatBubbleOutlineRounded sx={{ fontSize: 18 }} />
          }
          onClick={connectWhatsApp}
          sx={waAccount ? { bgcolor: '#E7F6EF', borderColor: '#B7E4CE', color: '#0E9F6E' } : undefined}
        >
          {waAccount ? 'WhatsApp connected' : connecting ? 'Connecting…' : 'Connect WhatsApp'}
        </Button>
      </Box>

      {/* summary tiles */}
      <Box className="rise" style={{ animationDelay: '70ms' }} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
        {[
          { label: 'Channels connected', value: `${waAccount ? 1 : 0} / 3`, sub: 'WhatsApp · Email · SMS', icon: <CampaignOutlined />, tone: '#14314F', bg: '#E7EEF6' },
          { label: 'Reachable audience', value: String(audience.all), sub: `${audience.active} active · ${audience.followup} at risk`, icon: <RouteOutlined />, tone: '#0E9F6E', bg: '#E7F6EF' },
          { label: 'Broadcasts this month', value: '0', sub: 'quota 20,000 msgs unused', icon: <SendRounded />, tone: '#3E63DD', bg: '#EDF1FE' },
        ].map((c) => (
          <Paper key={c.label} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E2E8F1', px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: c.bg, color: c.tone }}>
              {c.icon}
            </Box>
            <Box>
              <Typography sx={{ fontFamily: SORA, fontSize: 23, fontWeight: 700, lineHeight: 1.1 }}>{c.value}</Typography>
              <Typography fontSize={12.5} fontWeight={700} color="text.primary" sx={{ mt: 0.2 }}>{c.label}</Typography>
              <Typography fontSize={11.5} color="text.secondary" fontWeight={550}>{c.sub}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* compose + channel checklist */}
      <Box className="rise" style={{ animationDelay: '140ms' }} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' }, gap: 2, alignItems: 'start' }}>
        {/* compose card */}
        <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E2E8F1', overflow: 'hidden' }}>
          <Box sx={{ px: 2.75, py: 2, borderBottom: '1px solid #EDF1F7' }}>
            <Typography sx={{ fontFamily: SORA, fontSize: 15.5, fontWeight: 700 }}>New broadcast</Typography>
            <Typography fontSize={12.5} color="text.secondary" fontWeight={550} sx={{ mt: 0.25 }}>
              Compose once — the agent personalises each message before sending.
            </Typography>
          </Box>

          <Stack spacing={2.25} sx={{ p: 2.75 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="target-label">Audience</InputLabel>
              <Select
                labelId="target-label"
                label="Audience"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                sx={{ bgcolor: '#F8FAFD', borderRadius: 2 }}
              >
                <MenuItem value="all">All owners ({audience.all})</MenuItem>
                <MenuItem value="active">Active only ({audience.active})</MenuItem>
                <MenuItem value="followup">At-risk follow-ups ({audience.followup})</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <TextareaAutosize
                minRows={7}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                aria-label="Broadcast message"
                style={{
                  width: '100%',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  fontSize: 13.75,
                  lineHeight: 1.65,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #D6DEE9',
                  background: '#F8FAFD',
                  color: '#101C2E',
                  outline: 'none',
                }}
              />
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.75 }}>
                <Stack direction="row" spacing={0.7}>
                  {['{name}', '{company}', '{phone}'].map((t) => (
                    <Chip key={t} size="small" label={t} sx={{ height: 20, fontSize: 11, bgcolor: '#EDF1FE', color: '#3E63DD', fontWeight: 700, '& .MuiChip-label': { px: 1 } }} />
                  ))}
                </Stack>
                <Typography fontSize={11.75} fontWeight={650} color={chars > 1000 ? 'error.main' : '#8A97AB'}>
                  {chars} / 1000
                </Typography>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1.25} justifyContent="flex-end">
              <Button variant="outlined" startIcon={<CalendarMonthOutlined sx={{ fontSize: 17 }} />} onClick={toast} sx={{ borderColor: '#D6DEE9', color: '#14314F', bgcolor: '#FFF' }}>
                Schedule
              </Button>
              <Button variant="contained" startIcon={<SendRounded sx={{ fontSize: 17 }} />} onClick={toast} sx={{ px: 2.5 }}>
                Send broadcast
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* right rail */}
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E2E8F1', overflow: 'hidden' }}>
            <Box sx={{ px: 2.25, py: 1.75, borderBottom: '1px solid #EDF1F7', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CampaignOutlined sx={{ fontSize: 18, color: '#14314F' }} />
              <Typography sx={{ fontFamily: SORA, fontSize: 14, fontWeight: 700 }}>Channels</Typography>
            </Box>
            <Stack sx={{ p: 1.75 }} spacing={1.25}>
              {CHANNELS.map((ch) => {
                const connected = ch.key === 'whatsapp' && Boolean(waAccount)
                return (
                  <Stack key={ch.key} direction="row" alignItems="center" spacing={1.5} sx={{ px: 1, py: 1, borderRadius: 2, '&:hover': { bgcolor: '#F7F9FC' } }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', display: 'grid', placeItems: 'center', bgcolor: ch.bg, color: ch.color, flexShrink: 0 }}>
                      {ch.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontSize={13.25} fontWeight={700} lineHeight={1.3}>{ch.label}</Typography>
                      <Typography fontSize={11.5} color="text.secondary" fontWeight={550} noWrap>
                        {connected ? `Phone number ID ${waAccount.phoneNumberId ?? '—'}` : ch.note}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      icon={connected ? <CheckCircleOutlineRounded sx={{ fontSize: 13 }} /> : <LockClockOutlined sx={{ fontSize: 13 }} />}
                      label={connected ? 'Connected' : 'Not connected'}
                      sx={{
                        height: 22,
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: connected ? '#0E9F6E' : '#8A97AB',
                        bgcolor: connected ? '#E7F6EF' : '#F0F3F7',
                        '& .MuiChip-icon': { fontSize: 13, ml: 0.6, color: connected ? '#0E9F6E' : '#A6B2C4' },
                      }}
                    />
                  </Stack>
                )
              })}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{ borderRadius: '16px', p: 2.25, color: '#DFE8F7', background: 'linear-gradient(160deg, #0B1B33 0%, #12315B 100%)', position: 'relative', overflow: 'hidden' }}
          >
            <Box sx={{ position: 'absolute', top: -50, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,247,78,0.18), transparent 70%)' }} />
            <Typography sx={{ fontFamily: SORA, fontSize: 14.5, fontWeight: 700, color: '#FFFFFF' }}>On the roadmap</Typography>
            <Typography fontSize={12.5} color="rgba(223,232,247,0.72)" lineHeight={1.55} sx={{ mt: 0.6 }}>
              The Broadcast Agent will plug into WhatsApp, Email and SMS so you can run owner nurture campaigns from one screen — no manual follow-ups.
            </Typography>
            <Stack direction="row" spacing={0.7} sx={{ mt: 1.6, flexWrap: 'wrap', gap: 0.7 }}>
              {['Segment by status', 'Templates', 'Send reports', 'Opt-outs'].map((t) => (
                <Chip key={t} size="small" label={t} sx={{ height: 21, fontSize: 11, bgcolor: 'rgba(255,255,255,0.08)', color: '#C9F74E', border: '1px solid rgba(201,247,78,0.22)', '& .MuiChip-label': { px: 1 } }} />
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  )
}
