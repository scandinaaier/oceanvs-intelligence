import React from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { AppProvider } from '../../state/AppContext'

export const DashboardLayout: React.FC = () => (
  <AppProvider>
    <div className="min-h-full flex flex-col">
      <TopBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 px-4 pt-2 pb-10 max-w-[1440px]">
          <Outlet />
        </main>
      </div>
    </div>
  </AppProvider>
)
