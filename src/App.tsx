import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './state/AuthContext'
import { Landing } from './pages/Landing'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { CityOverview } from './pages/sections/CityOverview'
import { MarketIntelligence } from './pages/sections/MarketIntelligence'
import { AcquisitionPipeline } from './pages/sections/AcquisitionPipeline'
import { PortfolioBuilder } from './pages/sections/PortfolioBuilder'
import { GapMarkets } from './pages/sections/GapMarkets'
import { LmiDetail } from './pages/sections/LmiDetail'

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { email } = useAuth()
  if (!email) return <Navigate to="/" replace />
  return <>{children}</>
}

const App: React.FC = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<Landing />} />
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
        <Route path="gaps" element={<GapMarkets />} />
        <Route path="lmi" element={<LmiDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AuthProvider>
)

export default App
