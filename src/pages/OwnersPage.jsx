import { useMemo, useState } from 'react'
import {
  Box, Button, Checkbox, Chip, Divider, FormControl, IconButton, InputAdornment,
  InputLabel, MenuItem, OutlinedInput, Popover, Select, Stack, TextField, Tooltip, Typography,
} from '@mui/material'
import PersonAddAltOutlined from '@mui/icons-material/PersonAddAltOutlined'
import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined'
import SearchRounded from '@mui/icons-material/SearchRounded'
import CloseRounded from '@mui/icons-material/CloseRounded'
import FilterAltOutlined from '@mui/icons-material/FilterAltOutlined'
import ViewColumnOutlined from '@mui/icons-material/ViewColumnOutlined'
import DownloadRounded from '@mui/icons-material/DownloadRounded'
import DeleteSweepOutlined from '@mui/icons-material/DeleteSweepOutlined'
import RestartAltRounded from '@mui/icons-material/RestartAltRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import { seedOwners, statusOf, STATUS_META, SOURCES, fmtDate } from '../data/owners.js'
import {
  OWNER_COLUMNS, DEFAULT_VISIBLE, FILTER_DEFAULTS, compareOwners, matchesFilters, isFilterActive,
} from '../features/owners/columns.js'
import OwnerTable from '../features/owners/OwnerTable.jsx'
import OwnerFormDialog from '../features/owners/OwnerFormDialog.jsx'
import OwnerUploadDialog from '../features/owners/OwnerUploadDialog.jsx'
import OwnerDetailDrawer from '../features/owners/OwnerDetailDrawer.jsx'
import ConfirmDialog from '../features/owners/ConfirmDialog.jsx'
import StatCards from '../features/owners/StatCards.jsx'
import { useNotice } from '../state/notice.jsx'
import { download } from '../utils/fileUtils.js'
import { SORA } from '../theme.js'

const nextId = (owners) => {
  const max = owners.reduce((m, o) => {
    const n = parseInt(o.id.replace(/\D/g, ''), 10)
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 1000)
  return `OW-${max + 7}`
}

export default function OwnersPage() {
  const notify = useNotice()
  const [owners, setOwners] = useState(() => seedOwners())

  /* filters + visibility + sort + pagination */
  const [filters, setFilters] = useState(FILTER_DEFAULTS)
  const [visible, setVisible] = useState(DEFAULT_VISIBLE)
  const [sortKey, setSortKey] = useState('addedOn')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selected, setSelected] = useState([])

  /* ui state */
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [colAnchor, setColAnchor] = useState(null)
  const [moreAnchor, setMoreAnchor] = useState(null)

  const setFilter = (patch) => {
    setFilters((f) => ({ ...f, ...patch }))
    setPage(0)
  }

  /* ------------------------------------------------------- derived lists */
  const filtered = useMemo(() => owners.filter((o) => matchesFilters(o, filters)), [owners, filters])
  const sorted = useMemo(() => [...filtered].sort((a, b) => compareOwners(a, b, sortKey, sortDir)), [filtered, sortKey, sortDir])
  const total = sorted.length
  const pageCount = Math.max(1, Math.ceil(total / rowsPerPage))
  const safePage = Math.min(page, pageCount - 1)
  const paged = sorted.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage)
  const visibleCols = OWNER_COLUMNS.filter((c) => visible.includes(c.id))
  const existingEmails = useMemo(() => owners.map((o) => o.email.toLowerCase()), [owners])

  const resetFilters = () => {
    setFilters(FILTER_DEFAULTS)
    setPage(0)
  }

  const handleSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'addedOn' || key === 'lastContact' ? 'desc' : 'asc')
    }
  }

  /* ---------------------------------------------------------------- CRUD */
  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (owner) => {
    setEditing(owner)
    setFormOpen(true)
  }

  const saveOwner = (payload) => {
    if (editing) {
      const updated = owners.map((o) => {
        if (o.id !== editing.id) return o
        const patched = { ...o, ...payload }
        if (!patched.broadcastSent) patched.broadcastResponded = false
        return patched
      })
      setOwners(updated)
      if (viewing?.id === editing.id) setViewing(updated.find((o) => o.id === editing.id))
      notify(`${payload.name} updated`)
    } else {
      const fresh = {
        ...payload,
        id: nextId(owners),
        addedOn: new Date().toISOString(),
        lastContact: null,
        tags: [],
        broadcastResponded: false,
      }
      setOwners((o) => [fresh, ...o])
      notify(`${payload.name} added to workspace`)
    }
    setFormOpen(false)
    setEditing(null)
  }

  const requestDelete = (owner) => {
    setDeleteTarget(owner)
    setViewing(null)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    setOwners((o) => o.filter((x) => x.id !== deleteTarget.id))
    setSelected((s) => s.filter((id) => id !== deleteTarget.id))
    notify(`${deleteTarget.name} removed`, 'info')
    setDeleteTarget(null)
  }

  const requestBulk = () => setBulkOpen(true)
  const confirmBulk = () => {
    const n = selected.length
    setOwners((o) => o.filter((x) => !selected.includes(x.id)))
    setSelected([])
    setBulkOpen(false)
    notify(`${n} owners removed`, 'info')
  }

  const importOwners = (candidates) => {
    const emails = new Set(existingEmails)
    const added = []
    let dups = 0
    let idSeq = nextId(owners)
    for (const c of candidates) {
      const key = c.email.toLowerCase()
      if (emails.has(key)) { dups++; continue }
      emails.add(key)
      added.push({
        ...c,
        id: idSeq,
        email: c.email.toLowerCase(),
        tags: ['New import'],
        addedOn: new Date().toISOString(),
        lastContact: null,
        broadcastSent: false,
        broadcastResponded: false,
      })
      idSeq = nextId([...owners, ...added])
    }
    if (!added.length) {
      notify(dups ? `Import skipped — all ${dups} row(s) were duplicates` : 'No rows to import', 'info')
      return
    }
    setOwners((o) => [...added, ...o])
    notify(`Imported ${added.length} owner${added.length > 1 ? 's' : ''}${dups ? ` · ${dups} duplicate(s) skipped` : ''}`)
  }

  const exportRows = (rows) => {
    const header = ['name', 'company', 'email', 'phone', 'status', 'broadcast_sent', 'source', 'added_on', 'last_contact']
    const lines = rows.map((o) =>
      [
        o.name, o.company, o.email, o.phone,
        statusOf(o.status).label, o.broadcastSent ? 'Sent' : 'Not sent', o.source,
        o.addedOn ? fmtDate(o.addedOn) : '', o.lastContact ? fmtDate(o.lastContact) : '',
      ]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(','),
    )
    const stamp = new Date().toISOString().slice(0, 10)
    download(`pulse-owners-${stamp}.csv`, [header.join(','), ...lines].join('\n'))
    notify(`${rows.length} owner${rows.length === 1 ? '' : 's'} exported to CSV`)
  }

  /* selection helpers */
  const pageIds = paged.map((o) => o.id)
  const togglePage = (check) => {
    setSelected((sel) => {
      const next = new Set(sel)
      if (check) pageIds.forEach((id) => next.add(id))
      else pageIds.forEach((id) => next.delete(id))
      return [...next]
    })
  }
  const toggleOne = (id) =>
    setSelected((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]))

  const toggleColumn = (id) => {
    setVisible((v) => {
      if (v.includes(id) && v.length === 1) return v
      return v.includes(id) ? v.filter((x) => x !== id) : [...v, id]
    })
  }

  const hasFilter = isFilterActive(filters)
  const shownFrom = total === 0 ? 0 : safePage * rowsPerPage + 1
  const shownTo = Math.min(total, (safePage + 1) * rowsPerPage)

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* ------------------------------ page header ---------------------- */}
      <Box className="rise" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography sx={{ fontFamily: SORA, fontSize: { xs: 22, md: 26 }, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.15 }}>
            Owners
          </Typography>
          <Typography fontSize={13.25} color="text.secondary" sx={{ mt: 0.55, fontWeight: 550 }}>
            Manage every owner in one place — track status, reach out and keep records clean.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25}>
          <Button variant="outlined" startIcon={<UploadFileOutlined sx={{ fontSize: 18 }} />} onClick={() => setUploadOpen(true)} sx={{ bgcolor: '#FFFFFF', borderColor: '#D6DEE9', color: '#14314F' }}>
            Upload owners
          </Button>
          <Button variant="contained" startIcon={<PersonAddAltOutlined sx={{ fontSize: 18 }} />} onClick={openCreate} sx={{ px: 2 }}>
            Add owner
          </Button>
        </Stack>
      </Box>

      {/* ------------------------------- stat cards ---------------------- */}
      <StatCards owners={owners} />

      {/* ------------------------------- table card --------------------- */}
      <Box className="rise" style={{ animationDelay: '220ms' }} sx={{ bgcolor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F1', overflow: 'visible' }}>
        {/* card header */}
        <Box sx={{ px: 2.75, pt: 2.25, pb: 1.75 }}>
          <Stack direction="row" alignItems="baseline" justifyContent="space-between" flexWrap="wrap" sx={{ gap: 0.75 }}>
            <Typography sx={{ fontFamily: SORA, fontSize: 15.5, fontWeight: 700 }}>All owners</Typography>
            <Typography fontSize={12.25} color="text.secondary" fontWeight={600}>
              Showing {shownFrom}–{shownTo} of {total}
            </Typography>
          </Stack>
        </Box>

        {/* bulk action strip */}
        {selected.length > 0 && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{
              mx: 2.25,
              mb: 1.5,
              px: 1.75,
              py: 1,
              borderRadius: 2.5,
              bgcolor: '#EFF3FB',
              border: '1px solid #D9E2F0',
            }}
          >
            <CheckCircleRounded sx={{ fontSize: 18, color: '#14314F' }} />
            <Typography fontSize={13} fontWeight={700}>
              {selected.length} selected
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button size="small" startIcon={<DownloadRounded sx={{ fontSize: 16 }} />} onClick={() => exportRows(sorted.filter((o) => selected.includes(o.id)))} sx={{ color: '#14314F' }}>
              Export
            </Button>
            <Button size="small" startIcon={<DeleteSweepOutlined sx={{ fontSize: 16 }} />} color="error" onClick={requestBulk}>
              Delete
            </Button>
            <Button size="small" color="inherit" onClick={() => setSelected([])} sx={{ color: 'text.secondary' }}>
              Clear
            </Button>
          </Stack>
        )}

        {/* filter / toolbar row */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ px: 2.75, pb: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}
        >
          <OutlinedInput
            size="small"
            placeholder="Search name, company, email, phone…"
            value={filters.q}
            onChange={(e) => setFilter({ q: e.target.value })}
            startAdornment={
              <InputAdornment position="start">
                <SearchRounded sx={{ fontSize: 18, color: '#8A97AB' }} />
              </InputAdornment>
            }
            endAdornment={
              filters.q ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setFilter({ q: '' })} aria-label="Clear search">
                    <CloseRounded sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null
            }
            sx={{ flexGrow: 1, minWidth: 210, bgcolor: '#F8FAFD', borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F1' } }}
          />

          <FormControl size="small" sx={{ minWidth: 158 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Status"
              multiple
              value={filters.statuses}
              onChange={(e) => setFilter({ statuses: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
              renderValue={(sel) =>
                sel.length === 0 ? 'All statuses' : sel.length === 1 ? statusOf(sel[0]).label : `${sel.length} statuses`
              }
              slotProps={{ menu: { sx: { maxHeight: 320 } } }}
              sx={{ bgcolor: '#F8FAFD', borderRadius: 2, fontSize: 13 }}
            >
              {STATUS_META.map((s) => (
                <MenuItem key={s.value} value={s.value} sx={{ py: 0.35 }}>
                  <Checkbox size="small" checked={filters.statuses.includes(s.value)} sx={{ mr: 1, '& .MuiSvgIcon-root': { fontSize: 18 } }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: 99, bgcolor: s.color, mr: 1 }} />
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="source-filter-label">Source</InputLabel>
            <Select
              labelId="source-filter-label"
              label="Source"
              value={filters.source}
              onChange={(e) => setFilter({ source: e.target.value })}
              sx={{ bgcolor: '#F8FAFD', borderRadius: 2, fontSize: 13 }}
            >
              <MenuItem value="">All sources</MenuItem>
              {SOURCES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Chip
            label="Follow-up only"
            onClick={() => setFilter({ followupOnly: !filters.followupOnly })}
            clickable
            color={filters.followupOnly ? 'primary' : 'default'}
            variant={filters.followupOnly ? 'filled' : 'outlined'}
            sx={{
              borderRadius: 1.75,
              height: 36,
              fontSize: 12.75,
              fontWeight: 650,
              ...(filters.followupOnly
                ? { color: '#FFFFFF', bgcolor: '#14314F', '&:hover': { bgcolor: '#0B1B33' } }
                : { borderColor: '#D6DEE9', bgcolor: '#FFFFFF', color: '#5B6B85' }),
            }}
          />

          <Box sx={{ flexGrow: { md: 1 } }} />

          {/* date-range / more filters */}
          <Tooltip title="More filters (added between)">
            <IconButton size="small" onClick={(e) => setMoreAnchor(e.currentTarget)} sx={{ color: isFilterActive({ ...filters, q: '', statuses: [], source: '', followupOnly: false }) ? '#14314F' : '#5B6B85', bgcolor: '#F4F6FA', border: '1px solid #E7ECF3' }}>
              <FilterAltOutlined sx={{ fontSize: 19 }} />
            </IconButton>
          </Tooltip>

          {/* column visibility */}
          <Tooltip title="Show / hide columns">
            <IconButton size="small" onClick={(e) => setColAnchor(e.currentTarget)} sx={{ color: visible.length !== OWNER_COLUMNS.length ? '#14314F' : '#5B6B85', bgcolor: '#F4F6FA', border: '1px solid #E7ECF3' }}>
              <ViewColumnOutlined sx={{ fontSize: 19 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export CSV (current filter)">
            <span>
              <IconButton
                size="small"
                disabled={total === 0}
                onClick={() => exportRows(sorted)}
                sx={{ color: '#5B6B85', bgcolor: '#F4F6FA', border: '1px solid #E7ECF3', '&.Mui-disabled': { bgcolor: '#F7F8FA', borderColor: '#EDF0F4' } }}
              >
                <DownloadRounded sx={{ fontSize: 19 }} />
              </IconButton>
            </span>
          </Tooltip>

          {/* reset */}
          {hasFilter && (
            <Button size="small" color="inherit" startIcon={<RestartAltRounded sx={{ fontSize: 16 }} />} onClick={resetFilters} sx={{ color: '#5B6B85', flexShrink: 0 }}>
              Reset
            </Button>
          )}
        </Stack>

        {/* active filter chips */}
        {hasFilter && (
          <Stack direction="row" spacing={0.9} alignItems="center" sx={{ px: 2.75, pb: 1.5, flexWrap: 'wrap', gap: 0.9 }}>
            <Typography fontSize={11.5} fontWeight={700} color="#8A97AB" sx={{ letterSpacing: '0.06em' }}>
              FILTERING
            </Typography>
            {filters.statuses.map((s) => (
              <Chip
                key={s}
                size="small"
                label={statusOf(s).label}
                color="primary"
                onDelete={() => setFilter({ statuses: filters.statuses.filter((x) => x !== s) })}
              />
            ))}
            {filters.source && (
              <Chip size="small" label={`Source: ${filters.source}`} onDelete={() => setFilter({ source: '' })} />
            )}
            {filters.from && <Chip size="small" label={`From ${filters.from}`} onDelete={() => setFilter({ from: '' })} />}
            {filters.to && <Chip size="small" label={`To ${filters.to}`} onDelete={() => setFilter({ to: '' })} />}
            {filters.followupOnly && (
              <Chip size="small" label="Follow-up only" onDelete={() => setFilter({ followupOnly: false })} />
            )}
            {filters.q && <Chip size="small" label={`“${filters.q}”`} onDelete={() => setFilter({ q: '' })} />}
          </Stack>
        )}

        <Divider sx={{ borderColor: '#EDF1F7' }} />

        <OwnerTable
          owners={paged}
          total={total}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          page={safePage}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n)
            setPage(0)
          }}
          selected={selected}
          onToggleOne={toggleOne}
          onTogglePage={togglePage}
          visibleCols={visibleCols}
          onEdit={openEdit}
          onDelete={requestDelete}
          onView={setViewing}
          emptyAction={hasFilter ? resetFilters : undefined}
        />
      </Box>

      {/* ------------------------------ dialogs ------------------------- */}
      {formOpen && (
        <OwnerFormDialog
          open
          mode={editing ? 'edit' : 'create'}
          initial={editing}
          existingEmails={existingEmails}
          onClose={() => { setFormOpen(false); setEditing(null) }}
          onSave={saveOwner}
        />
      )}

      <OwnerUploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} onImport={importOwners} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete owner?"
        body={deleteTarget ? (
          <>
            <strong>{deleteTarget.name}</strong> ({deleteTarget.email}) will be permanently removed from your workspace.
            This action cannot be undone.
          </>
        ) : ''}
        confirmLabel="Delete owner"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={bulkOpen}
        title={`Delete ${selected.length} owners?`}
        body="All selected owners will be permanently removed from your workspace. This action cannot be undone."
        confirmLabel={`Delete ${selected.length} owners`}
        onCancel={() => setBulkOpen(false)}
        onConfirm={confirmBulk}
      />

      <OwnerDetailDrawer
        owner={viewing}
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        onEdit={openEdit}
        onDelete={requestDelete}
      />

      {/* column visibility popover */}
      <Popover
        open={Boolean(colAnchor)}
        anchorEl={colAnchor}
        onClose={() => setColAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 240, p: 1, mt: 0.75 } } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.25, py: 0.6 }}>
          <Typography sx={{ fontFamily: SORA, fontSize: 13, fontWeight: 700 }}>Columns</Typography>
          <Button size="small" onClick={() => setVisible(DEFAULT_VISIBLE)} sx={{ fontSize: 11.5 }}>
            Reset
          </Button>
        </Stack>
        <Stack sx={{ px: 0.5, pb: 0.75 }}>
          {OWNER_COLUMNS.map((c) => (
            <Stack key={c.id} direction="row" alignItems="center" sx={{ borderRadius: 1.5, '&:hover': { bgcolor: '#F4F6FA' }, px: 0.5 }}>
              <Checkbox
                size="small"
                checked={visible.includes(c.id)}
                disabled={visible.includes(c.id) && visible.length === 1}
                onChange={() => toggleColumn(c.id)}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 19 } }}
              />
              <Typography fontSize={13} fontWeight={600}>
                {c.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Typography fontSize={11} color="#A6B2C4" sx={{ px: 1.5, pb: 0.5 }}>
          At least one column stays visible.
        </Typography>
      </Popover>

      {/* more-filters (date range) popover */}
      <Popover
        open={Boolean(moreAnchor)}
        anchorEl={moreAnchor}
        onClose={() => setMoreAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 330, p: 2, mt: 0.75 } } }}
      >
        <Typography sx={{ fontFamily: SORA, fontSize: 13.5, fontWeight: 700, mb: 1.75 }}>
          Filter by date added
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            type="date"
            label="From"
            value={filters.from}
            onChange={(e) => setFilter({ from: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            value={filters.to}
            onChange={(e) => setFilter({ to: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ flex: 1 }}
          />
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <Button
            size="small"
            color="inherit"
            onClick={() => {
              setFilter({ from: '', to: '' })
              setMoreAnchor(null)
            }}
            sx={{ color: '#5B6B85', fontSize: 12.5 }}
          >
            Clear dates
          </Button>
          <Button size="small" variant="contained" onClick={() => setMoreAnchor(null)}>
            Apply
          </Button>
        </Stack>
      </Popover>
    </Box>
  )
}
