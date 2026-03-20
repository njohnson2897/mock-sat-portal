import express from 'express'
import { sections, questions } from './data/mockAssessment.js'
import { pool } from './db/connection.js'

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

app.get('/api/history', async (req, res) => {
  try {
    const countResult = await pool.query(
      'SELECT COUNT(*)::int as total FROM attempts'
    )
    const totalAttempts = countResult.rows[0]?.total ?? 0

    const bestResult = await pool.query(`
      SELECT DISTINCT ON (section_key) section_key, correct_count as correct, total_questions as total
      FROM attempt_section_results
      ORDER BY section_key, correct_count DESC
    `)
    const bestScores = {}
    for (const row of bestResult.rows) {
      bestScores[row.section_key] = {
        correct: row.correct,
        total: row.total,
      }
    }

    const rankedResult = await pool.query(`
      WITH ranked AS (
        SELECT asr.section_key, asr.correct_count, asr.total_questions,
               ROW_NUMBER() OVER (PARTITION BY section_key ORDER BY a.completed_at DESC NULLS LAST) as rn
        FROM attempt_section_results asr
        JOIN attempts a ON a.id = asr.attempt_id
      )
      SELECT section_key, correct_count, total_questions, rn
      FROM ranked
      WHERE rn <= 2
    `)
    const latestVsPrevious = {}
    for (const row of rankedResult.rows) {
      const entry = { correct: row.correct_count, total: row.total_questions }
      if (!latestVsPrevious[row.section_key]) {
        latestVsPrevious[row.section_key] = {}
      }
      if (row.rn === 1) {
        latestVsPrevious[row.section_key].latest = entry
      } else {
        latestVsPrevious[row.section_key].previous = entry
      }
    }

    res.json({
      totalAttempts,
      bestScores,
      latestVsPrevious,
    })
  } catch (err) {
    console.error('Failed to fetch history:', err)
    res.status(500).json({ error: 'Failed to load history' })
  }
})

app.post('/api/score', async (req, res) => {
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

  const overallTotal = includedQuestions.length

  const client = await pool.connect()
  try {
    const attemptResult = await client.query(
      `INSERT INTO attempts (completed_at, overall_correct, overall_total)
       VALUES (NOW(), $1, $2)
       RETURNING id`,
      [overallCorrect, overallTotal]
    )
    const attemptId = attemptResult.rows[0].id

    for (const [sectionKey, counts] of Object.entries(sectionCounts)) {
      await client.query(
        `INSERT INTO attempt_section_results (attempt_id, section_key, correct_count, total_questions, time_spent_seconds)
         VALUES ($1, $2, $3, $4, 0)`,
        [attemptId, sectionKey, counts.correct, counts.total]
      )
    }

    for (const question of includedQuestions) {
      const selectedAnswer = answers[question.id]
      const isCorrect =
        selectedAnswer != null && selectedAnswer === question.correctAnswer
      await client.query(
        `INSERT INTO attempt_answers (attempt_id, question_id, section_key, selected_answer, is_correct)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          attemptId,
          question.id,
          question.sectionKey,
          selectedAnswer ?? null,
          isCorrect,
        ]
      )
    }

    const sectionsResult = Object.entries(sectionCounts).map(
      ([key, counts]) => ({
        sectionKey: key,
        sectionTitle: sectionMap[key]?.title ?? key,
        correct: counts.correct,
        total: counts.total,
      })
    )

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
      attemptId,
      overall: { correct: overallCorrect, total: overallTotal },
      sections: sectionsResult,
      skills: skillsResult,
      strongestSkill,
      weakestSkill,
    })
  } catch (err) {
    console.error('Failed to persist attempt:', err)
    res.status(500).json({ error: 'Failed to save attempt' })
  } finally {
    client.release()
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
