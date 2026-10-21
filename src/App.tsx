import { useMemo, useState } from 'react'
import { BookOpen, BrainCircuit, Check, ChevronDown, CircleHelp, ClipboardList, Download, FileText, GraduationCap, LayoutDashboard, Library, Lightbulb, Menu, Plus, Search, Settings2, Sparkles, WandSparkles, X } from 'lucide-react'

type ResourceType = 'Lesson plan' | 'Notes' | 'Quiz' | 'Worksheet' | 'TLM'
type Lesson = { id: number; title: string; subject: string; grade: string; board: string; updated: string; type: ResourceType }

const initialLessons: Lesson[] = [
  { id: 1, title: 'Introduction to Computer Networks', subject: 'Computer Science', grade: 'Class 8', board: 'NCERT', updated: 'Today', type: 'Lesson plan' },
  { id: 2, title: 'Number Systems', subject: 'Mathematics', grade: 'Class 9', board: 'JAC', updated: 'Yesterday', type: 'Notes' },
  { id: 3, title: 'Parts of a Computer', subject: 'Computer Science', grade: 'Class 6', board: 'NCERT', updated: '2 days ago', type: 'Worksheet' },
]

const subjects = ['Mathematics', 'Computer Science', 'Science', 'English', 'Hindi', 'Social Science', 'Environmental Studies', 'Other']
const boards = ['NCERT', 'CBSE', 'Jharkhand (JAC)', 'ICSE', 'Bihar Board', 'West Bengal Board', 'Odisha Board', 'Other State Board']
const stages = [
  { name: 'Engage', time: '5 min', hint: 'Connect to prior knowledge with a question, story, or real-life situation.' },
  { name: 'Explore', time: '10 min', hint: 'Let learners investigate, discuss, observe, or solve a small challenge.' },
  { name: 'Explain', time: '10 min', hint: 'Build the core concept with clear explanations, examples, and vocabulary.' },
  { name: 'Elaborate', time: '10 min', hint: 'Apply learning to a new example, activity, or real-world problem.' },
  { name: 'Evaluate', time: '5 min', hint: 'Check understanding with a short exit ticket or formative assessment.' },
]

function App() {
  const [active, setActive] = useState('Overview')
  const [mobileNav, setMobileNav] = useState(false)
  const [resource, setResource] = useState<ResourceType>('Lesson plan')
  const [board, setBoard] = useState('NCERT')
  const [grade, setGrade] = useState('Class 6')
  const [subject, setSubject] = useState('Computer Science')
  const [chapter, setChapter] = useState('')
  const [duration, setDuration] = useState('40 minutes')
  const [pace, setPace] = useState('Slow-paced')
  const [language, setLanguage] = useState('English + Hindi')
  const [topic, setTopic] = useState('')
  const [includeUDL, setIncludeUDL] = useState(true)
  const [generated, setGenerated] = useState(false)
  const [saved, setSaved] = useState(false)
  const [search, setSearch] = useState('')
  const [lessons, setLessons] = useState(initialLessons)

  const filteredLessons = useMemo(() => lessons.filter((item) => [item.title, item.subject, item.grade, item.type].join(' ').toLowerCase().includes(search.toLowerCase())), [lessons, search])

  function generate() {
    if (!topic.trim()) return
    setGenerated(true)
    setSaved(false)
  }

  function saveResource() {
    const title = topic.trim()
    if (!title) return
    setLessons((items) => [{ id: Date.now(), title, subject, grade, board, updated: 'Just now', type: resource }, ...items])
    setSaved(true)
  }

  function downloadText() {
    const lines = [
      `${resource}: ${topic}`, `Board: ${board} | ${grade} | ${subject}`,
      `Duration: ${duration} | Pace: ${pace} | Language: ${language}`, '',
      'Learning objectives', `• Explain the key ideas in ${topic} using age-appropriate examples.`, '• Apply the concept to a short classroom task.', '',
      ...stages.flatMap((s) => [`${s.name} — ${s.time}`, s.hint, '']),
      'Assessment', '1. Explain the main idea in your own words.', '2. Give one example from everyday life.',
      includeUDL ? '\nUDL options: offer oral, written, or drawn responses; provide a worked example and an optional extension challenge.' : '',
      '\nTeacher note: Review and align this draft with the official textbook and local syllabus before teaching.',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'lessonlift-resource'}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Create resource', icon: WandSparkles },
    { label: 'My library', icon: Library },
  ]

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><GraduationCap size={23} /></div><div><strong>LessonLift <span>AI</span></strong><small>Lift the load for teachers</small></div><button className="icon-button close-nav" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={19}/></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>{navItems.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => { setActive(label); setMobileNav(false) }}><Icon size={18}/><span>{label}</span>{label === 'My library' && <span className="nav-count">{lessons.length}</span>}</button>)}</nav>
        <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><strong>Need a hand?</strong><p>Start small. Build a great lesson.</p><button onClick={() => setActive('Create resource')}>Explore the workspace <span>↗</span></button></div><div className="profile"><div className="avatar">T</div><div><strong>Teacher workspace</strong><small>Local demo · no sign-in</small></div><Settings2 size={17} className="profile-settings"/></div></div>
      </aside>
      {mobileNav && <button className="scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      <main className="main-area">
        <header className="topbar"><button className="icon-button menu-button" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={21}/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{active}</strong></div><div className="topbar-right"><span className="status-dot"/> <span className="draft-label">Draft workspace</span><div className="avatar avatar-small">T</div></div></header>
        <div className="page-content">
          {active === 'Overview' && <>
            <section className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> YOUR TEACHING SPACE</div><h1>Good teaching starts<br className="desktop-break"/> with a little <em>lift.</em></h1><p className="lead">Plan meaningful lessons and create classroom resources, without starting from scratch.</p></div><div className="welcome-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-paper"><BookOpen size={40}/><span className="art-spark">✦</span></div><div className="art-pill pill-one">Plan with purpose</div><div className="art-pill pill-two">Teach with confidence</div></div></section>
            <section className="quick-actions"><div className="section-heading"><div><h2>What are we making today?</h2><p>Choose a starting point. You can edit everything later.</p></div><span className="soft-tag"><Lightbulb size={14}/> Teacher-first tools</span></div><div className="action-grid">
              {([{name:'Lesson plan',desc:'Build a 5E lesson flow',icon:ClipboardList,tone:'lavender'},{name:'Notes',desc:'Explain concepts clearly',icon:FileText,tone:'peach'},{name:'Quiz',desc:'Check understanding',icon:BrainCircuit,tone:'mint'},{name:'Worksheet',desc:'Practice and reinforce',icon:BookOpen,tone:'blue'},{name:'TLM',desc:'Create a visual teaching aid',icon:Lightbulb,tone:'yellow'}] as const).map((item) => <button className="action-card" key={item.name} onClick={() => {setResource(item.name);setActive('Create resource');setGenerated(false)}}><div className={`action-icon ${item.tone}`}><item.icon size={21}/></div><strong>{item.name}</strong><span>{item.desc}</span><span className="card-arrow">↗</span></button>)}
            </div></section>
            <section className="library-preview"><div className="section-heading"><div><h2>Pick up where you left off</h2><p>Your recent teaching resources, all in one place.</p></div><button className="text-button" onClick={() => setActive('My library')}>View library <span>→</span></button></div><div className="recent-list">{lessons.slice(0,3).map((lesson) => <div className="recent-row" key={lesson.id}><div className="file-icon"><FileText size={19}/></div><div className="recent-title"><strong>{lesson.title}</strong><span>{lesson.subject} · {lesson.grade} · {lesson.board}</span></div><span className="type-chip">{lesson.type}</span><span className="recent-date">{lesson.updated}</span></div>)}</div></section>
          </>}
          {active === 'Create resource' && <section className="creator-page"><div className="eyebrow"><WandSparkles size={14}/> RESOURCE STUDIO</div><h1>Make something <em>meaningful.</em></h1><p className="lead">Start with your classroom context. LessonLift will prepare an editable draft for you to review.</p><div className="creator-layout"><div className="form-panel"><div className="panel-title"><div className="step-number">1</div><div><h2>Set your context</h2><p>Tell us what you are teaching.</p></div></div><label>Resource type</label><div className="resource-tabs">{(['Lesson plan','Notes','Quiz','Worksheet','TLM'] as ResourceType[]).map((r) => <button key={r} className={resource === r ? 'selected' : ''} onClick={() => {setResource(r);setGenerated(false)}}>{r}</button>)}</div><div className="form-grid"><div className="field"><label htmlFor="board">Board / curriculum</label><select id="board" value={board} onChange={(e) => setBoard(e.target.value)}>{boards.map((b) => <option key={b}>{b}</option>)}</select></div><div className="field"><label htmlFor="grade">Class / grade</label><select id="grade" value={grade} onChange={(e) => setGrade(e.target.value)}>{Array.from({length:12},(_,i)=>`Class ${i+1}`).map((g)=><option key={g}>{g}</option>)}</select></div><div className="field"><label htmlFor="subject">Subject</label><select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)}>{subjects.map((s)=><option key={s}>{s}</option>)}</select></div><div className="field"><label htmlFor="chapter">Chapter / unit <span className="optional">Optional</span></label><input id="chapter" value={chapter} onChange={(e)=>setChapter(e.target.value)} placeholder="e.g. Computer networks"/></div></div><div className="field topic-field"><label htmlFor="topic">Topic to teach <span className="required">*</span></label><textarea id="topic" rows={3} value={topic} onChange={(e)=>setTopic(e.target.value)} placeholder="e.g. How computers communicate and share information"/><small>Be specific for a more useful draft.</small></div><div className="form-grid lower-grid"><div className="field"><label htmlFor="duration">Duration</label><select id="duration" value={duration} onChange={(e)=>setDuration(e.target.value)}>{['30 minutes','40 minutes','45 minutes','60 minutes','90 minutes'].map((d)=><option key={d}>{d}</option>)}</select></div><div className="field"><label htmlFor="pace">Learning pace</label><select id="pace" value={pace} onChange={(e)=>setPace(e.target.value)}>{['Slow-paced','Normal','Fast'].map((p)=><option key={p}>{p}</option>)}</select></div><div className="field full-field"><label htmlFor="language">Output language</label><select id="language" value={language} onChange={(e)=>setLanguage(e.target.value)}>{['English','Hindi','English + Hindi'].map((l)=><option key={l}>{l}</option>)}</select></div></div><label className="check-row"><input type="checkbox" checked={includeUDL} onChange={(e)=>setIncludeUDL(e.target.checked)}/><span><strong>Include inclusive learning options</strong><small>Offer different ways to participate, understand, and show learning.</small></span></label><button className="primary-button generate-button" onClick={generate} disabled={!topic.trim()}><Sparkles size={17}/> Generate {resource.toLowerCase()} <span>→</span></button><p className="disclaimer">Demo mode: this creates a starter draft locally. AI generation will be connected through a secure backend in a later step.</p></div><div className="preview-panel"><div className="preview-top"><div><span className="preview-label">LIVE PREVIEW</span><h3>{generated ? topic : 'Your resource will appear here'}</h3></div><span className="preview-badge">{generated ? 'Draft ready' : 'Waiting for topic'}</span></div>{generated ? <div className="generated-content"><div className="meta-line">{board} · {grade} · {subject}<br/>{duration} · {pace} · {language}</div><h4>Learning objectives</h4><ul><li>Explain the key ideas in {topic} using age-appropriate language.</li><li>Apply the concept to a short classroom task.</li><li>Share an example or question with peers.</li></ul>{resource === 'Lesson plan' ? stages.map((s)=><div className="stage-card" key={s.name}><div><strong>{s.name}</strong><span>{s.time}</span></div><p>{s.hint}</p></div>) : <><h4>{resource === 'Quiz' ? 'Quick knowledge check' : resource === 'Worksheet' ? 'Practice tasks' : resource === 'TLM' ? 'Teaching aid outline' : 'Key ideas'}</h4><ol><li>Introduce the concept with a familiar example.</li><li>Ask learners to explain the idea in their own words.</li><li>Use a short task to check understanding.</li></ol></>}{includeUDL && <div className="udl-note"><Lightbulb size={16}/><div><strong>Inclusive options</strong><p>Let learners respond orally, in writing, or with a drawing. Offer a worked example and an optional extension task.</p></div></div>}<div className="review-note">Teacher review: confirm textbook alignment and adjust examples for your class before use.</div><div className="preview-actions"><button className="primary-button" onClick={saveResource}><Plus size={16}/>{saved ? 'Saved to library' : 'Save to library'}</button><button className="secondary-button" onClick={downloadText}><Download size={16}/> Export .txt</button></div></div> : <div className="empty-preview"><div className="empty-illustration"><FileText size={35}/><Sparkles size={19}/></div><p>As you add your topic, this space will turn into a classroom-ready starting point.</p><div className="preview-skeleton"><i/><i/><i/></div></div>}</div></div></section>}
          {active === 'My library' && <section className="library-page"><div className="eyebrow"><Library size={14}/> YOUR COLLECTION</div><div className="library-title-row"><div><h1>Your teaching <em>library.</em></h1><p className="lead">Keep your working drafts easy to find.</p></div><button className="primary-button" onClick={()=>setActive('Create resource')}><Plus size={17}/> Create resource</button></div><div className="search-box"><Search size={18}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by title, subject, grade, or type"/></div><div className="library-table">{filteredLessons.length ? filteredLessons.map((lesson)=><div className="library-item" key={lesson.id}><div className="file-icon"><FileText size={20}/></div><div className="library-item-main"><strong>{lesson.title}</strong><span>{lesson.subject} · {lesson.grade} · {lesson.board}</span></div><span className="type-chip">{lesson.type}</span><span className="recent-date">{lesson.updated}</span></div>) : <div className="no-results">No matching resources. Try another search.</div>}</div><p className="library-footnote">This MVP stores new resources in the current browser session only. Persistent accounts and cloud library storage are not connected yet.</p></section>}
        </div>
      </main>
    </div>
  )
}

export default App
