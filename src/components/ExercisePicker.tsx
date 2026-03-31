import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import type { Exercise } from '../types'
import { exerciseDB, allMuscleGroups } from '../data/exercises'

interface Props {
  onAdd: (ex: Exercise) => void
  onClose: () => void
}

export function ExercisePicker({ onAdd, onClose }: Props) {
  const [search, setSearch] = useState('')
  const [muscle, setMuscle] = useState('All')
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [customMode, setCustomMode] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customMuscle, setCustomMuscle] = useState('')

  const allExercises = Object.values(exerciseDB).flat()
  const filtered = allExercises.filter(ex => {
    const matchMuscle = muscle === 'All' || ex.muscleGroup === muscle
    const matchSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase())
    return matchMuscle && matchSearch
  })

  const handleAdd = (name: string, muscleGroup: string, isCompound: boolean, tip: string) => {
    onAdd({ id: uuid(), name, sets: 4, reps: '8-10', restSeconds: 90, isCompound, tip, muscleGroup })
    setAdded(prev => new Set([...prev, name]))
  }

  const handleAddCustom = () => {
    if (!customName.trim()) return
    handleAdd(customName.trim(), customMuscle.trim() || 'Custom', false, '')
    setCustomName('')
    setCustomMuscle('')
    setCustomMode(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontWeight: 700, fontSize: 15 }}>Add Exercise</span>
          <button className="modal-close" onClick={onClose}>Done</button>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 14px 0' }}>
          <input
            autoFocus
            placeholder="Search exercises…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontSize: 14 }}
          />
        </div>

        {/* Muscle filter chips */}
        <div style={{ overflowX: 'auto', padding: '10px 14px', display: 'flex', gap: 6 }}>
          {['All', ...allMuscleGroups].map(m => (
            <button key={m} className={`chip ${muscle === m ? 'active' : ''}`} onClick={() => setMuscle(m)}>
              {m}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px' }}>
          {/* Custom exercise row */}
          {!customMode ? (
            <button
              onClick={() => setCustomMode(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                background: 'rgba(232,255,60,0.06)', border: '1px dashed rgba(232,255,60,0.25)',
                borderRadius: 'var(--radius-sm)', padding: '10px 12px', cursor: 'pointer',
                color: 'var(--accent)', fontSize: 13, fontWeight: 600, marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>+</span> Create Custom Exercise
            </button>
          ) : (
            <div style={{
              background: 'rgba(232,255,60,0.06)', border: '1px solid rgba(232,255,60,0.2)',
              borderRadius: 'var(--radius-sm)', padding: 12, marginBottom: 8,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <input placeholder="Exercise name *" value={customName} onChange={e => setCustomName(e.target.value)} autoFocus />
              <input placeholder="Muscle group (optional)" value={customMuscle} onChange={e => setCustomMuscle(e.target.value)} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="accent-btn" style={{ flex: 1, padding: '8px 0', fontSize: 13 }} onClick={handleAddCustom} disabled={!customName.trim()}>
                  Add
                </button>
                <button className="ghost-btn" style={{ flex: 1, padding: '8px 0', fontSize: 13 }} onClick={() => setCustomMode(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No exercises found</p>
          ) : (
            filtered.map(ex => {
              const isAdded = added.has(ex.name)
              return (
                <button
                  key={ex.name}
                  onClick={() => handleAdd(ex.name, ex.muscleGroup, ex.isCompound, ex.tip)}
                  style={{
                    display: 'flex', alignItems: 'center', width: '100%',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '10px 0', borderBottom: '1px solid var(--border)',
                    textAlign: 'left', gap: 10,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{ex.muscleGroup}</div>
                  </div>
                  <span style={{
                    fontSize: 18,
                    color: isAdded ? 'var(--accent)' : 'var(--text-dim)',
                    transition: 'color 0.15s',
                  }}>
                    {isAdded ? '✓' : '+'}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
