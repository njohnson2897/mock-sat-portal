import { useState } from 'react'
import { sections, questions } from './data/mockAssessment.js'

const MODES = [
  { value: 'full', label: 'Full Practice Test', sectionKeys: ['reading-writing', 'math'] },
  { value: 'reading-writing', label: 'Reading & Writing Only', sectionKeys: ['reading-writing'] },
  { value: 'math', label: 'Math Only', sectionKeys: ['math'] },
]

function App() {
  const [selectedMode, setSelectedMode] = useState(null)
  const [view, setView] = useState('landing')
  const [answers, setAnswers] = useState({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)

  const handleStart = () => {
    if (!selectedMode) return
    setAnswers({})
    setCurrentQuestionIndex(0)
    setCurrentSectionIndex(0)
    setView('assessment')
  }

  const handleBack = () => {
    setView('landing')
  }

  const handleNextSection = () => {
    setCurrentSectionIndex((i) => i + 1)
    setCurrentQuestionIndex(0)
  }

  const handleFinish = () => {
    setView('completion')
  }

  const handleSelectAnswer = (questionId, key) => {
    setAnswers((prev) => ({ ...prev, [questionId]: key }))
  }

  if (view === 'completion') {
    const mode = MODES.find((m) => m.value === selectedMode)
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-xl px-6 py-16">
          <h1 className="text-2xl font-semibold text-slate-800">
            Assessment Complete
          </h1>
          <p className="mt-4 text-slate-600">
            You have completed the {mode.label}.
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-10 rounded-lg bg-slate-800 px-4 py-3 font-medium text-white hover:bg-slate-700"
          >
            Back to Setup
          </button>
        </main>
      </div>
    )
  }

  if (view === 'assessment') {
    const mode = MODES.find((m) => m.value === selectedMode)
    const sectionKeys = mode.sectionKeys
    const currentSectionKey = sectionKeys[currentSectionIndex]
    const section = sections.find((s) => s.key === currentSectionKey)
    const sectionQuestions = questions.filter((q) => q.sectionKey === currentSectionKey)
    const currentQuestion = sectionQuestions[currentQuestionIndex]
    const totalQuestions = sectionQuestions.length
    const isFirstQuestion = currentQuestionIndex === 0
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1
    const isLastSection = currentSectionIndex === sectionKeys.length - 1
    const hasNextSection = currentSectionIndex < sectionKeys.length - 1

    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-2xl px-6 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-slate-800">
              {section.title}
            </h1>
            <button
              type="button"
              onClick={handleBack}
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
          </div>

          <div className="flex gap-8">
            <div className="flex-1">
              <p className="mb-4 text-sm text-slate-500">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <p className="mb-6 text-slate-800 leading-relaxed">
                  {currentQuestion.prompt}
                </p>
                <div className="space-y-3">
                  {currentQuestion.options.map((opt) => (
                    <label
                      key={opt.key}
                      className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === opt.key
                          ? 'border-slate-800 bg-slate-50 ring-2 ring-slate-800 ring-offset-1'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={opt.key}
                        checked={answers[currentQuestion.id] === opt.key}
                        onChange={() => handleSelectAnswer(currentQuestion.id, opt.key)}
                        className="mt-1 h-4 w-4 text-slate-800"
                      />
                      <span className="text-slate-800">
                        <span className="font-medium">{opt.key}.</span> {opt.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                  disabled={isFirstQuestion}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {isLastQuestion ? (
                  hasNextSection ? (
                    <button
                      type="button"
                      onClick={handleNextSection}
                      className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700"
                    >
                      Continue to Next Section
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFinish}
                      className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700"
                    >
                      Finish Assessment
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIndex((i) =>
                        Math.min(totalQuestions - 1, i + 1)
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>

            <aside className="w-40 shrink-0">
              <h2 className="mb-3 text-sm font-medium text-slate-700">
                Question Overview
              </h2>
              <div className="flex flex-wrap gap-2">
                {sectionQuestions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIndex
                  const isAnswered = q.id in answers
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 w-9 rounded text-sm font-medium transition-colors ${
                        isCurrent
                          ? 'bg-slate-800 text-white ring-2 ring-slate-800 ring-offset-2'
                          : isAnswered
                          ? 'border border-slate-400 bg-slate-100 text-slate-800'
                          : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>
            </aside>
          </div>
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
                  {Math.round(section.durationSeconds / 60)} min
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
