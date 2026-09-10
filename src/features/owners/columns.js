/* Columns shown in the Owners table + used by the show/hide panel. */

export const OWNER_COLUMNS = [
  { id: 'name', label: 'Owner', sortable: true, minWidth: 220 },
  { id: 'company', label: 'Company', sortable: true, minWidth: 170 },
  { id: 'email', label: 'Email', sortable: false, minWidth: 210 },
  { id: 'phone', label: 'Phone', sortable: false, minWidth: 150 },
  { id: 'status', label: 'Status', sortable: true, minWidth: 110 },
  { id: 'broadcast', label: 'WhatsApp broadcast', sortable: true, minWidth: 140 },
  { id: 'source', label: 'Source', sortable: false, minWidth: 130 },
  { id: 'addedOn', label: 'Added', sortable: true, minWidth: 112 },
  { id: 'lastContact', label: 'Last contact', sortable: true, minWidth: 118 },
]

export const DEFAULT_VISIBLE = OWNER_COLUMNS.map((c) => c.id)

export const sortValue = (owner, col) => {
  switch (col) {
    case 'addedOn':
    case 'lastContact':
      return owner[col] ?? '0000-00-00'
    case 'status':
      return ['active', 'atRisk', 'inactive', 'pending'].indexOf(owner.status)
    case 'broadcast':
      return owner.broadcastSent ? 1 : 0
    case 'name':
      return owner.name.toLowerCase()
    default:
      return String(owner[col] ?? '').toLowerCase()
  }
}

export const compareOwners = (a, b, key, dir) => {
  const va = sortValue(a, key)
  const vb = sortValue(b, key)
  const cmp = va < vb ? -1 : va > vb ? 1 : 0
  return dir === 'asc' ? cmp : -cmp
}

/* Filtering — matches an owner against the current filter state. */
export const matchesFilters = (o, f) => {
  const q = f.q.trim().toLowerCase()
  const hay = [o.name, o.company, o.email, o.phone, o.source, o.id, ...(o.tags ?? [])]
    .join(' ')
    .toLowerCase()
  if (q && !hay.includes(q)) return false
  if (f.statuses.length && !f.statuses.includes(o.status)) return false
  if (f.source && o.source !== f.source) return false

  const last = o.lastContact ? new Date(o.lastContact).getTime() : null
  const stale = !last || Date.now() - last > 45 * 86400000
  if (f.followupOnly) {
    const isRisk = o.status === 'atRisk' || o.status === 'pending'
    if (!(isRisk || stale)) return false
  }
  if (f.from) {
    const added = new Date(o.addedOn).getTime()
    if (added < new Date(f.from).getTime() - 86400000) return false
  }
  if (f.to) {
    const added = new Date(o.addedOn).getTime()
    if (added > new Date(f.to).getTime() + 86400000) return false
  }
  return true
}

export const FILTER_DEFAULTS = {
  q: '',
  statuses: [],
  source: '',
  followupOnly: false,
  from: '',
  to: '',
}

export const isFilterActive = (f) =>
  f.q.trim() !== '' || f.statuses.length > 0 || f.source !== '' || f.followupOnly || f.from !== '' || f.to !== ''
