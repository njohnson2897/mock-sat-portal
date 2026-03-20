const sections = [
  { key: 'reading-writing', title: 'Reading & Writing', durationMinutes: 32 },
  { key: 'math', title: 'Math', durationMinutes: 35 },
]

function App() {
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
          className="mt-10 w-full rounded-lg bg-slate-800 px-4 py-3 font-medium text-white hover:bg-slate-700 transition-colors"
        >
          Start Assessment
        </button>
      </main>
    </div>
  )
}

export default App
