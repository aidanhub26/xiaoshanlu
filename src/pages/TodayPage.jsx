import { useState } from 'react'
import { today, yesterday, isEditable, isComplete, calcStreak, useRecords } from '../hooks/useRecords'

const DEFINITION = '无相布施，即不求回报的给予。无论以金钱、时间、劳力或任何善意之举帮助他人，皆为布施。'

function DateTab({ label, dateStr, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
        active
          ? 'bg-[#2D6A4F] text-white'
          : 'text-[#888] hover:text-[#1A1A1A]'
      }`}
    >
      {label}
    </button>
  )
}

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
        className={`flex-1 bg-[#F7F5F1] rounded-xl px-4 py-3 text-[15px] text-[#1A1A1A] placeholder-[#BDBDBD] leading-relaxed ${
          readOnly ? 'opacity-60 cursor-default' : ''
        }`}
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
        className={`flex-1 bg-[#F7F5F1] rounded-xl px-4 py-3 text-[15px] text-[#1A1A1A] placeholder-[#BDBDBD] leading-relaxed ${
          readOnly ? 'opacity-60 cursor-default' : ''
        }`}
      />
    </div>
  )
}

export default function TodayPage({ records, getEntry, updateRecord, streak }) {
  const [activeDate, setActiveDate] = useState(today())
  const entry = getEntry(activeDate)
  const readOnly = !isEditable(activeDate)
  const complete = isComplete(entry)

  const todayStr = today()
  const yesterdayStr = yesterday()

  function handleGratitude(index, val) {
    updateRecord(activeDate, index, val)
  }
  function handleGiving(val) {
    updateRecord(activeDate, 'giving', val)
  }

  const todayDate = new Date()
  const month = todayDate.getMonth() + 1
  const day = todayDate.getDate()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[todayDate.getDay()]

  return (
    <div className="flex-1 flex flex-col overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#888] text-sm">{month}月{day}日 · 周{weekDay}</p>
          </div>
          {/* Streak */}
          <div className="flex items-center gap-1.5 bg-[#FDF6E3] px-3 py-1.5 rounded-full">
            <span className="text-[#C49A3C] text-base">🔥</span>
            <span className="text-[#C49A3C] font-semibold text-sm">{streak} 天</span>
          </div>
        </div>

        {/* Date tabs */}
        <div className="flex gap-2 mt-4">
          <DateTab label="昨天" dateStr={yesterdayStr} active={activeDate === yesterdayStr} onClick={() => setActiveDate(yesterdayStr)} />
          <DateTab label="今天" dateStr={todayStr} active={activeDate === todayStr} onClick={() => setActiveDate(todayStr)} />
        </div>
      </div>

      {/* Completion badge */}
      {complete && (
        <div className="mx-6 mb-2 flex items-center gap-2 bg-[#EBF4EF] rounded-xl px-4 py-2.5">
          <span className="text-[#2D6A4F] text-sm">✓</span>
          <span className="text-[#2D6A4F] text-sm font-medium">今日已完成</span>
        </div>
      )}

      {/* Form */}
      <div className="px-6 space-y-6">
        {/* Gratitude section */}
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

        {/* Giving section */}
        <div>
          <p className="text-xs text-[#888] uppercase tracking-widest mb-3">一件布施</p>
          <GivingField
            value={entry.giving || ''}
            onChange={handleGiving}
            readOnly={readOnly}
          />
        </div>

        {/* Definition hint */}
        <div className="rounded-xl bg-[#F7F5F1] px-4 py-3">
          <p className="text-[13px] text-[#999] leading-relaxed">{DEFINITION}</p>
        </div>
      </div>
    </div>
  )
}
