import 'dotenv/config'
import express from 'express'
import cors from 'cors'

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

const openRouterApiKey = process.env.OPENROUTER_API_KEY
const openRouterModel = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'
const openRouterBaseUrl = 'https://openrouter.ai/api/v1/chat/completions'

const allowedResources = new Set(['Lesson plan', 'Notes', 'Quiz', 'Worksheet', 'TLM'])
const allowedPaces = new Set(['Slow-paced', 'Normal', 'Fast'])
const allowedLanguages = new Set(['English', 'Hindi', 'English + Hindi'])

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(openRouterApiKey) })
})

app.post('/api/generate', async (req, res) => {
  const { resource, board, grade, subject, chapter, topic, duration, pace, language, includeUDL } = req.body ?? {}

  if (typeof topic !== 'string' || !topic.trim() || topic.length > 500) {
    return res.status(400).json({ error: 'Enter a topic of up to 500 characters.' })
  }
  if (!allowedResources.has(resource)) return res.status(400).json({ error: 'Unsupported resource type.' })
  if (!allowedPaces.has(pace)) return res.status(400).json({ error: 'Unsupported learning pace.' })
  if (!allowedLanguages.has(language)) return res.status(400).json({ error: 'Unsupported output language.' })

  if (!openRouterApiKey) {
    return res.status(503).json({
      error: 'AI is not configured yet. Add OPENROUTER_API_KEY to the server environment to enable generation.',
    })
  }

  const systemPrompt = [
    'You are LessonLift, an expert AI lesson planner and Universal Design for Learning (UDL) instructional designer for Indian school teachers.',
    'Create classroom-ready, editable teaching resources. Never invent official curriculum details, textbook page numbers, prescribed terminology, or citations.',
    'Distinguish verified curriculum-required content from teacher-added examples, enrichment, and optional activities. If curriculum alignment cannot be verified from supplied information, state the exact gap and ask the teacher to verify the official textbook or syllabus.',
    'Accessibility removes unnecessary barriers; it does not reduce cognitive demand. Keep one central learning goal and intended construct across support, grade-level, and advanced pathways.',
    'For lesson plans, use the 5E sequence: Engage, Explore, Explain, Elaborate, Evaluate. Apply UDL lenses: Engagement, Representation, and Action & Expression. Evaluate alternatives with CLEAR: Connected to the goal, Legitimate evidence of the construct, Equivalent cognitive challenge, Accessible and usable, Realistic with available resources and time.',
    'Offer equivalent response modes only when they assess the same knowledge or skill, not unrelated reading speed, writing speed, language complexity, or technology familiarity. Preserve essential concepts when simplifying language.',
    'Use realistic pacing and ensure the five phase timings sum to the stated lesson duration. Do not assume class size, prior knowledge, language needs, special learning needs, classroom setting, technology, or materials unless supplied. Mark missing information and use low-resource options by default.',
    'For slow-paced learning, scaffold instructions, reduce simultaneous concept load, use repetition and remedial checks, but preserve the intended goal and cognitive demand. Include likely misconceptions and actionable corrections.',
    'Return readable Markdown. Do not include HTML or scripts. Mark generated content as a teacher-review draft.',
  ].join(' ')

  const lessonPlanStructure = [
    'For resource type Lesson plan, use exactly these 24 top-level sections in this order:',
    '1. Lesson Overview',
    '2. Curriculum Alignment',
    '3. Central Learning Goal',
    '4. Intended Construct',
    '5. Learning Objectives',
    '6. Learning Outcomes',
    '7. Success Criteria',
    '8. Previous Knowledge',
    '9. Required TLMs/Resources',
    '10. Cognitive Demand',
    '11. UDL Planning Overview',
    '12. 5E Lesson Plan (Engage, Explore, Explain, Elaborate, Evaluate)',
    '13. UDL Options Matrix with columns Lesson Element | UDL Lens | Standard Option | Alternative Option(s) | Same Learning Goal/Construct?',
    '14. Differentiation',
    '15. Remedial Activities',
    '16. Enrichment Activities',
    '17. Assessment Questions',
    '18. Answer Key/Model Responses',
    '19. CLEAR Evaluation table with columns Option | C | L | E | A | R | Decision/Adjustment and ✓, △, ✗ ratings',
    '20. Blackboard Plan',
    '21. Homework',
    '22. Project/Assignment (or explain why not appropriate)',
    '23. Teacher Reflection',
    '24. Final Quality-Control Summary.',
    'Begin with ONE central learning goal, then construct, aligned objectives/outcomes, measurable success criteria, and approximate cognitive demand.',
    'For each 5E phase include time, teacher actions, learner actions, questions and likely responses, materials, accessibility options, and misconceptions where relevant.',
    'Include meaningful options for Engagement, Representation, and Action & Expression; support, grade-level, and advanced pathways; targeted remediation using misconception, correction/activity, and quick check; relevant enrichment; practical board plan; core and optional homework; teacher reflection prompts.',
    'Provide a balanced assessment set spanning recall, understanding, application, and analysis as appropriate. For every item provide answer/model response, cognitive level, marks, and construct. Include an assessment-access CLEAR check.',
    'List essential and optional resources separately. A project is optional and should be included only if appropriate to the duration and context.',
    'For missing optional information, state Not specified and avoid assumptions. For essential curriculum uncertainty, name the exact gap rather than inventing content.',
  ].join('\\n')

  const userPrompt = [
    `Resource type: ${resource}`,
    `Board/curriculum: ${String(board || 'Not specified').slice(0, 100)}`,
    `Class/grade: ${String(grade || 'Not specified').slice(0, 40)}`,
    `Subject: ${String(subject || 'Not specified').slice(0, 100)}`,
    `Chapter/unit: ${String(chapter || 'Not specified').slice(0, 200)}`,
    `Topic/sub-topic: ${topic.trim()}`,
    `Duration: ${String(duration || 'Not specified').slice(0, 40)}`,
    'Number of periods: Not specified; do not assume more than one session unless needed and clearly label the assumption.',
    `Learning pace: ${pace}`,
    `Output language: ${language}`,
    'Class size: Not specified.',
    'Teaching environment: Not specified.',
    'Previous knowledge: Not specified; use a brief diagnostic check rather than assuming mastery.',
    'Available resources: Not specified; distinguish essential low-resource materials from optional resources and do not assume technology.',
    'Special learning considerations: Not specified; provide universal access options without diagnosing learners or inventing individual needs.',
    'Assessment requirements: Not specified; propose aligned formative assessment and clearly state any teacher-added assessment choices.',
    `Include UDL options: ${includeUDL === true ? 'Yes, include Engagement, Representation, and Action & Expression plus CLEAR checks.' : 'Include core accessibility supports; do not create a large optional UDL matrix unless needed.'}`,
    ...(resource === 'Lesson plan' ? [lessonPlanStructure] : [
      'Use the appropriate resource-specific format rather than the 24-section lesson-plan format.',
      'Align content to the same supplied curriculum context; do not invent official syllabus details.',
      'Include teacher-review notes and distinguish curriculum-required content from optional teacher-added content.',
    ]),
    'Keep the output practical for the stated duration and mark uncertain curriculum alignment explicitly.',
  ].join('\\n')

  try {
    const completionResponse = await fetch(openRouterBaseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lessonlift-ai-web.onrender.com',
        'X-Title': 'LessonLift AI',
      },
      body: JSON.stringify({
        model: openRouterModel,
        temperature: 0.4,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    })
    if (!completionResponse.ok) {
      const providerError = await completionResponse.json().catch(() => null) as { error?: { message?: string } } | null
      console.error('OpenRouter request failed:', completionResponse.status, providerError?.error?.message || 'Provider returned an error')
      return res.status(502).json({ error: 'AI generation failed. Check the OpenRouter key, account credits, and model availability in Render.' })
    }
    const completion = await completionResponse.json() as {
      choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>
      model?: string
    }
    const rawContent = completion.choices?.[0]?.message?.content
    const content = typeof rawContent === 'string'
      ? rawContent
      : Array.isArray(rawContent)
        ? rawContent.filter((part) => typeof part.text === 'string').map((part) => part.text).join('\\n')
        : ''
    if (!content) return res.status(502).json({ error: 'The AI returned an empty response. Please try again.' })
    return res.json({ content, model: completion.model || openRouterModel })
  } catch (error) {
    console.error('AI generation failed:', error instanceof Error ? error.message : 'Unknown error')
    return res.status(502).json({ error: 'AI generation failed. Check server configuration and try again.' })
  }
})

app.listen(port, () => {
  console.log(`LessonLift API listening on port ${port}`)
})
