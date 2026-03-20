import { useState, useEffect } from 'react'
import { sections, questions } from './data/mockAssessment.js'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

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
  const [remainingSeconds, setRemainingSeconds] = useState(null)
  const [unansweredWarning, setUnansweredWarning] = useState(null)
  const [results, setResults] = useState(null)
  const [resultsLoading, setResultsLoading] = useState(false)
  const [resultsError, setResultsError] = useState(null)
  const [history, setHistory] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState(null)

  // Sync timer to current section duration when entering assessment or changing section
  useEffect(() => {
    if (view !== 'assessment' || selectedMode == null) return
    const mode = MODES.find((m) => m.value === selectedMode)
    const sectionKeys = mode.sectionKeys
    const currentSectionKey = sectionKeys[currentSectionIndex]
    const section = sections.find((s) => s.key === currentSectionKey)
    if (section) setRemainingSeconds(section.durationSeconds)
  }, [view, currentSectionIndex, selectedMode])

  // Countdown every second
  useEffect(() => {
    if (view !== 'assessment' || remainingSeconds == null || remainingSeconds <= 0) return
    const id = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [view, remainingSeconds])

  // When timer hits zero, advance section or finish (no unanswered warning)
  useEffect(() => {
    if (view !== 'assessment' || remainingSeconds !== 0) return
    setUnansweredWarning(null)
    const mode = MODES.find((m) => m.value === selectedMode)
    const sectionKeys = mode.sectionKeys
    const isLastSection = currentSectionIndex === sectionKeys.length - 1
    if (isLastSection) {
      completeAssessment(answers, sectionKeys)
    } else {
      setCurrentSectionIndex((i) => i + 1)
      setCurrentQuestionIndex(0)
      setView('intermission')
    }
  }, [view, remainingSeconds, selectedMode, currentSectionIndex])

  // Fetch history when results screen is shown
  useEffect(() => {
    if (view !== 'completion' || !results) return
    setHistoryLoading(true)
    setHistoryError(null)
    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setHistory(data)
      })
      .catch((err) => setHistoryError(err.message || 'Failed to load history'))
      .finally(() => setHistoryLoading(false))
  }, [view, results])

  const handleStart = () => {
    if (!selectedMode) return
    setAnswers({})
    setCurrentQuestionIndex(0)
    setCurrentSectionIndex(0)
    setResults(null)
    setResultsError(null)
    setUnansweredWarning(null)
    setRemainingSeconds(null)
    setHistory(null)
    setHistoryError(null)
    setHistoryLoading(false)
    setView('assessment')
  }

  const handleBack = () => {
    setResults(null)
    setResultsError(null)
    setHistory(null)
    setView('landing')
  }

  const completeAssessment = async (answersToSubmit, sectionKeys) => {
    setUnansweredWarning(null)
    setResultsLoading(true)
    setResultsError(null)
    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersToSubmit, sectionKeys }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to score')
      setResults(data)
      setView('completion')
    } catch (err) {
      setResultsError(err.message || 'Unable to load results')
      setView('completion')
    } finally {
      setResultsLoading(false)
    }
  }

  const handleNextSection = () => {
    setUnansweredWarning(null)
    setCurrentSectionIndex((i) => i + 1)
    setCurrentQuestionIndex(0)
    setView('intermission')
  }

  const handleStartNextSection = () => {
    setView('assessment')
  }

  const handleFinish = () => {
    const mode = MODES.find((m) => m.value === selectedMode)
    completeAssessment(answers, mode.sectionKeys)
  }

  const handleAttemptNextSection = () => {
    const mode = MODES.find((m) => m.value === selectedMode)
    const sectionKeys = mode.sectionKeys
    const currentSectionKey = sectionKeys[currentSectionIndex]
    const sectionQuestions = questions.filter((q) => q.sectionKey === currentSectionKey)
    const unansweredCount = sectionQuestions.filter((q) => !(q.id in answers)).length
    if (unansweredCount > 0) {
      setUnansweredWarning({ action: 'nextSection', unansweredCount })
    } else {
      handleNextSection()
    }
  }

  const handleAttemptFinish = () => {
    const mode = MODES.find((m) => m.value === selectedMode)
    const sectionKeys = mode.sectionKeys
    const currentSectionKey = sectionKeys[currentSectionIndex]
    const sectionQuestions = questions.filter((q) => q.sectionKey === currentSectionKey)
    const unansweredCount = sectionQuestions.filter((q) => !(q.id in answers)).length
    if (unansweredCount > 0) {
      setUnansweredWarning({ action: 'finish', unansweredCount })
    } else {
      handleFinish()
    }
  }

  const handleConfirmProceed = () => {
    if (unansweredWarning?.action === 'nextSection') {
      handleNextSection()
    } else if (unansweredWarning?.action === 'finish') {
      handleFinish()
    }
    setUnansweredWarning(null)
  }

  const handleSelectAnswer = (questionId, key) => {
    setAnswers((prev) => ({ ...prev, [questionId]: key }))
  }

  const handleOpenReview = () => setView('review')
  const handleBackToResults = () => setView('completion')

  if (view === 'intermission') {
    const mode = MODES.find((m) => m.value === selectedMode)
    const sectionKeys = mode.sectionKeys
    const completedSectionIndex = currentSectionIndex - 1
    const completedSection = sections.find(
      (s) => s.key === sectionKeys[completedSectionIndex]
    )
    const nextSection = sections.find(
      (s) => s.key === sectionKeys[currentSectionIndex]
    )
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-xl px-6 py-16">
          <h1 className="text-2xl font-semibold text-slate-800">
            {completedSection?.title ?? 'Section'} complete
          </h1>
          <p className="mt-4 text-slate-600">
            Real testing flows often include a short break between sections. Take
            a moment if you like, then continue when ready.
          </p>
          <p className="mt-4 font-medium text-slate-800">
            Next: {nextSection?.title ?? 'Next section'}
          </p>
          <button
            type="button"
            onClick={handleStartNextSection}
            className="mt-8 w-full rounded-lg bg-slate-800 px-4 py-3 font-medium text-white hover:bg-slate-700"
          >
            Start {nextSection?.title ?? 'next section'}
          </button>
        </main>
      </div>
    )
  }

  if (view === 'review') {
    const mode = MODES.find((m) => m.value === selectedMode)
    const sectionKeys = mode.sectionKeys

    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-2xl px-6 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-800">
              Review Answers
            </h1>
            <button
              type="button"
              onClick={handleBackToResults}
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to Results
            </button>
          </div>

          <div className="space-y-10">
            {sectionKeys.map((sectionKey) => {
              const section = sections.find((s) => s.key === sectionKey)
              const sectionQuestions = questions.filter(
                (q) => q.sectionKey === sectionKey
              )
              return (
                <div key={sectionKey}>
                  <h2 className="mb-4 text-lg font-medium text-slate-800">
                    {section.title}
                  </h2>
                  <div className="space-y-6">
                    {sectionQuestions.map((q) => {
                      const selectedAnswer = answers[q.id]
                      const isUnanswered = selectedAnswer == null
                      const isCorrect =
                        !isUnanswered && selectedAnswer === q.correctAnswer
                      const selectedOption = q.options.find(
                        (o) => o.key === selectedAnswer
                      )
                      const correctOption = q.options.find(
                        (o) => o.key === q.correctAnswer
                      )

                      return (
                        <div
                          key={q.id}
                          className={`rounded-lg border p-5 ${
                            isUnanswered
                              ? 'border-amber-200 bg-amber-50/50'
                              : isCorrect
                              ? 'border-slate-200 bg-white'
                              : 'border-red-200 bg-red-50/50'
                          }`}
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              {q.skillTag}
                            </span>
                            {isUnanswered ? (
                              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                Unanswered
                              </span>
                            ) : isCorrect ? (
                              <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                                Correct
                              </span>
                            ) : (
                              <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                Incorrect
                              </span>
                            )}
                          </div>
                          <p className="mb-4 text-slate-800 leading-relaxed">
                            {q.prompt}
                          </p>
                          <div className="space-y-2 text-sm">
                            {isUnanswered ? (
                              <p className="text-amber-700">
                                You did not answer this question.
                              </p>
                            ) : (
                              <p className="text-slate-600">
                                <span className="font-medium text-slate-700">
                                  Your answer:
                                </span>{' '}
                                {selectedOption
                                  ? `${selectedAnswer}. ${selectedOption.text}`
                                  : selectedAnswer}
                              </p>
                            )}
                            <p className="text-slate-600">
                              <span className="font-medium text-emerald-700">
                                Correct answer:
                              </span>{' '}
                              {correctOption
                                ? `${q.correctAnswer}. ${correctOption.text}`
                                : q.correctAnswer}
                            </p>
                          </div>
                          <p className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600 leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            onClick={handleBackToResults}
            className="mt-10 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Results
          </button>
        </main>
      </div>
    )
  }

  if (view === 'completion') {
    const mode = MODES.find((m) => m.value === selectedMode)
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-xl px-6 py-16">
          <h1 className="text-2xl font-semibold text-slate-800">
            Assessment Complete
          </h1>

          {resultsLoading && (
            <p className="mt-6 text-slate-600">Loading your results...</p>
          )}

          {resultsError && !resultsLoading && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-slate-800">{resultsError}</p>
              <button
                type="button"
                onClick={handleBack}
                className="mt-4 rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700"
              >
                Back to Setup
              </button>
            </div>
          )}

          {results && !resultsLoading && (
            <div className="mt-6 space-y-6">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-medium text-slate-500">
                  Overall score
                </h2>
                <p className="mt-1 text-2xl font-semibold text-slate-800">
                  {results.overall.correct} / {results.overall.total}
                </p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-slate-700 mb-3">
                  By section
                </h2>
                <div className="space-y-3">
                  {results.sections.map((sec) => (
                    <div
                      key={sec.sectionKey}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-3 flex justify-between items-center"
                    >
                      <span className="font-medium text-slate-800">
                        {sec.sectionTitle}
                      </span>
                      <span className="text-slate-600">
                        {sec.correct} / {sec.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-medium text-slate-700 mb-3">
                  By skill
                </h2>
                <div className="space-y-2">
                  {results.skills.map((skill) => (
                    <div
                      key={skill.skillTag}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 flex justify-between items-center"
                    >
                      <span className="text-slate-800">{skill.skillTag}</span>
                      <span className="text-slate-600 text-sm">
                        {skill.correct} / {skill.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {results.strongestSkill && (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <h2 className="text-sm font-medium text-slate-500">
                    Strongest skill
                  </h2>
                  <p className="mt-1 font-medium text-slate-800">
                    {results.strongestSkill}
                  </p>
                </div>
              )}

              {results.weakestSkill && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <h2 className="text-sm font-medium text-slate-700">
                    What to focus on next
                  </h2>
                  <p className="mt-1 text-slate-800">
                    Prioritize practice in <strong>{results.weakestSkill}</strong>
                    , as it has the most room for improvement.
                  </p>
                </div>
              )}

              {historyLoading && (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-500">Loading progress...</p>
                </div>
              )}
              {historyError && (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-500">{historyError}</p>
                </div>
              )}
              {history && !historyLoading && history.totalAttempts > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <h2 className="text-sm font-medium text-slate-700 mb-3">
                    Progress over time
                  </h2>
                  <p className="text-xs text-slate-500 mb-3">
                    {history.totalAttempts} attempt
                    {history.totalAttempts !== 1 ? 's' : ''} completed
                  </p>
                  <div className="space-y-2 text-sm">
                    {results.sections.map((sec) => {
                      const key = sec.sectionKey
                      const best = history.bestScores?.[key]
                      const lvp = history.latestVsPrevious?.[key]
                      const hasBest = best && best.correct != null && best.total != null
                      const hasLvp = lvp?.latest && lvp?.previous
                      if (!hasBest && !hasLvp) {
                        return (
                          <div key={key} className="flex justify-between items-center py-1">
                            <span className="text-slate-700">{sec.sectionTitle}</span>
                            <span className="text-xs text-slate-500">No history yet</span>
                          </div>
                        )
                      }
                      return (
                        <div key={key} className="flex flex-col gap-0.5 py-1">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700">{sec.sectionTitle}</span>
                            {hasBest && (
                              <span className="text-slate-600">
                                Best: {best.correct}/{best.total}
                              </span>
                            )}
                          </div>
                          {hasLvp && (
                            <p className="text-xs text-slate-500">
                              Latest {lvp.latest.correct}/{lvp.latest.total} vs
                              previous {lvp.previous.correct}/{lvp.previous.total}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleOpenReview}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Review Answers
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full rounded-lg bg-slate-800 px-4 py-3 font-medium text-white hover:bg-slate-700"
                >
                  Back to Setup
                </button>
              </div>
            </div>
          )}

          {!results && !resultsError && !resultsLoading && (
            <p className="mt-4 text-slate-600">
              You have completed the {mode.label}.
            </p>
          )}
        </main>
      </div>
    )
  }

  if (view === 'assessment') {
    const mode = MODES.find((m) => m.value === selectedMode)
    const sectionKeys = mode.sectionKeys

    if (resultsLoading) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <p className="text-slate-600">Loading your results...</p>
        </div>
      )
    }
    const currentSectionKey = sectionKeys[currentSectionIndex]
    const section = sections.find((s) => s.key === currentSectionKey)
    const sectionQuestions = questions.filter((q) => q.sectionKey === currentSectionKey)
    const currentQuestion = sectionQuestions[currentQuestionIndex]
    const totalQuestions = sectionQuestions.length
    const isFirstQuestion = currentQuestionIndex === 0
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1
    const hasNextSection = currentSectionIndex < sectionKeys.length - 1

    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-2xl px-6 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-slate-800">
              {section.title}
            </h1>
            <div className="flex items-center gap-4">
              {remainingSeconds != null && (
                <span
                  className={`tabular-nums font-medium ${
                    remainingSeconds <= 60 ? 'text-amber-600' : 'text-slate-700'
                  }`}
                >
                  {formatTime(remainingSeconds)}
                </span>
              )}
              <button
                type="button"
                onClick={handleBack}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Exit Assessment
              </button>
            </div>
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
                      onClick={handleAttemptNextSection}
                      className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700"
                    >
                      Continue to Next Section
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAttemptFinish}
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

              {unansweredWarning && (
                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-slate-800">
                    {unansweredWarning.unansweredCount} question
                    {unansweredWarning.unansweredCount !== 1 ? 's' : ''} in this
                    section {unansweredWarning.unansweredCount !== 1 ? 'are' : 'is'}{' '}
                    unanswered.
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Are you sure you want to continue?
                  </p>
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setUnansweredWarning(null)}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Stay and answer
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmProceed}
                      className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                    >
                      Continue anyway
                    </button>
                  </div>
                </div>
              )}
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

        <div className="mt-10 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-2">
            Assessment overview
          </h2>
          <div className="space-y-1 text-sm text-slate-600">
            {sections.map((section) => (
              <div key={section.key} className="flex justify-between">
                <span>{section.title}</span>
                <span className="text-slate-500">
                  {Math.round(section.durationSeconds / 60)} min
                </span>
              </div>
            ))}
          </div>
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
