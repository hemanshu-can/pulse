import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { SORA } from '../../theme.js'

export default function ConfirmDialog({ open, title, body, confirmLabel = 'Delete', onCancel, onConfirm, tone = 'error' }) {
  return (
    <Dialog open={open} onClose={onCancel} slotProps={{ paper: { sx: { maxWidth: 430 } } }}>
      <DialogTitle sx={{ pb: 0.5 }}>
        <Typography sx={{ fontFamily: SORA, fontSize: 18, fontWeight: 700 }}>{title}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography fontSize={13.75} color="text.secondary" lineHeight={1.55}>
          {body}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onCancel} variant="outlined" color="inherit" sx={{ color: 'text.secondary', borderColor: '#D6DEE9' }}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color={tone} sx={{ px: 2.5 }}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
