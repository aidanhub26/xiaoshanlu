import { useState } from 'react'
import { toDateStr, isComplete } from '../hooks/useRecords'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay()
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function HistoryPage({ records, getEntry }) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState(null)

  const todayStr = toDateStr(now)
  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth)

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelected(null)
  }
  function nextMonth() {
    const nextDate = new Date(viewYear, viewMonth + 1, 1)
    if (nextDate > now) return
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelected(null)
  }

  const isNextDisabled = new Date(viewYear, viewMonth + 1, 1) > now

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const selectedEntry = selected ? getEntry(selected) : null
  const selectedComplete = selected ? isComplete(selectedEntry) : false

  return (
    <div className="flex-1 flex flex-col overflow-y-auto pb-24">
      {/* Month nav */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-[#1A1A1A] rounded-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span className="text-base font-medium text-[#1A1A1A]">{viewYear}年 {viewMonth + 1}月</span>
          <button
            onClick={nextMonth}
            disabled={isNextDisabled}
            className={`w-8 h-8 flex items-center justify-center rounded-full ${isNextDisabled ? 'text-[#DDD]' : 'text-[#888] hover:text-[#1A1A1A]'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="px-6">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map(w => (
            <div key={w} className="text-center text-xs text-[#BDBDBD] py-1">{w}</div>
          ))}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isFuture = dateStr > todayStr
            const done = isComplete(records[dateStr])
            const isToday = dateStr === todayStr
            const isSelected = selected === dateStr

            return (
              <button
                key={dateStr}
                onClick={() => !isFuture && setSelected(isSelected ? null : dateStr)}
                disabled={isFuture}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all ${
                  isSelected
                    ? 'bg-[#2D6A4F] text-white'
                    : isToday
                    ? 'bg-[#EBF4EF] text-[#2D6A4F] font-semibold'
                    : isFuture
                    ? 'text-[#E0E0E0] cursor-default'
                    : 'text-[#1A1A1A] hover:bg-[#F0F0EC]'
                }`}
              >
                <span>{day}</span>
                {!isFuture && done && (
                  <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#C49A3C]'}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selected && selectedEntry && (
        <div className="mx-6 mt-6 rounded-2xl bg-white border border-[#E8E4DC] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#1A1A1A]">{selected}</span>
            {selectedComplete
              ? <span className="text-xs text-[#2D6A4F] bg-[#EBF4EF] px-2.5 py-1 rounded-full">已完成</span>
              : <span className="text-xs text-[#999] bg-[#F5F3EE] px-2.5 py-1 rounded-full">未完成</span>
            }
          </div>

          <div>
            <p className="text-xs text-[#888] mb-2">三件感恩</p>
            <div className="space-y-1.5">
              {(selectedEntry.gratitude || ['', '', '']).map((g, i) => (
                <p key={i} className={`text-sm leading-relaxed ${g.trim() ? 'text-[#1A1A1A]' : 'text-[#BDBDBD] italic'}`}>
                  {i + 1}. {g.trim() || '未填写'}
                </p>
              ))}
            </div>
          </div>

          <div className="border-t border-[#F0EDE8] pt-3">
            <p className="text-xs text-[#888] mb-1.5">一件布施</p>
            <p className={`text-sm leading-relaxed ${(selectedEntry.giving || '').trim() ? 'text-[#C49A3C]' : 'text-[#BDBDBD] italic'}`}>
              {(selectedEntry.giving || '').trim() || '未填写'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
