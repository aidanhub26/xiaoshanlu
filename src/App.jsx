import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useRecords, calcStreak } from './hooks/useRecords'
import { supabase } from './lib/supabase'
import TodayPage from './pages/TodayPage'
import HistoryPage from './pages/HistoryPage'
import LoginPage from './pages/LoginPage'

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-0.5 pt-2 pb-1 transition-all ${
        active ? 'text-[#2D6A4F]' : 'text-[#BDBDBD]'
      }`}
    >
      {icon}
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  )
}

const TodayNavIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
)

const HistoryNavIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

function LoadingScreen() {
  return (
    <div className="min-h-dvh flex items-center justify-center" style={{ background: '#FAFAF8' }}>
      <img src="/icon-512.png" alt="" className="w-12 h-12 rounded-xl opacity-80" />
    </div>
  )
}

export default function App() {
  const user = useAuth()
  const [tab, setTab] = useState('today')
  const { records, getEntry, updateRecord, flushDate, loading, saveStatus } = useRecords(user?.id)
  const streak = calcStreak(records)

  if (user === undefined || (user && loading)) return <LoadingScreen />
  if (user === null) return <LoginPage />

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Top bar */}
      <div className="relative flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#F0EDE8]">
        <div className="flex items-center gap-2">
          <img src="/icon-512.png" alt="" className="w-7 h-7 rounded-lg" />
          <span className="text-base font-semibold text-[#1A1A1A] tracking-wide">无相日记</span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#FDF6E3] px-3 py-1.5 rounded-full">
          <span className="text-base leading-none">🪷</span>
          <span className="text-[#C49A3C] font-semibold text-sm">{streak} 天</span>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-xs text-[#BDBDBD] px-2 py-1"
        >
          退出
        </button>
      </div>

      {/* Page content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {tab === 'today'
          ? <TodayPage getEntry={getEntry} updateRecord={updateRecord} flushDate={flushDate} saveStatus={saveStatus} />
          : <HistoryPage records={records} getEntry={getEntry} />
        }
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <div className="max-w-[430px] mx-auto bg-white border-t border-[#F0EDE8] flex pb-2">
          <NavItem
            icon={<TodayNavIcon />}
            label="记录"
            active={tab === 'today'}
            onClick={() => setTab('today')}
          />
          <NavItem
            icon={<HistoryNavIcon />}
            label="历史"
            active={tab === 'history'}
            onClick={() => setTab('history')}
          />
        </div>
      </div>
    </div>
  )
}
