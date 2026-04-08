import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/NavBar'
import BottomNav from './components/BottomNav'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import Players from './pages/Players'
import Draw from './pages/Draw'
import Bracket1v1 from './pages/Bracket1v1'
import League2v2 from './pages/League2v2'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import PlayerProfile from './pages/PlayerProfile'
import NotFound from './pages/NotFound'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protegidas */}
        <Route path="/*" element={
          <ProtectedRoute>
            <Navbar />
            <BottomNav />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/players" element={<Players />} />
              <Route path="/1v1" element={<Bracket1v1 />} />
              <Route path="/2v2" element={<League2v2 />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/player/:id" element={<PlayerProfile />} />
              <Route path="/draw" element={
                <ProtectedRoute adminOnly>
                  <Draw />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
