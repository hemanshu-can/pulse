import { useMemo, useState } from 'react'
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
  FormControlLabel, InputLabel, MenuItem, Select, Switch, TextField, Typography,
} from '@mui/material'
import { SOURCES, STATUS_META } from '../../data/owners.js'
import { SORA } from '../../theme.js'

const empty = { name: '', email: '', phone: '', company: '', status: 'active', source: 'Referral', broadcastSent: false }

/* Mounted only while open (see OwnersPage) so state always starts fresh. */
export default function OwnerFormDialog({ open, mode, initial, existingEmails, onClose, onSave }) {
  const [form, setForm] = useState(initial ? { ...empty, ...initial } : empty)
  const [errors, setErrors] = useState({})

  const isEdit = mode === 'edit'

  const set = (key) => (e) => {
    const val = e.target.value
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((errs) => {
      if (!errs[key]) return errs
      const next = { ...errs }
      delete next[key]
      return next
    })
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Owner name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address'
    else {
      const dup = existingEmails.some(
        (email) => email.toLowerCase() === form.email.trim().toLowerCase() && email !== initial?.email,
      )
      if (dup) errs.email = 'An owner with this email already exists'
    }
    if (form.phone && !/^[+\d][\d\s()-]{6,}$/.test(form.phone.trim())) errs.phone = 'Enter a valid phone number'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = () => {
    if (!validate()) return
    onSave({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim(),
    })
  }

  const invalid = useMemo(
    () => !form.name.trim() || !form.email.trim(),
    [form.name, form.email],
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="owner-form-title"
      slotProps={{ paper: { sx: { maxWidth: 560 } } }}
    >
      <DialogTitle sx={{ pb: 0.5 }}>
        <Typography sx={{ fontFamily: SORA, fontSize: 19, fontWeight: 700 }}>
          {isEdit ? 'Edit owner' : 'Add a new owner'}
        </Typography>
        <Typography fontSize={13} color="text.secondary" sx={{ mt: 0.4 }}>
          {isEdit
            ? `Update details for ${initial?.name ?? ''}.`
            : 'Create a manual entry — or upload a CSV for many at once.'}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box
          component="form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: 0.5 }}
        >
          <TextField
            label="Full name *"
            value={form.name}
            onChange={set('name')}
            error={Boolean(errors.name)}
            helperText={errors.name ?? ' '}
            autoFocus
            size="small"
            sx={{ '& .MuiFormHelperText-root': { ml: 0 } }}
          />
          <TextField
            label="Email *"
            value={form.email}
            onChange={set('email')}
            error={Boolean(errors.email)}
            helperText={errors.email ?? ' '}
            size="small"
            type="email"
            sx={{ '& .MuiFormHelperText-root': { ml: 0 } }}
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={set('phone')}
            error={Boolean(errors.phone)}
            helperText={errors.phone ?? ' '}
            placeholder="+91 98XXX XXXXX"
            size="small"
            sx={{ '& .MuiFormHelperText-root': { ml: 0 } }}
          />
          <TextField
            label="Company"
            value={form.company}
            onChange={set('company')}
            helperText=" "
            size="small"
          />
          <FormControl size="small">
            <InputLabel id="owner-status-label">Status</InputLabel>
            <Select labelId="owner-status-label" label="Status" value={form.status} onChange={set('status')}>
              {STATUS_META.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel id="owner-source-label">Source</InputLabel>
            <Select labelId="owner-source-label" label="Source" value={form.source} onChange={set('source')}>
              {SOURCES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(form.broadcastSent)}
                onChange={(e) => set('broadcastSent')({ target: { value: e.target.checked } })}
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#0E9F6E' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0E9F6E' } }}
              />
            }
            label="WhatsApp broadcast sent"
            sx={{ gridColumn: '1 / -1', mt: 0.5, '& .MuiFormControlLabel-label': { fontSize: 13.5, fontWeight: 600, ml: 0.5 } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.25, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ color: 'text.secondary', borderColor: '#D6DEE9' }}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          disabled={invalid || Object.keys(errors).length > 0}
          sx={{ px: 2.5 }}
        >
          {isEdit ? 'Save changes' : 'Add owner'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
