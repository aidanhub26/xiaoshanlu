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
        placeholder=""
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
        placeholder=""
        rows={2}
        className={`flex-1 bg-[#F7F5F1] rounded-xl px-4 py-3 text-[15px] text-[#1A1A1A] placeholder-[#BDBDBD] leading-relaxed ${readOnly ? 'opacity-60 cursor-default' : ''}`}
      />
    </div>
  )
}


function BloomAnimation() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div style={{ animation: 'bloomFade 1.8s ease forwards', fontSize: 120, lineHeight: 1 }}>
        🪷
      </div>
      <style>{`
        @keyframes bloomFade {
          0%   { transform: scale(0.3); opacity: 0; }
          40%  { transform: scale(1.15); opacity: 1; }
          70%  { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function TodayPage({ getEntry, updateRecord, saveStatus }) {
  const [activeDate, setActiveDate] = useState(today())
  const [showBloom, setShowBloom] = useState(false)
  const entry = getEntry(activeDate)
  const complete = isComplete(entry)
  const readOnly = !isEditable(activeDate)
  const prevComplete = useRef(false)
  const prevActiveDate = useRef(activeDate)
  const shownBloom = useRef(new Set())

  const todayStr = today()
  const yesterdayStr = yesterday()
  const isToday = activeDate === todayStr
  const isYesterday = activeDate === yesterdayStr

  function prevDay() {
    const d = new Date(activeDate + 'T00:00:00')
    d.setDate(d.getDate() - 1)
    setActiveDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)
  }
  function nextDay() {
    if (isToday) return
    const d = new Date(activeDate + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    setActiveDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)
  }

  // Only trigger bloom the very first time an entry is completed (not on re-edits or date switching)
  useEffect(() => {
    const sameDate = prevActiveDate.current === activeDate
    if (complete && !prevComplete.current && sameDate && !shownBloom.current.has(activeDate)) {
      shownBloom.current.add(activeDate)
      setShowBloom(true)
      const t = setTimeout(() => setShowBloom(false), 1900)
      prevComplete.current = complete
      prevActiveDate.current = activeDate
      return () => clearTimeout(t)
    }
    prevComplete.current = complete
    prevActiveDate.current = activeDate
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
      {showBloom && <BloomAnimation />}

      {/* Save error */}
      {saveStatus && saveStatus.startsWith('error') && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-500">
          保存失败：{saveStatus.replace('error:', '')}
        </div>
      )}

      {/* Date nav */}
      <div className="relative pt-6 pb-2 flex items-center justify-center">
        {/* Left arrow - absolute left edge */}
        <button
          onClick={prevDay}
          className="absolute left-4 w-9 h-9 flex items-center justify-center rounded-full text-[#888] hover:bg-[#F0EDE8] transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        {/* Center label - truly centered, grouped as one chip */}
        <div className="flex items-center gap-3 bg-[#F7F5F1] px-5 py-2 rounded-full whitespace-nowrap">
          {(isToday || isYesterday) ? (
            <>
              <span className="text-sm text-[#999]">{month}月{day}日</span>
              <span className="text-base font-semibold text-[#1A1A1A]">{isToday ? '今天' : '昨天'}</span>
              <span className="text-sm text-[#999]">周{weekDay}</span>
            </>
          ) : (
            <>
              <span className="text-base font-semibold text-[#1A1A1A]">{month}月{day}日</span>
              <span className="text-sm text-[#999]">周{weekDay}</span>
            </>
          )}
        </div>

        {/* Right arrow - absolute right edge */}
        {!isToday ? (
          <button
            onClick={nextDay}
            className="absolute right-4 w-9 h-9 flex items-center justify-center rounded-full text-[#888] hover:bg-[#F0EDE8] transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        ) : null}
      </div>

      {/* Back to today */}
      {!isToday && (
        <button
          onClick={() => setActiveDate(todayStr)}
          className="mx-auto mb-1 text-sm text-[#2D6A4F] py-1 px-4"
        >
          回到今天
        </button>
      )}

      {/* Completion badge */}
      {complete && (
        <div className="mx-6 mb-2 flex items-center gap-2 bg-[#EBF4EF] rounded-xl px-4 py-2.5">
          <span className="text-[#2D6A4F] text-sm">✓</span>
          <span className="text-[#2D6A4F] text-sm font-medium">{isToday ? '今日已完成' : isYesterday ? '昨日已完成' : '当日已完成'}</span>
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

<div className="px-1 py-2">
          <p className="text-[13px] text-[#BDBDBD] leading-relaxed">{DEFINITION}</p>
        </div>

      </div>
    </div>
  )
}
