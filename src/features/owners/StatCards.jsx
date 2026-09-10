import { Box, Chip, Stack, Typography } from '@mui/material'
import GroupsOutlined from '@mui/icons-material/GroupsOutlined'
import CampaignOutlined from '@mui/icons-material/CampaignOutlined'
import ReplyOutlined from '@mui/icons-material/ReplyOutlined'
import PersonAddAltOutlined from '@mui/icons-material/PersonAddAltOutlined'
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded'
import { ownerStats, sparkPoints } from '../../data/owners.js'
import { SORA } from '../../theme.js'

function Sparkline({ seed, color }) {
  const w = 118
  const h = 32
  const pts = sparkPoints(seed, w, h)
  const last = Number(pts.split(' ').at(-1).split(',')[1])
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <circle cx={w} cy={last} r="2.6" fill={color} />
    </svg>
  )
}

export default function StatCards({ owners }) {
  const s = ownerStats(owners)

  const cards = [
    {
      key: 'total',
      label: 'Total owners',
      value: s.total.toLocaleString(),
      sub: `${s.active} active · ${s.total - s.active} others`,
      icon: <GroupsOutlined sx={{ fontSize: 20 }} />,
      tint: { bg: '#E7EEF6', fg: '#14314F' },
      spark: 7,
      footer: { text: `${s.new30} added this month`, tone: '#0E9F6E' },
      delay: 0,
    },
    {
      key: 'broadcast',
      label: 'Broadcast sent',
      value: s.broadcastSent.toLocaleString(),
      sub: `${s.pctSent}% of owners messaged`,
      icon: <CampaignOutlined sx={{ fontSize: 20 }} />,
      tint: { bg: '#E7F6EF', fg: '#0E9F6E' },
      spark: 21,
      footer: { text: `${s.broadcastSent} delivered this month`, tone: '#0E9F6E' },
      delay: 60,
    },
    {
      key: 'response',
      label: 'Owners response rate',
      value: s.responseRate === null ? '—' : `${s.responseRate}%`,
      sub: 'of broadcast recipients replied',
      icon: <ReplyOutlined sx={{ fontSize: 20 }} />,
      tint: { bg: '#E4F6FA', fg: '#0E7490' },
      spark: 42,
      footer: { text: `${s.responded} of ${s.broadcastSent} sent got replies`, tone: '#0E7490' },
      delay: 120,
    },
    {
      key: 'new',
      label: 'New this month',
      value: s.new30.toLocaleString(),
      sub: 'owners added in last 30d',
      icon: <PersonAddAltOutlined sx={{ fontSize: 20 }} />,
      tint: { bg: '#EDF1FE', fg: '#3E63DD' },
      spark: 88,
      footer:
        s.pctChange === null
          ? { text: 'First month tracked', tone: '#8A97AB' }
          : { text: `${s.pctChange >= 0 ? '+' : ''}${s.pctChange}% vs previous month`, tone: s.pctChange >= 0 ? '#0E9F6E' : '#B42318' },
      delay: 180,
    },
  ]

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(4, 1fr)' }, gap: 2 }}>
      {cards.map((c) => (
        <Box
          key={c.key}
          className="rise"
          style={{ animationDelay: `${c.delay}ms` }}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F1',
            borderRadius: '16px',
            px: 2.25,
            py: 2,
            transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 14px 30px -18px rgba(11,27,51,0.3)',
              borderColor: '#DDE4EE',
            },
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ width: 40, height: 40, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: c.tint.bg, color: c.tint.fg }}>
              {c.icon}
            </Box>
            <Sparkline seed={c.spark} color={c.tint.fg} />
          </Stack>
          <Typography sx={{ fontFamily: SORA, fontSize: 27, fontWeight: 700, letterSpacing: '-0.02em', mt: 1.15, lineHeight: 1.1 }}>
            {c.value}
          </Typography>
          <Typography fontSize={13} fontWeight={700} color="text.primary" sx={{ mt: 0.25 }}>
            {c.label}
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.55, flexWrap: 'wrap', rowGap: 0.3 }}>
            <Typography fontSize={11.75} color="text.secondary" fontWeight={550}>
              {c.sub}
            </Typography>
            <Chip
              size="small"
              icon={<TrendingUpRounded sx={{ fontSize: 13 }} />}
              label={c.footer.text}
              sx={{
                height: 21,
                fontSize: 10.75,
                fontWeight: 700,
                color: c.footer.tone,
                bgcolor: 'transparent',
                p: 0,
                ml: 1,
                '& .MuiChip-icon': { color: c.footer.tone },
                '& .MuiChip-label': { px: 0 },
              }}
            />
          </Stack>
        </Box>
      ))}
    </Box>
  )
}
