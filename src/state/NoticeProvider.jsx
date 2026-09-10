import { useCallback, useMemo, useState } from 'react'
import { Alert, Snackbar } from '@mui/material'
import { NoticeContext } from './notice.jsx'

export function NoticeProvider({ children }) {
  const [notice, setNotice] = useState(null)

  const show = useCallback((message, severity = 'success') => {
    setNotice({ message, severity, key: Date.now() })
  }, [])

  const value = useMemo(() => show, [show])

  return (
    <NoticeContext.Provider value={value}>
      {children}
      <Snackbar
        key={notice?.key}
        open={Boolean(notice)}
        autoHideDuration={3800}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setNotice(null)}
      >
        <Alert
          severity={notice?.severity ?? 'success'}
          variant="filled"
          elevation={6}
          onClose={() => setNotice(null)}
          sx={{ borderRadius: '10px', alignItems: 'center' }}
        >
          {notice?.message}
        </Alert>
      </Snackbar>
    </NoticeContext.Provider>
  )
}

export default NoticeProvider
