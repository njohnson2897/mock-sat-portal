import express from 'express'
import { sections, questions } from './data/mockAssessment.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/test', (req, res) => {
  res.json({ sections, questions })
})

app.post('/api/score', (req, res) => {
  const { answers, sectionKeys } = req.body || {}
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid answers' })
  }
  if (!Array.isArray(sectionKeys)) {
    return res.status(400).json({ error: 'Missing or invalid sectionKeys' })
  }

  const includedQuestions = questions.filter((q) =>
    sectionKeys.includes(q.sectionKey)
  )
  const sectionMap = Object.fromEntries(sections.map((s) => [s.key, s]))

  let overallCorrect = 0
  const sectionCounts = {}
  const skillCounts = {}

  for (const question of includedQuestions) {
    const selectedAnswer = answers[question.id]
    const isCorrect =
      selectedAnswer != null && selectedAnswer === question.correctAnswer
    if (isCorrect) overallCorrect++

    const { sectionKey, skillTag } = question
    if (!sectionCounts[sectionKey]) {
      sectionCounts[sectionKey] = { correct: 0, total: 0 }
    }
    sectionCounts[sectionKey].total++
    if (isCorrect) sectionCounts[sectionKey].correct++

    if (!skillCounts[skillTag]) {
      skillCounts[skillTag] = { correct: 0, total: 0 }
    }
    skillCounts[skillTag].total++
    if (isCorrect) skillCounts[skillTag].correct++
  }

  const sectionsResult = Object.entries(sectionCounts).map(([key, counts]) => ({
    sectionKey: key,
    sectionTitle: sectionMap[key]?.title ?? key,
    correct: counts.correct,
    total: counts.total,
  }))

  const skillsResult = Object.entries(skillCounts).map(([skillTag, counts]) => ({
    skillTag,
    correct: counts.correct,
    total: counts.total,
  }))

  const skillsWithData = skillsResult.filter((s) => s.total > 0)
  const sorted = [...skillsWithData].sort(
    (a, b) => (b.correct / b.total) - (a.correct / a.total)
  )
  const strongestSkill = sorted[0]?.skillTag ?? null
  const weakestSkill = sorted[sorted.length - 1]?.skillTag ?? null

  res.json({
    overall: { correct: overallCorrect, total: includedQuestions.length },
    sections: sectionsResult,
    skills: skillsResult,
    strongestSkill,
    weakestSkill,
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
