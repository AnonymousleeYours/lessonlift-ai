import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'

const app = express()
const port = Number(process.env.PORT || 8787)
const configuredOrigins = (process.env.CLIENT_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean)
const allowedOrigins = new Set([
  'https://lessonlift-ai-web.onrender.com',
  'http://localhost:5173',
  ...configuredOrigins,
])

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true)
    return callback(new Error('Origin is not allowed by LessonLift API CORS policy.'))
  },
}))
app.use(express.json({ limit: '32kb' }))

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const allowedResources = new Set(['Lesson plan', 'Notes', 'Quiz', 'Worksheet', 'TLM'])
const allowedPaces = new Set(['Slow-paced', 'Normal', 'Fast'])
const allowedLanguages = new Set(['English', 'Hindi', 'English + Hindi'])

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(openai) })
})

app.post('/api/generate', async (req, res) => {
  const { resource, board, grade, subject, chapter, topic, duration, pace, language, includeUDL } = req.body ?? {}

  if (typeof topic !== 'string' || !topic.trim() || topic.length > 500) {
    return res.status(400).json({ error: 'Enter a topic of up to 500 characters.' })
  }
  if (!allowedResources.has(resource)) return res.status(400).json({ error: 'Unsupported resource type.' })
  if (!allowedPaces.has(pace)) return res.status(400).json({ error: 'Unsupported learning pace.' })
  if (!allowedLanguages.has(language)) return res.status(400).json({ error: 'Unsupported output language.' })

  if (!openai) {
    return res.status(503).json({
      error: 'AI is not configured yet. Add OPENAI_API_KEY to the server environment to enable generation.',
    })
  }

  const systemPrompt = [
    'You are LessonLift, a careful teaching-resource assistant for Indian school teachers.',
    'Create a useful editable first draft, not a claim of official syllabus accuracy.',
    'Never invent official curriculum details, textbook page numbers, or citations.',
    'If curriculum alignment is uncertain, explicitly tell the teacher to verify the relevant textbook or syllabus.',
    'Use age-appropriate language and concrete classroom examples.',
    'For lesson plans, organize the main sequence using Engage, Explore, Explain, Elaborate, Evaluate (5E).',
    'Include learning objectives, teacher actions, student actions, checks for understanding, differentiation, and homework where relevant.',
    'For slow-paced learning, reduce concept load, scaffold instructions, include repetition and remedial checks.',
    'When inclusive options are requested, provide choices for engagement, representation, and demonstrating learning.',
    'Return readable Markdown in the requested language. Do not include HTML or scripts.',
  ].join(' ')

  const userPrompt = [
    `Resource type: ${resource}`,
    `Board/curriculum: ${String(board || 'Not specified').slice(0, 100)}`,
    `Class: ${String(grade || 'Not specified').slice(0, 40)}`,
    `Subject: ${String(subject || 'Not specified').slice(0, 100)}`,
    `Chapter/unit: ${String(chapter || 'Not specified').slice(0, 200)}`,
    `Topic: ${topic.trim()}`,
    `Duration: ${String(duration || '40 minutes').slice(0, 40)}`,
    `Learning pace: ${pace}`,
    `Output language: ${language}`,
    `Include inclusive learning options: ${includeUDL === true ? 'Yes' : 'No'}`,
    'Clearly mark the result as a teacher-review draft. Use concise headings and practical steps.',
  ].join('\n')

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })
    const content = completion.choices[0]?.message?.content
    if (!content) return res.status(502).json({ error: 'The AI returned an empty response. Please try again.' })
    return res.json({ content, model: completion.model })
  } catch (error) {
    console.error('AI generation failed:', error instanceof Error ? error.message : 'Unknown error')
    return res.status(502).json({ error: 'AI generation failed. Check server configuration and try again.' })
  }
})

app.listen(port, () => {
  console.log(`LessonLift API listening on port ${port}`)
})
