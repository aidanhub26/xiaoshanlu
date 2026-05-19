import { useState, useEffect, useRef } from 'react'
import { today, yesterday, isComplete, isEditable } from '../hooks/useRecords'

const DEFINITION = '无相布施，即不求回报的给予。无论以金钱、时间、劳力或任何善意之举帮助他人，皆为布施。'

function GratitudeField({ index, value, onChange, readOnly }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-3 w-5 h-5 rounded-full bg-[#EBF4EF] text-[#2D6A4F] text-xs flex items-center justify-center font-medium flex-shrink-0">
        {index + 1}
      </span>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder={`感恩事项 ${index + 1}`}
        rows={2}
        className={`flex-1 bg-[#F7F5F1] rounded-xl px-4 py-3 text-[15px] text-[#1A1A1A] placeholder-[#BDBDBD] leading-relaxed ${readOnly ? 'opacity-60 cursor-default' : ''}`}
      />
    </div>
  )
}

function GivingField({ value, onChange, readOnly }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-3 w-5 h-5 rounded-full bg-[#FDF6E3] text-[#C49A3C] text-xs flex items-center justify-center font-medium flex-shrink-0">
        施
      </span>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder="今日一件布施"
        rows={2}
        className={`flex-1 bg-[#F7F5F1] rounded-xl px-4 py-3 text-[15px] text-[#1A1A1A] placeholder-[#BDBDBD] leading-relaxed ${readOnly ? 'opacity-60 cursor-default' : ''}`}
      />
    </div>
  )
}

function BloomAnimation({ onDone }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(255,255,255,0.85)', animation: 'fadeOut 1.8s ease forwards' }}
      onClick={onDone}
    >
      <div style={{ animation: 'bloomScale 1.8s ease forwards' }}>
        <img src="/icon-512.png" alt="" style={{ width: 160, height: 160, borderRadius: 36 }} />
      </div>
      <style>{`
        @keyframes fadeOut {
          0%   { opacity: 1; }
          60%  { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
        @keyframes bloomScale {
          0%   { transform: scale(0.3); opacity: 0; }
          40%  { transform: scale(1.15); opacity: 1; }
          70%  { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

export default function TodayPage({ records, getEntry, updateRecord, streak }) {
  const [activeDate, setActiveDate] = useState(today())
  const [showBloom, setShowBloom] = useState(false)
  const entry = getEntry(activeDate)
  const complete = isComplete(entry)
  const readOnly = !isEditable(activeDate)
  const prevComplete = useRef(false)

  const todayStr = today()
  const yesterdayStr = yesterday()
  const isToday = activeDate === todayStr

  // Trigger bloom animation when today's entry becomes complete
  useEffect(() => {
    if (complete && !prevComplete.current && activeDate === todayStr) {
      setShowBloom(true)
      const t = setTimeout(() => setShowBloom(false), 1900)
      return () => clearTimeout(t)
    }
    prevComplete.current = complete
  }, [complete, activeDate, todayStr])

  function handleGratitude(index, val) { updateRecord(activeDate, index, val) }
  function handleGiving(val) { updateRecord(activeDate, 'giving', val) }

  const d = new Date(activeDate + 'T00:00:00')
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[d.getDay()]

  return (
    <div className="flex-1 flex flex-col overflow-y-auto pb-24">
      {showBloom && <BloomAnimation onDone={() => setShowBloom(false)} />}

      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          {/* Date nav */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveDate(yesterdayStr)}
              disabled={activeDate === yesterdayStr}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${activeDate === yesterdayStr ? 'text-[#DDD]' : 'text-[#888] hover:bg-[#F0EDE8]'}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div className="text-center">
              <p className="text-base font-semibold text-[#1A1A1A]">{month}月{day}日 · 周{weekDay}</p>
              <p className="text-xs text-[#999] mt-0.5">{isToday ? '今天' : '昨天'}</p>
            </div>
            <button
              onClick={() => setActiveDate(todayStr)}
              disabled={isToday}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${isToday ? 'text-[#DDD]' : 'text-[#888] hover:bg-[#F0EDE8]'}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1.5 bg-[#FDF6E3] px-3 py-1.5 rounded-full">
            <span className="text-base">🪷</span>
            <span className="text-[#C49A3C] font-semibold text-sm">{streak} 天</span>
          </div>
        </div>
      </div>

      {/* Completion badge */}
      {complete && (
        <div className="mx-6 mb-2 flex items-center gap-2 bg-[#EBF4EF] rounded-xl px-4 py-2.5">
          <span className="text-[#2D6A4F] text-sm">✓</span>
          <span className="text-[#2D6A4F] text-sm font-medium">{isToday ? '今日已完成' : '昨日已完成'}</span>
        </div>
      )}

      {/* Form */}
      <div className="px-6 space-y-6">
        <div>
          <p className="text-xs text-[#888] uppercase tracking-widest mb-3">三件感恩</p>
          <div className="space-y-2.5">
            {[0, 1, 2].map(i => (
              <GratitudeField
                key={i}
                index={i}
                value={entry.gratitude?.[i] || ''}
                onChange={val => handleGratitude(i, val)}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-[#888] uppercase tracking-widest mb-3">一件布施</p>
          <GivingField
            value={entry.giving || ''}
            onChange={handleGiving}
            readOnly={readOnly}
          />
        </div>

        <div className="rounded-xl bg-[#F7F5F1] px-4 py-3">
          <p className="text-[13px] text-[#999] leading-relaxed">{DEFINITION}</p>
        </div>
      </div>
    </div>
  )
}
