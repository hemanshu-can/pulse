import {
  Avatar, Box, Checkbox, IconButton, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Tooltip, Typography,
} from '@mui/material'
import EditOutlined from '@mui/icons-material/EditOutlined'
import DeleteOutline from '@mui/icons-material/DeleteOutlined'
import SearchOffRounded from '@mui/icons-material/SearchOffRounded'
import FilterAltOffOutlined from '@mui/icons-material/FilterAltOffOutlined'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import { OWNER_COLUMNS } from './columns.js'
import { initialsOf, hueOf, relDate, timeAgo, statusOf, isContactStale } from '../../data/owners.js'
import { SORA } from '../../theme.js'

const sortableIds = OWNER_COLUMNS.filter((c) => c.sortable).map((c) => c.id)

export function OwnerNameCell({ owner }) {
  const hue = hueOf(owner.id)
  return (
    <Stack direction="row" alignItems="center" spacing={1.4}>
      <Avatar
        sx={{
          width: 36,
          height: 36,
          fontSize: 13,
          fontWeight: 800,
          bgcolor: `hsl(${hue}, 56%, 92%)`,
          color: `hsl(${hue}, 46%, 32%)`,
          boxShadow: 'inset 0 0 0 1px rgba(16,24,40,0.05)',
        }}
      >
        {initialsOf(owner.name)}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography fontSize={13.5} fontWeight={700} color="text.primary" lineHeight={1.3} noWrap>
          {owner.name}
        </Typography>
        <Typography fontSize={11} fontWeight={600} color="#9AA6B9" fontFamily="ui-monospace, monospace" lineHeight={1.4}>
          {owner.id}
        </Typography>
      </Box>
    </Stack>
  )
}

function StatusCell({ value }) {
  const meta = statusOf(value)
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box sx={{ width: 7, height: 7, borderRadius: 99, bgcolor: meta.color, flexShrink: 0 }} />
      <Typography fontSize={12.75} fontWeight={650} sx={{ color: meta.color }}>
        {meta.label}
      </Typography>
    </Stack>
  )
}

function BroadcastCell({ sent }) {
  return sent ? (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.7,
        px: 1.1,
        py: 0.45,
        borderRadius: 1.2,
        bgcolor: '#E7F6EF',
        color: '#0E9F6E',
        fontSize: 11.75,
        fontWeight: 700,
      }}
    >
      <CheckCircleRounded sx={{ fontSize: 13.5 }} />
      Sent
    </Box>
  ) : (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.1,
        py: 0.45,
        borderRadius: 1.2,
        bgcolor: '#F0F3F7',
        color: '#8A97AB',
        fontSize: 11.75,
        fontWeight: 700,
      }}
    >
      Not sent
    </Box>
  )
}

function LastContactCell({ owner }) {
  if (!owner.lastContact) {
    return (
      <Typography fontSize={12.5} color="#A6B2C4" fontStyle="italic" fontWeight={550}>
        Never
      </Typography>
    )
  }
  const stale = isContactStale(owner.lastContact)
  return (
    <Typography fontSize={12.75} fontWeight={600} sx={{ color: stale ? '#D97706' : 'text.secondary' }}>
      {relDate(owner.lastContact)}
      <Typography component="span" fontSize={10.5} fontWeight={600} color="#A6B2C4" ml={0.5}>
        · {timeAgo(owner.lastContact)}
      </Typography>
    </Typography>
  )
}

const cellSx = { fontSize: 13, color: 'text.primary', fontWeight: 550 }

export default function OwnerTable({
  owners,
  total,
  sortKey,
  sortDir,
  onSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  selected,
  onToggleOne,
  onTogglePage,
  visibleCols,
  onEdit,
  onDelete,
  onView,
  emptyAction,
}) {
  const pageIds = owners.map((o) => o.id)
  const pageAllSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id))
  const someSelected = pageIds.some((id) => selected.includes(id))
  const hasFilter = Boolean(emptyAction)

  /* ------------------------------- empty state ------------------------- */
  if (owners.length === 0) {
    return (
      <Stack alignItems="center" sx={{ py: 10, px: 3 }}>
        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: '18px',
            display: 'grid',
            placeItems: 'center',
            bgcolor: '#EDF1F7',
            color: '#7C8AA0',
            mb: 2,
          }}
        >
          {hasFilter ? <SearchOffRounded sx={{ fontSize: 30 }} /> : <FilterAltOffOutlined sx={{ fontSize: 30 }} />}
        </Box>
        <Typography sx={{ fontFamily: SORA, fontWeight: 700, fontSize: 15.5, mb: 0.5 }}>
          {hasFilter ? 'No owners match those filters' : 'No owners yet'}
        </Typography>
        <Typography fontSize={13} color="text.secondary" textAlign="center" sx={{ maxWidth: 360, mb: 2.25 }}>
          {hasFilter
            ? 'Try broadening your search, or reset the active filters to see the full list.'
            : 'Upload a CSV or add your first owner to start building the list.'}
        </Typography>
        {hasFilter && (
          <Box
            component="button"
            onClick={emptyAction}
            sx={{
              typography: 'button',
              fontSize: 13,
              fontWeight: 700,
              color: '#14314F',
              bgcolor: '#E7EEF6',
              border: 'none',
              borderRadius: 2,
              px: 2,
              py: 0.9,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#DCE7F2' },
            }}
          >
            Reset filters
          </Box>
        )}
      </Stack>
    )
  }

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 860 }} size="medium">
        <TableHead>
          <TableRow sx={{ '& th': { bgcolor: '#F7F9FC', color: '#64748B' } }}>
            <TableCell padding="checkbox" sx={{ pl: '22px', borderTopLeftRadius: 0 }}>
              <Checkbox
                size="small"
                checked={pageAllSelected}
                indeterminate={!pageAllSelected && someSelected}
                onChange={(e) => onTogglePage(e.target.checked)}
                inputProps={{ 'aria-label': 'Select all owners on this page' }}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 19 } }}
              />
            </TableCell>
            {visibleCols.map((col) => {
              const sortable = sortableIds.includes(col.id)
              return (
                <TableCell
                  key={col.id}
                  sx={{ minWidth: col.minWidth, py: 1.4, whiteSpace: 'nowrap' }}
                >
                  {sortable ? (
                    <TableSortLabel
                      active={sortKey === col.id}
                      direction={sortKey === col.id ? sortDir : 'asc'}
                      onClick={() => onSort(col.id)}
                      sx={{
                        '& .MuiTableSortLabel-icon': { opacity: sortKey === col.id ? 1 : 0.35 },
                      }}
                    >
                      <Typography fontSize={11.5} fontWeight={700} letterSpacing="0.02em">
                        {col.label.toUpperCase()}
                      </Typography>
                    </TableSortLabel>
                  ) : (
                    <Typography fontSize={11.5} fontWeight={700} letterSpacing="0.02em">
                      {col.label.toUpperCase()}
                    </Typography>
                  )}
                </TableCell>
              )
            })}
            <TableCell align="right" sx={{ pr: '22px', width: 104, whiteSpace: 'nowrap' }}>
              <Typography fontSize={11.5} fontWeight={700} letterSpacing="0.02em">
                ACTIONS
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {owners.map((owner) => {
            const checked = selected.includes(owner.id)
            return (
              <TableRow
                hover
                key={owner.id}
                selected={checked}
                onClick={(e) => {
                  const el = e.target.closest('button, a, input, label')
                  if (!el) onView(owner)
                }}
                sx={{
                  cursor: 'pointer',
                  '&.Mui-selected': { bgcolor: 'rgba(20,49,79,0.06)', '&:hover': { bgcolor: 'rgba(20,49,79,0.08)' } },
                }}
              >
                <TableCell padding="checkbox" sx={{ pl: '22px' }} onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    size="small"
                    checked={checked}
                    onChange={() => onToggleOne(owner.id)}
                    inputProps={{ 'aria-label': `Select ${owner.name}` }}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 19 } }}
                  />
                </TableCell>
                {visibleCols.map((col) => (
                  <TableCell key={col.id} sx={{ py: 1.15, whiteSpace: 'nowrap' }}>
                    {col.id === 'name' && <OwnerNameCell owner={owner} />}
                    {col.id === 'company' && (
                      <Typography sx={cellSx}>{owner.company || <span style={{ color: '#A6B2C4' }}>—</span>}</Typography>
                    )}
                    {col.id === 'email' && (
                      <Typography
                        component="a"
                        href={`mailto:${owner.email}`}
                        sx={{ ...cellSx, textDecoration: 'none', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}
                      >
                        {owner.email}
                      </Typography>
                    )}
                    {col.id === 'phone' && <Typography sx={cellSx}>{owner.phone}</Typography>}
                    {col.id === 'status' && <StatusCell value={owner.status} />}
                    {col.id === 'broadcast' && <BroadcastCell sent={owner.broadcastSent} />}
                    {col.id === 'source' && (
                      <Typography fontSize={12.75} color="text.secondary" fontWeight={600}>
                        {owner.source}
                      </Typography>
                    )}
                    {col.id === 'addedOn' && (
                      <Typography fontSize={12.75} color="text.secondary" fontWeight={600}>
                        {owner.addedOn ? relDate(owner.addedOn) : '—'}
                      </Typography>
                    )}
                    {col.id === 'lastContact' && <LastContactCell owner={owner} />}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ pr: '16px', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Edit owner">
                    <IconButton size="small" onClick={() => onEdit(owner)} sx={{ color: '#5B6B85' }} aria-label={`Edit ${owner.name}`}>
                      <EditOutlined sx={{ fontSize: 18.5 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete owner">
                    <IconButton size="small" onClick={() => onDelete(owner)} sx={{ color: '#B42318', ml: 0.25 }} aria-label={`Delete ${owner.name}`}>
                      <DeleteOutline sx={{ fontSize: 19 }} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, p) => onPageChange(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Rows:"
        sx={{
          borderTop: '1px solid #EDF1F7',
          bgcolor: '#FBFCFE',
          '& .MuiTablePagination-toolbar': { minHeight: 54 },
        }}
      />
    </TableContainer>
  )
}
