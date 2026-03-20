import { useState } from 'react'

const sections = [
  { key: 'reading-writing', title: 'Reading & Writing', durationMinutes: 32 },
  { key: 'math', title: 'Math', durationMinutes: 35 },
]

const MODES = [
  { value: 'full', label: 'Full Practice Test', sectionKeys: ['reading-writing', 'math'] },
  { value: 'reading-writing', label: 'Reading & Writing Only', sectionKeys: ['reading-writing'] },
  { value: 'math', label: 'Math Only', sectionKeys: ['math'] },
]

function App() {
  const [selectedMode, setSelectedMode] = useState(null)
  const [view, setView] = useState('landing')

  const handleStart = () => {
    if (!selectedMode) return
    setView('assessment')
  }

  const handleBack = () => {
    setView('landing')
  }

  if (view === 'assessment') {
    const mode = MODES.find((m) => m.value === selectedMode)
    const includedSections = sections.filter((s) =>
      mode.sectionKeys.includes(s.key)
    )

    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-xl px-6 py-16">
          <h1 className="text-2xl font-semibold text-slate-800">
            Assessment
          </h1>
          <p className="mt-4 text-slate-600">
            Mode: {mode.label}
          </p>
          <p className="mt-2 text-slate-600">
            Sections: {includedSections.map((s) => s.title).join(', ')}
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-10 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Back
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-2xl font-semibold text-slate-800">
          SAT Practice Assessment
        </h1>
        <p className="mt-4 text-slate-600 leading-relaxed">
          Take a timed two-section practice assessment and review your performance by
          section afterward. This mock experience is designed to feel focused,
          credible, and useful for prep.
        </p>

        <div className="mt-8">
          <h2 className="text-sm font-medium text-slate-700 mb-3">
            Choose assessment mode
          </h2>
          <div className="space-y-2">
            {MODES.map((mode) => (
              <label
                key={mode.value}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                  selectedMode === mode.value
                    ? 'border-slate-800 bg-slate-50 ring-2 ring-slate-800 ring-offset-2'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value={mode.value}
                  checked={selectedMode === mode.value}
                  onChange={() => setSelectedMode(mode.value)}
                  className="h-4 w-4 text-slate-800"
                />
                <span className="font-medium text-slate-800">{mode.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-10 space-y-4">
          {sections.map((section) => (
            <div
              key={section.key}
              className="rounded-lg border border-slate-200 bg-white px-5 py-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-medium text-slate-800">{section.title}</h2>
                <span className="text-sm text-slate-500">
                  {section.durationMinutes} min
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={!selectedMode}
          className="mt-10 w-full rounded-lg bg-slate-800 px-4 py-3 font-medium text-white hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          Start Assessment
        </button>
      </main>
    </div>
  )
}

export default App
