import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout.jsx'
import OwnersPage from './pages/OwnersPage.jsx'
import BroadcastPage from './pages/BroadcastPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/owners" replace />} />
        <Route path="/owners" element={<OwnersPage />} />
        <Route path="/broadcast" element={<BroadcastPage />} />
        <Route path="*" element={<Navigate to="/owners" replace />} />
      </Route>
    </Routes>
  )
}
