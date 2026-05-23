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

export function isComplete(entry) {
  if (!entry) return false
  const g = entry.gratitude || ['', '', '']
  return g[0]?.trim() && g[1]?.trim() && g[2]?.trim() && (entry.giving || '').trim()
}

export function isEditable(dateStr) {
  return dateStr <= today() // all past dates and today are editable
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
      if (i === 0 && d === today()) { cur.setDate(cur.getDate() - 1); continue }
      break
    }
  }
  return streak
}

const EMPTY = { gratitude: ['', '', ''], giving: '' }

export function useRecords(userId) {
  const [records, setRecords] = useState({})
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState(null)
  const debounceTimers = useRef({})
  const pendingEntries = useRef({})

  // Load all records on login
  useEffect(() => {
    if (!userId) { setRecords({}); setLoading(false); return }
    setLoading(true)
    supabase
      .from('xiaoshanlu_records')
      .select('date, gratitude, giving')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (error) { console.error('Load error:', error); setLoading(false); return }
        const map = {}
        for (const row of data || []) {
          map[row.date] = { gratitude: row.gratitude, giving: row.giving }
        }
        setRecords(map)
        setLoading(false)
      })
  }, [userId])

  // Write one record to Supabase
  const saveToSupabase = useCallback((dateStr, entry) => {
    if (!userId) return
    setSaveStatus('saving')
    supabase.from('xiaoshanlu_records').upsert({
      user_id: userId,
      date: dateStr,
      gratitude: entry.gratitude,
      giving: entry.giving,
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

  // Flush pending saves immediately when user switches app or closes page
  useEffect(() => {
    const flush = () => {
      const pending = pendingEntries.current
      Object.keys(pending).forEach(dateStr => {
        clearTimeout(debounceTimers.current[dateStr])
        saveToSupabase(dateStr, pending[dateStr])
      })
      pendingEntries.current = {}
    }
    const onVisibility = () => { if (document.visibilityState === 'hidden') flush() }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', flush)
    }
  }, [saveToSupabase])

  const updateRecord = useCallback((dateStr, field, value) => {
    setRecords(prev => {
      const entry = prev[dateStr] || { ...EMPTY }
      let next
      if (field === 'giving') {
        next = { ...entry, [field]: value }
      } else {
        const g = [...(entry.gratitude || ['', '', ''])]
        g[field] = value
        next = { ...entry, gratitude: g }
      }
      // Update inside updater to guarantee capture (React 18 concurrent safe)
      if (userId) pendingEntries.current[dateStr] = next
      return { ...prev, [dateStr]: next }
    })

    if (userId) {
      clearTimeout(debounceTimers.current[dateStr])
      debounceTimers.current[dateStr] = setTimeout(() => {
        const entryToSave = pendingEntries.current[dateStr]
        if (entryToSave) {
          saveToSupabase(dateStr, entryToSave)
          delete pendingEntries.current[dateStr]
        }
      }, 300)
    }
  }, [userId, saveToSupabase])

  // Immediately flush any pending save for a date (call when navigating away)
  const flushDate = useCallback((dateStr) => {
    if (!pendingEntries.current[dateStr]) return
    clearTimeout(debounceTimers.current[dateStr])
    saveToSupabase(dateStr, pendingEntries.current[dateStr])
    delete pendingEntries.current[dateStr]
  }, [saveToSupabase])

  const getEntry = useCallback((dateStr) => {
    return records[dateStr] || { ...EMPTY }
  }, [records])

  return { records, getEntry, updateRecord, flushDate, loading, saveStatus }
}
