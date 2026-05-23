import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function today() { return toDateStr(new Date()) }
export function yesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toDateStr(d)
}

// Streak only requires 3 gratitude + 1 giving; repentance is optional
export function isComplete(entry) {
  if (!entry) return false
  const g = entry.gratitude || ['', '', '']
  return g[0]?.trim() && g[1]?.trim() && g[2]?.trim() && (entry.giving || '').trim()
}

export function isEditable(dateStr) {
  return dateStr === today() || dateStr === yesterday()
}

export function calcStreak(records) {
  let streak = 0
  const cur = new Date()
  for (let i = 0; i < 3650; i++) {
    const d = toDateStr(cur)
    if (isComplete(records[d])) {
      streak++
      cur.setDate(cur.getDate() - 1)
    } else {
      if (i === 0 && d === today()) {
        cur.setDate(cur.getDate() - 1)
        continue
      }
      break
    }
  }
  return streak
}

const EMPTY = { gratitude: ['', '', ''], giving: '', repentance: '' }

export function useRecords(userId) {
  const [records, setRecords] = useState({})
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState(null)
  const debounceTimers = useRef({}) // one timer per dateStr

  useEffect(() => {
    if (!userId) { setRecords({}); setLoading(false); return }
    setLoading(true)
    supabase
      .from('xiaoshanlu_records')
      .select('date, gratitude, giving, repentance')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (error) { console.error('Load error:', error); setLoading(false); return }
        const map = {}
        for (const row of data || []) {
          map[row.date] = { gratitude: row.gratitude, giving: row.giving, repentance: row.repentance || '' }
        }
        setRecords(map)
        setLoading(false)
      })
  }, [userId])

  const saveToSupabase = useCallback((dateStr, entry) => {
    if (!userId) return
    setSaveStatus('saving')
    supabase.from('xiaoshanlu_records').upsert({
      user_id: userId,
      date: dateStr,
      gratitude: entry.gratitude,
      giving: entry.giving,
      repentance: entry.repentance,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,date' })
      .then(({ error }) => {
        if (error) {
          console.error('Save error:', error)
          setSaveStatus('error:' + error.message)
        } else {
          setSaveStatus('ok')
          setTimeout(() => setSaveStatus(null), 2000)
        }
      })
  }, [userId])

  const updateRecord = useCallback((dateStr, field, value) => {
    let nextEntry
    setRecords(prev => {
      const entry = prev[dateStr] || { ...EMPTY }
      let next
      if (field === 'giving' || field === 'repentance') {
        next = { ...entry, [field]: value }
      } else {
        const g = [...(entry.gratitude || ['', '', ''])]
        g[field] = value
        next = { ...entry, gratitude: g }
      }
      nextEntry = next
      return { ...prev, [dateStr]: next }
    })

    // Debounce: cancel previous pending save for this date, fire after 800ms idle
    if (nextEntry && userId) {
      clearTimeout(debounceTimers.current[dateStr])
      debounceTimers.current[dateStr] = setTimeout(() => {
        saveToSupabase(dateStr, nextEntry)
      }, 800)
    }
  }, [userId, saveToSupabase])

  const getEntry = useCallback((dateStr) => {
    return records[dateStr] || { ...EMPTY }
  }, [records])

  return { records, getEntry, updateRecord, loading, saveStatus }
}
