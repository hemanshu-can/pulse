import { useRef, useState } from 'react'
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, Stack, Typography,
} from '@mui/material'
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined'
import DownloadRounded from '@mui/icons-material/DownloadRounded'
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded'
import KeyboardBackspaceRounded from '@mui/icons-material/KeyboardBackspaceRounded'
import { statusOf, SOURCES } from '../../data/owners.js'
import { download, buildCsvTemplate } from '../../utils/fileUtils.js'
import { SORA } from '../../theme.js'

/* ------------------------------------------------------------- CSV utils */
const STATUS_LABEL_TO_VALUE = {
  active: 'active', 'at risk': 'atRisk', atrisk: 'atRisk', inactive: 'inactive', pending: 'pending',
}

const HEADER_ALIASES = {
  name: ['name', 'owner', 'owner name', 'contact', 'full name', 'fullname'],
  email: ['email', 'email address', 'e-mail', 'mail'],
  phone: ['phone', 'mobile', 'contact number', 'phone number', 'telephone', 'tel', 'whatsapp'],
  company: ['company', 'business', 'firm', 'organization', 'organisation'],
  status: ['status', 'owner status'],
  source: ['source', 'lead source', 'channel'],
}

function parseCSVLines(text) {
  const rows = []
  let row = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++ } else inQuotes = false
      } else cur += ch
    } else if (ch === '"') inQuotes = true
    else if (ch === ',') { row.push(cur); cur = '' }
    else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = '' }
    else cur += ch
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row) }
  return rows.map((r) => r.map((c) => c.trim())).filter((r) => r.some(Boolean))
}

const normalize = (s) => (s ?? '').toLowerCase().replace(/[_-\s]/g, '')

function resolveColumnIndex(headerRow) {
  const header = headerRow.map((h) => normalize(h))
  const map = {}
  for (const field of Object.keys(HEADER_ALIASES)) {
    const hit = header.findIndex((h) => HEADER_ALIASES[field].some((alias) => normalize(alias) === h))
    if (hit >= 0) map[field] = hit
  }
  return { map, hasHeader: Object.keys(map).length >= 2 }
}

/* ---------------------------------------------------------------- dialog */
export default function OwnerUploadDialog({ open, onClose, onImport }) {
  const [stage, setStage] = useState('pick') // 'pick' | 'review'
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [candidates, setCandidates] = useState([])
  const [skipped, setSkipped] = useState([])
  const inputRef = useRef(null)

  const reset = () => {
    setStage('pick')
    setDragOver(false)
    setFileName('')
    setCandidates([])
    setSkipped([])
  }

  const close = () => {
    reset()
    onClose()
  }

  const handleText = (text, name) => {
    const rows = parseCSVLines(text)
    const done = []
    const skip = []
    if (rows.length === 0) {
      skip.push('The file appears to be empty.')
      setStage('review')
      return
    }
    const { map, hasHeader } = resolveColumnIndex(rows[0])
    const dataStart = hasHeader ? 1 : 0
    if (!hasHeader && !map.name) map.name = 0

    rows.slice(dataStart).forEach((cells, rowIdx) => {
      const at = (field) => (map[field] !== undefined ? (cells[map[field]] ?? '').trim() : '')
      const name = at('name')
      const email = at('email').toLowerCase()
      if (!name && !email) {
        skip.push(`Row ${dataStart + rowIdx + 1} is blank`)
        return
      }
      if (!name) {
        skip.push(`Row ${dataStart + rowIdx + 1} is missing a name`)
        return
      }
      if (!email) {
        skip.push(`Row ${dataStart + rowIdx + 1} (${name}) is missing an email`)
        return
      }
      const rawStatus = normalize(at('status'))
      const rawSource = at('source')
      done.push({
        name,
        email,
        phone: at('phone'),
        company: at('company'),
        status: STATUS_LABEL_TO_VALUE[rawStatus] ?? 'pending',
        source: SOURCES.some((s) => s.toLowerCase() === rawSource.toLowerCase())
          ? SOURCES.find((s) => s.toLowerCase() === rawSource.toLowerCase())
          : 'Import',
      })
    })

    setFileName(name)
    setCandidates(done)
    setSkipped(skip)
    setStage('review')
  }

  const onFile = (file) => {
    if (!file) return
    if (inputRef.current) inputRef.current.value = ''
    const isCsv = /\.csv$/i.test(file.name) || file.type === 'text/csv'
    if (!isCsv) {
      setFileName(file.name)
      setCandidates([])
      setSkipped([`“${file.name}” is not a CSV file. Save it as CSV and try again.`])
      setStage('review')
      return
    }
    const reader = new FileReader()
    reader.onload = () => handleText(String(reader.result ?? ''), file.name)
    reader.readAsText(file)
  }

  const importNow = () => {
    onImport(candidates)
    close()
  }

  return (
    <Dialog open={open} onClose={close} slotProps={{ paper: { sx: { maxWidth: 560 } } }}>
      <DialogTitle sx={{ pb: 0.5 }}>
        <Typography sx={{ fontFamily: SORA, fontSize: 19, fontWeight: 700 }}>Upload owners</Typography>
        <Typography fontSize={13} color="text.secondary" sx={{ mt: 0.4 }}>
          Bulk-import from CSV — new owners are added, existing emails are skipped.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {stage === 'pick' && (
          <Stack spacing={2}>
            <Box
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                onFile(e.dataTransfer.files?.[0])
              }}
              sx={{
                border: '2px dashed',
                borderColor: dragOver ? '#C9F74E' : '#CBD5E1',
                borderRadius: 3,
                bgcolor: dragOver ? '#F6FAE8' : '#F8FAFD',
                py: 4.5,
                px: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease, background 0.15s ease',
                '&:hover': { borderColor: '#14314F', bgcolor: '#F4F7FB' },
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(e) => onFile(e.target.files?.[0])}
              />
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  mx: 'auto',
                  mb: 1.4,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: '#E8EEF5',
                  color: '#14314F',
                }}
              >
                <CloudUploadOutlined sx={{ fontSize: 26 }} />
              </Box>
              <Typography fontSize={14.5} fontWeight={700} mb={0.3}>
                {dragOver ? 'Drop the file to import' : 'Drag & drop your CSV here'}
              </Typography>
              <Typography fontSize={12.5} color="text.secondary" mb={1.6}>
                or click to browse · columns: name, email, phone, company, status, source
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 0.5 }}>
              <Typography fontSize={12.5} color="text.secondary" fontWeight={600}>
                No file handy? Start from the template.
              </Typography>
              <Button
                size="small"
                startIcon={<DownloadRounded sx={{ fontSize: 17 }} />}
                onClick={() => download('pulse-owners-template.csv', buildCsvTemplate())}
                sx={{ fontSize: 12.5 }}
              >
                Download CSV template
              </Button>
            </Stack>
            <Divider />
            <Stack direction="row" spacing={3.5} sx={{ pt: 0.25, px: 0.5 }}>
              {[
                ['1', 'Header row is optional — columns are matched by name'],
                ['2', 'Known statuses: active, at risk, inactive, pending'],
                ['3', 'Rows with a duplicate email are skipped safely'],
              ].map(([n, t]) => (
                <Stack key={n} direction="row" spacing={1} alignItems="flex-start" sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: SORA, fontSize: 11.5, fontWeight: 800, color: '#C9F74E',
                      bgcolor: '#14314F', borderRadius: 1.2, px: 0.8, py: 0.15, flexShrink: 0,
                    }}
                  >
                    {n}
                  </Typography>
                  <Typography fontSize={11.75} color="text.secondary" lineHeight={1.4}>
                    {t}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        )}

        {stage === 'review' && (
          <Stack spacing={1.75} sx={{ pt: 0.25 }}>
            {fileName && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <DescriptionOutlined sx={{ fontSize: 19, color: '#5B6B85' }} />
                <Typography fontSize={13} fontWeight={700} noWrap>
                  {fileName}
                </Typography>
                <Typography fontSize={12} color="text.secondary" noWrap>
                  · {candidates.length + skipped.length} row(s) read
                </Typography>
              </Stack>
            )}

            {candidates.length > 0 && (
              <>
                <Alert
                  severity="success"
                  icon={<CheckCircleRounded sx={{ fontSize: 18 }} />}
                  sx={{ borderRadius: 2, '& .MuiAlert-message': { py: 0.35 } }}
                >
                  <Typography fontSize={13} fontWeight={700}>
                    {candidates.length} valid owner{candidates.length > 1 ? 's' : ''} ready to import
                  </Typography>
                </Alert>

                <Box sx={{ border: '1px solid #E5EAF3', borderRadius: 2.5, overflow: 'hidden' }}>
                  {candidates.slice(0, 4).map((c) => (
                    <Stack
                      key={`${c.email}-${c.name}`}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ px: 1.6, py: 1.05, borderBottom: '1px solid #EEF1F6', bgcolor: '#FBFCFE' }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontSize={13} fontWeight={650} noWrap>
                          {c.name}
                        </Typography>
                        <Typography fontSize={11.5} color="text.secondary" noWrap>
                          {c.email}
                        </Typography>
                      </Box>
                      <Typography
                        fontSize={11.5}
                        fontWeight={700}
                        sx={{ color: statusOf(c.status).color, bgcolor: statusOf(c.status).soft, px: 1, py: 0.3, borderRadius: 1 }}
                      >
                        {statusOf(c.status).label.toUpperCase()}
                      </Typography>
                    </Stack>
                  ))}
                  {candidates.length > 4 && (
                    <Typography fontSize={12} color="text.secondary" sx={{ px: 1.6, py: 1.1 }} fontWeight={600}>
                      …and {candidates.length - 4} more
                    </Typography>
                  )}
                </Box>
              </>
            )}

            {skipped.length > 0 && (
              <Alert severity="warning" icon={<ErrorOutlineRounded sx={{ fontSize: 18 }} />} sx={{ borderRadius: 2 }}>
                <Stack spacing={0.3}>
                  <Typography fontSize={13} fontWeight={700}>
                    {skipped.length} row{skipped.length > 1 ? 's' : ''} skipped
                  </Typography>
                  <Box sx={{ maxHeight: 74, overflowY: 'auto', pr: 1 }}>
                    {skipped.slice(0, 6).map((s) => (
                      <Typography key={s} fontSize={12} lineHeight={1.6} color="text.secondary">
                        · {s}
                      </Typography>
                    ))}
                    {skipped.length > 6 && (
                      <Typography fontSize={12} color="text.secondary">
                        · {skipped.length - 6} more…
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Alert>
            )}

            {candidates.length === 0 && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                <Typography fontSize={13} fontWeight={700}>
                  Nothing to import
                </Typography>
                <Typography fontSize={12.5} color="text.secondary">
                  No valid rows were found in this file.
                </Typography>
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        {stage === 'review' ? (
          <>
            <Button startIcon={<KeyboardBackspaceRounded sx={{ fontSize: 17 }} />} onClick={() => setStage('pick')} variant="outlined" color="inherit" sx={{ color: 'text.secondary', borderColor: '#D6DEE9' }}>
              Pick another file
            </Button>
            <Button onClick={importNow} variant="contained" disabled={candidates.length === 0} sx={{ px: 2.5 }}>
              Import {candidates.length} owner{candidates.length === 1 ? '' : 's'}
            </Button>
          </>
        ) : (
          <Button onClick={close} variant="outlined" color="inherit" sx={{ color: 'text.secondary', borderColor: '#D6DEE9' }}>
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
