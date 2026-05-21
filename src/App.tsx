import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './state/AuthContext'
import { Login } from './pages/Login'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { CityOverview } from './pages/sections/CityOverview'
import { MarketIntelligence } from './pages/sections/MarketIntelligence'
import { AcquisitionPipeline } from './pages/sections/AcquisitionPipeline'
import { PortfolioBuilder } from './pages/sections/PortfolioBuilder'
import { GapMarkets } from './pages/sections/GapMarkets'
import { LmiDetail } from './pages/sections/LmiDetail'
import { SignalLog } from './pages/sections/SignalLog'

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { email, loading } = useAuth()
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <span className="eyebrow">Loading…</span>
      </div>
    )
  }
  if (!email) return <Navigate to="/login" replace />
  return <>{children}</>
}

const App: React.FC = () => (
  <AuthProvider>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<CityOverview />} />
        <Route path="intel" element={<MarketIntelligence />} />
        <Route path="pipeline" element={<AcquisitionPipeline />} />
        <Route path="portfolio" element={<PortfolioBuilder />} />
        <Route path="signals" element={<SignalLog />} />
        <Route path="gaps" element={<GapMarkets />} />
        <Route path="lmi" element={<LmiDetail />} />
      </Route>
      {/* Anything else handled by the React app falls back to login. The static landing page is served by Netlify at "/" so we never see "/" here. */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </AuthProvider>
)

export default App
