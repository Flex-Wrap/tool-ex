import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import ShedPage from './pages/ShedPage'
import CreateNeighborhoodPage from './pages/CreateNeighborhoodPage'
import JoinNeighborhoodPage from './pages/JoinNeighborhoodPage'
import ToolDetailsPage from './pages/ToolDetailsPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/shed" element={<ProtectedRoute><ShedPage /></ProtectedRoute>} />
      <Route path="/create-neighbourhood" element={<ProtectedRoute><CreateNeighborhoodPage /></ProtectedRoute>} />
      <Route path="/join-neighbourhood" element={<ProtectedRoute><JoinNeighborhoodPage /></ProtectedRoute>} />
      <Route path="/tool-details/:id" element={<ProtectedRoute><ToolDetailsPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
