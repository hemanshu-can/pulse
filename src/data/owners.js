/* ---------------------------------------------------------------------------
 * Mock domain data for the PULSE Owners CRM — purely presentational.
 * No API integration yet; swap these helpers for real endpoints later.
 * ------------------------------------------------------------------------- */

export const STATUS_META = [
  { value: 'active', label: 'Active', color: '#0E9F6E', soft: '#E7F6EF' },
  { value: 'atRisk', label: 'At risk', color: '#D97706', soft: '#FDF2E0' },
  { value: 'inactive', label: 'Inactive', color: '#8A97AB', soft: '#EFF2F6' },
  { value: 'pending', label: 'Pending', color: '#3E63DD', soft: '#EDF1FE' },
]

export const statusOf = (value) => STATUS_META.find((s) => s.value === value) ?? STATUS_META[2]

export const SOURCES = [
  'Website',
  'Referral',
  'Open house',
  'Cold outreach',
  'Listing portal',
  'Event',
  'Import',
]

const FIRST = [
  'Aarav', 'Diya', 'Ishaan', 'Meera', 'Rohan', 'Ananya', 'Kabir', 'Sneha',
  'Vivaan', 'Priya', 'Arjun', 'Nandini', 'Dev', 'Ritika', 'Farhan', 'Zoya',
  'Kunal', 'Tanvi', 'Harsh', 'Lakshmi', 'Omar', 'Simran', 'Rahul', 'Pooja',
  'Nikhil', 'Amara', 'Siddharth', 'Kavya', 'Manav', 'Ira', 'Rajat', 'Nisha',
  'Yash', 'Geeta', 'Amit', 'Roshni',
]

const LAST = [
  'Sharma', 'Patel', 'Iyer', 'Reddy', 'Mehta', 'Kapoor', 'Nair', 'Gupta',
  'Chopra', 'Verma', 'Das', 'Khan', 'Menon', 'Joshi', 'Bose', 'Malhotra',
  'Rao', 'Singh', 'Bhatia', 'Desai', 'Kulkarni', 'Saxena', 'Bajaj', 'Anand',
]

const COMPANY = [
  'Meridian Estates', 'Vantage Properties', 'Aster & Co.', 'Northline Group',
  'Copperleaf Realty', 'Beacon Housing', 'Olive Grove Ventures', 'Skyline Holdings',
  'Harborlight Infra', 'Juniper Properties', 'Crestwood Realty', 'Lotus Lane Estates',
  'Falcon Ridge Group', 'Bloomfield Capital',
]

const SLUG = {
  'Meridian Estates': 'meridianhomes', 'Vantage Properties': 'vantageprop',
  'Aster & Co.': 'asterco', 'Northline Group': 'northlinegrp',
  'Copperleaf Realty': 'copperleaf', 'Beacon Housing': 'beaconhousing',
  'Olive Grove Ventures': 'olivegrove', 'Skyline Holdings': 'skylineholdings',
  'Harborlight Infra': 'harborlight', 'Juniper Properties': 'juniperprop',
  'Crestwood Realty': 'crestwood', 'Lotus Lane Estates': 'lotuslane',
  'Falcon Ridge Group': 'falconridge', 'Bloomfield Capital': 'bloomfieldcap',
}

const PHONE_PREFIX = ['98200', '98190', '98765', '97698', '98675', '99301', '98925', '97221']

const TAGS_BY_STATUS = {
  active: ['VIP', 'Repeat', 'Portfolio', 'Referrer', 'Long-term'],
  atRisk: ['Follow-up overdue', 'Negotiating', 'Price sensitive'],
  inactive: ['Moved away', 'Paused'],
  pending: ['New import', 'Awaiting reply', 'Verify contact'],
}

/* Deterministic PRNG so the UI is stable across reloads. */
function mulberry32(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rnd = mulberry32(20260908)
const pick = (arr) => arr[Math.floor(rnd() * arr.length)]
const daysAgoISO = (d) => new Date(Date.now() - d * 86400000).toISOString()

export function makeOwners(count = 32) {
  const used = new Set()
  const owners = []
  let n = 0
  let guard = 0
  while (owners.length < count && guard++ < 500) {
    const first = pick(FIRST)
    const last = pick(LAST)
    const key = first + last
    if (used.has(key)) continue
    used.add(key)

    const roll = rnd()
    const status = roll < 0.42 ? 'active' : roll < 0.6 ? 'atRisk' : roll < 0.84 ? 'inactive' : 'pending'
    const company = pick(COMPANY)
    const addedDays = Math.floor(rnd() * 200)
    const hasContact = rnd() > 0.22
    const lastDays = hasContact ? Math.floor(rnd() * 90) : null
    const source = pick(SOURCES)

    const tags = []
    const pool = TAGS_BY_STATUS[status]
    if (rnd() > 0.45) tags.push(pick(pool))
    if (rnd() > 0.75 && status === 'active') tags.push(pick(TAGS_BY_STATUS.active))

    const broadcastSent = rnd() > 0.45
    const broadcastResponded = broadcastSent && rnd() > 0.35

    n += 7
    owners.push({
      id: `OW-${1001 + n}`,
      name: `${first} ${last}`,
      company,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${SLUG[company]}.com`,
      phone: `+91 ${pick(PHONE_PREFIX)} ${String(Math.floor(rnd() * 90000) + 10000)}`,
      status,
      source,
      tags,
      broadcastSent,
      broadcastResponded,
      addedOn: daysAgoISO(addedDays),
      lastContact: lastDays === null ? null : daysAgoISO(lastDays),
    })
  }
  return owners.sort((a, b) => (a.addedOn < b.addedOn ? 1 : -1))
}

export const seedOwners = () => makeOwners(32)

/* ------------------------------------------------------------------ utils */
export const DAY_MS = 86400000

export const daysSince = (iso) => {
  if (!iso) return 0
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / DAY_MS))
}

export const isContactStale = (iso, days = 45) => {
  if (!iso) return true
  return Date.now() - new Date(iso).getTime() > days * DAY_MS
}

const inLastNDays = (iso, n) => {
  const t = new Date(iso).getTime()
  return t >= Date.now() - n * DAY_MS && t <= Date.now()
}

/* Aggregate stats shown in the stat cards (computed outside components). */
export const ownerStats = (owners = []) => {
  const total = owners.length
  const active = owners.filter((o) => o.status === 'active').length
  const new30 = owners.filter((o) => inLastNDays(o.addedOn, 30)).length
  const prev30 = owners.filter((o) => {
    const t = new Date(o.addedOn).getTime()
    return t >= Date.now() - 60 * DAY_MS && t < Date.now() - 30 * DAY_MS
  }).length
  const needsFollowup = owners.filter(
    (o) => o.status === 'atRisk' || o.status === 'pending' || isContactStale(o.lastContact),
  ).length
  const overdue30 = owners.filter(
    (o) => o.status === 'atRisk' && isContactStale(o.lastContact, 30),
  ).length
  const broadcastSent = owners.filter((o) => o.broadcastSent).length
  const responded = owners.filter((o) => o.broadcastResponded).length
  const pctActive = total ? Math.round((active / total) * 100) : 0
  const pctSent = total ? Math.round((broadcastSent / total) * 100) : 0
  const responseRate = broadcastSent ? Math.round((responded / broadcastSent) * 100) : null
  const pctChange = prev30 === 0 ? null : Math.round(((new30 - prev30) / prev30) * 100)
  return {
    total, active, new30, prev30, needsFollowup, overdue30, pctActive, pctChange,
    broadcastSent, responded, responseRate, pctSent,
  }
}

export const initialsOf = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

const AVATAR_HUES = [210, 262, 340, 24, 160, 190, 285, 8]
export const hueOf = (str = '') => {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 997
  return AVATAR_HUES[h % AVATAR_HUES.length]
}

export const emailDomain = (email = '') => (email.split('@')[1] ?? '').split('.')[0]

export const fmtDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const relDate = (iso) => {
  if (!iso) return 'Never'
  const days = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  if (days < 60) return '1 month ago'
  return `${Math.floor(days / 30)} months ago`
}

export const timeAgo = (iso) => {
  if (!iso) return '—'
  const days = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000))
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

/* Deterministic mock activity feed per owner (demo purposes). */
export const timelineFor = (owner) => {
  const events = [
    { kind: 'broadcast', label: 'Included in broadcast “Quarterly market update”', days: [1, 4, 9] },
    { kind: 'open', label: 'Opened email — link clicked', days: [2, 6, 12, 3] },
    { kind: 'call', label: 'Call logged · follow-up scheduled', days: [5, 11, 8] },
    { kind: 'note', label: 'Owner noted interest in 2–3 BHK listings', days: [14, 20] },
    { kind: 'update', label: 'Contact details updated by team', days: [22, 33] },
  ]
  let h = 0
  const id = owner.id
  for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) % 997
  const shifted = events.slice((h % events.length)).concat(events.slice(0, h % events.length))
  const picked = shifted.slice(0, 2 + (h % 2))
  const list = picked.flatMap((e, i) => {
    const day = e.days[i % e.days.length] + ((h + i * 7) % 5)
    return [{ kind: e.kind, label: e.label, at: daysAgoISO(day) }]
  })
  list.push({ kind: 'add', label: 'Added to workspace', at: owner.addedOn })
  return list.sort((a, b) => (a.at < b.at ? 1 : -1))
}

/* Sparkline points for stat cards — small deterministic wobble. */
export const sparkPoints = (seed, w = 116, h = 34, step = 12) => {
  const f = mulberry32(seed)
  let y = h * (0.35 + f() * 0.3)
  const pts = [`0,${y.toFixed(1)}`]
  for (let x = step; x <= w; x += step) {
    y = Math.max(4, Math.min(h - 4, y + (f() - 0.45) * h * 0.55))
    pts.push(`${x},${y.toFixed(1)}`)
  }
  return pts.join(' ')
}
