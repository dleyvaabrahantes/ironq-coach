import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import type { TrainingDay, Exercise, CoachPlan, Macros } from './types'
import { DAY_NAMES, DAY_SHORT } from './types'
import { publishPlan } from './api/client'
import { ExercisePicker } from './components/ExercisePicker'
import { ShareModal } from './components/ShareModal'

// ─── Default macros ───────────────────────────────────────────────

const DEFAULT_MACROS: Macros = { calories: 2200, proteinG: 160, carbsG: 220, fatG: 65 }

const defaultDays = (): TrainingDay[] =>
  Array.from({ length: 7 }, (_, i) => ({
    id: uuid(),
    dayIndex: i,
    isRestDay: i === 5 || i === 6,
    focusArea: '',
    estimatedMinutes: 0,
    exercises: [],
  }))

// ─── Main App ────────────────────────────────────────────────────

export default function App() {
  const [coachName, setCoachName] = useState('')
  const [note, setNote] = useState('')
  const [days, setDays] = useState<TrainingDay[]>(defaultDays)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [pickerDayId, setPickerDayId] = useState<string | null>(null)
  const [macros, setMacros] = useState<Macros>(DEFAULT_MACROS)
  const [hydration, setHydration] = useState(2.5)
  const [nutritionNote, setNutritionNote] = useState('')
  const [showNutrition, setShowNutrition] = useState(false)
  const [shareResult, setShareResult] = useState<{ id: string; url: string } | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')

  // ─── Day helpers ─────────────────────────────────────────────

  const toggleRest = (dayId: string) =>
    setDays(d => d.map(day => day.id === dayId ? { ...day, isRestDay: !day.isRestDay, exercises: [] } : day))

  const setFocus = (dayId: string, focus: string) =>
    setDays(d => d.map(day => day.id === dayId ? { ...day, focusArea: focus } : day))

  const addExercise = (dayId: string, ex: Exercise) =>
    setDays(d => d.map(day => day.id === dayId ? { ...day, exercises: [...day.exercises, ex] } : day))

  const removeExercise = (dayId: string, exId: string) =>
    setDays(d => d.map(day => day.id === dayId
      ? { ...day, exercises: day.exercises.filter(e => e.id !== exId) } : day))

  const updateExercise = (dayId: string, ex: Exercise) =>
    setDays(d => d.map(day => day.id === dayId
      ? { ...day, exercises: day.exercises.map(e => e.id === ex.id ? ex : e) } : day))

  // ─── Publish ─────────────────────────────────────────────────

  const handlePublish = async () => {
    setPublishing(true)
    setPublishError('')
    try {
      const plan: CoachPlan = {
        version: 1,
        coachName: coachName.trim() || 'Coach',
        note: note.trim(),
        createdAt: new Date().toISOString(),
        trainingPlan: {
          days,
          weeklyNotes: '',
          generatedAt: new Date().toISOString(),
        },
        nutritionPlan: showNutrition ? {
          dailyMacros: macros,
          meals: [],
          hydrationLiters: hydration,
          notes: nutritionNote,
          generatedAt: new Date().toISOString(),
        } : undefined,
      }
      const result = await publishPlan(plan)
      setShareResult({ id: result.id, url: result.url })
    } catch (e) {
      setPublishError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setPublishing(false)
    }
  }

  const canPublish = days.some(d => !d.isRestDay && d.exercises.length > 0)

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '20px 20px 0',
        borderBottom: `1px solid var(--border)`,
        paddingBottom: 20,
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.5px' }}>IRONIQ</span>
            <span style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 500, paddingLeft: 8, borderLeft: '1px solid var(--border)' }}>Coach</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>
            Build a training plan and share it directly to your client's IronQ app.
          </p>
        </div>
      </header>

      <main style={{ flex: 1, padding: '24px 20px', maxWidth: 680, margin: '0 auto', width: '100%' }}>

        {/* Coach info */}
        <section style={{ marginBottom: 28 }}>
          <p className="section-label">Your Info</p>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              placeholder="Your name (shown to client)"
              value={coachName}
              onChange={e => setCoachName(e.target.value)}
            />
            <textarea
              placeholder="Message or note to your client (optional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              style={{ minHeight: 60 }}
            />
          </div>
        </section>

        {/* Week builder */}
        <section style={{ marginBottom: 28 }}>
          <p className="section-label">Training Plan</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {days.map(day => (
              <DayCard
                key={day.id}
                day={day}
                isExpanded={expandedDay === day.id}
                onToggleExpand={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                onToggleRest={() => toggleRest(day.id)}
                onFocusChange={f => setFocus(day.id, f)}
                onAddExercise={() => { setExpandedDay(day.id); setPickerDayId(day.id) }}
                onRemoveExercise={exId => removeExercise(day.id, exId)}
                onUpdateExercise={ex => updateExercise(day.id, ex)}
              />
            ))}
          </div>
        </section>

        {/* Nutrition (collapsible) */}
        <section style={{ marginBottom: 28 }}>
          <button
            onClick={() => setShowNutrition(n => !n)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, background: 'none',
              border: 'none', cursor: 'pointer', color: 'var(--text)', width: '100%',
              padding: 0, marginBottom: showNutrition ? 12 : 0,
            }}
          >
            <span className="section-label" style={{ margin: 0 }}>Nutrition Plan</span>
            <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 'auto' }}>{showNutrition ? '▲ Hide' : '▼ Add'}</span>
          </button>
          {showNutrition && (
            <NutritionEditor macros={macros} setMacros={setMacros} hydration={hydration} setHydration={setHydration} note={nutritionNote} setNote={setNutritionNote} />
          )}
        </section>

        {/* Publish */}
        {publishError && (
          <p style={{ color: '#FF6B6B', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{publishError}</p>
        )}
        <button
          className="accent-btn"
          onClick={handlePublish}
          disabled={!canPublish || publishing}
        >
          {publishing ? 'Generating link…' : '🔗 Generate Share Link'}
        </button>
        {!canPublish && (
          <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', marginTop: 8 }}>
            Add at least one exercise to a training day first.
          </p>
        )}
      </main>

      {/* Exercise picker modal */}
      {pickerDayId && (
        <ExercisePicker
          onAdd={ex => addExercise(pickerDayId, ex)}
          onClose={() => setPickerDayId(null)}
        />
      )}

      {/* Share modal */}
      {shareResult && (
        <ShareModal
          planId={shareResult.id}
          url={shareResult.url}
          onClose={() => setShareResult(null)}
        />
      )}
    </div>
  )
}

// ─── DayCard ────────────────────────────────────────────────────

function DayCard({
  day, isExpanded, onToggleExpand, onToggleRest,
  onFocusChange, onAddExercise, onRemoveExercise, onUpdateExercise,
}: {
  day: TrainingDay
  isExpanded: boolean
  onToggleExpand: () => void
  onToggleRest: () => void
  onFocusChange: (f: string) => void
  onAddExercise: () => void
  onRemoveExercise: (id: string) => void
  onUpdateExercise: (ex: Exercise) => void
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
          cursor: day.isRestDay ? 'default' : 'pointer',
        }}
        onClick={day.isRestDay ? undefined : onToggleExpand}
      >
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: day.isRestDay ? 'var(--border)' : 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700,
          color: day.isRestDay ? 'var(--text-dim)' : '#0A0A0F',
        }}>
          {DAY_SHORT[day.dayIndex]}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            {day.isRestDay ? 'Rest Day' : (day.focusArea || DAY_NAMES[day.dayIndex])}
          </div>
          {!day.isRestDay && (
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 1 }}>
              {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Rest toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={e => e.stopPropagation()}>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Rest</span>
          <div
            onClick={onToggleRest}
            style={{
              width: 40, height: 22, borderRadius: 11,
              background: day.isRestDay ? 'var(--accent)' : 'var(--border)',
              position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: day.isRestDay ? 21 : 3,
              width: 16, height: 16, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s',
            }} />
          </div>
        </label>

        {!day.isRestDay && (
          <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{isExpanded ? '▲' : '▼'}</span>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && !day.isRestDay && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            placeholder="Day name (e.g. Leg Day, Push…)"
            value={day.focusArea}
            onChange={e => onFocusChange(e.target.value)}
            onClick={e => e.stopPropagation()}
          />

          {day.exercises.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', padding: '8px 0' }}>No exercises yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {day.exercises.map(ex => (
                <ExerciseRow key={ex.id} exercise={ex} onRemove={() => onRemoveExercise(ex.id)} onUpdate={onUpdateExercise} />
              ))}
            </div>
          )}

          <button
            style={{
              background: 'rgba(232,255,60,0.1)', border: '1px dashed rgba(232,255,60,0.3)',
              borderRadius: 'var(--radius-sm)', color: 'var(--accent)', cursor: 'pointer',
              padding: '10px', fontSize: 13, fontWeight: 600,
            }}
            onClick={e => { e.stopPropagation(); onAddExercise() }}
          >
            + Add Exercise
          </button>
        </div>
      )}
    </div>
  )
}

// ─── ExerciseRow ─────────────────────────────────────────────────

function ExerciseRow({ exercise, onRemove, onUpdate }: {
  exercise: Exercise
  onRemove: () => void
  onUpdate: (ex: Exercise) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exercise.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 1 }}>
            {exercise.sets} × {exercise.reps} · {exercise.restSeconds}s rest · {exercise.muscleGroup}
          </div>
        </div>
        <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}>⚙</button>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.7)', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}>✕</button>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Sets</label>
              <input type="number" min={1} max={10} value={exercise.sets}
                onChange={e => onUpdate({ ...exercise, sets: parseInt(e.target.value) || 1 })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Reps</label>
              <input value={exercise.reps} onChange={e => onUpdate({ ...exercise, reps: e.target.value })} placeholder="8-10" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Rest (s)</label>
              <input type="number" min={15} max={300} step={15} value={exercise.restSeconds}
                onChange={e => onUpdate({ ...exercise, restSeconds: parseInt(e.target.value) || 60 })} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── NutritionEditor ──────────────────────────────────────────────

function NutritionEditor({ macros, setMacros, hydration, setHydration, note, setNote }: {
  macros: Macros
  setMacros: (m: Macros) => void
  hydration: number
  setHydration: (h: number) => void
  note: string
  setNote: (n: string) => void
}) {
  const updateMacro = (key: keyof Macros, val: number) => setMacros({ ...macros, [key]: val })

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SliderField label="Daily Calories" value={macros.calories} min={1200} max={4500} step={50}
        format={v => `${v} kcal`} onChange={v => updateMacro('calories', v)} accent />
      <SliderField label="Protein" value={macros.proteinG} min={50} max={300} step={5}
        format={v => `${v}g`} onChange={v => updateMacro('proteinG', v)} />
      <SliderField label="Carbohydrates" value={macros.carbsG} min={50} max={500} step={5}
        format={v => `${v}g`} onChange={v => updateMacro('carbsG', v)} />
      <SliderField label="Fat" value={macros.fatG} min={20} max={200} step={5}
        format={v => `${v}g`} onChange={v => updateMacro('fatG', v)} />
      <SliderField label="Hydration" value={hydration} min={1} max={5} step={0.1}
        format={v => `${v.toFixed(1)}L`} onChange={setHydration} />
      <textarea placeholder="Nutrition notes (optional)" value={note} onChange={e => setNote(e.target.value)} style={{ minHeight: 52 }} />
    </div>
  )
}

function SliderField({ label, value, min, max, step, format, onChange, accent }: {
  label: string; value: number; min: number; max: number; step: number
  format: (v: number) => string; onChange: (v: number) => void; accent?: boolean
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: accent ? 'var(--accent)' : 'var(--text)' }}>{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)' }}
      />
    </div>
  )
}
