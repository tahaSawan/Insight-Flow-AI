/** Shared rules so AI output stays simple and clear. */

export const PLAIN_LANGUAGE_AI_RULES = `

LANGUAGE (required):

- Write for anyone, not experts. Short sentences. Everyday words.

- Never use jargon like "orchestrator", "exposure", "intrapreneurial", "productization", "key-person dependency".

- Say "main problem" instead of "risk exposure". Say "how serious" instead of "risk score context".

- impactMetricLabel: max 4 simple words (e.g. "Sales drop", "Late deliveries", "Unhappy customers").

- Each finding, problem, and next step must be one clear idea in plain English.



CONTENT (required):

- Base everything on the actual document only.

- If the text is a resume/CV: say clearly "This is a resume." Summarize skills and strengths. Do NOT pretend the reader is a company hiring this person unless you label it "Example scenario".

- If the text is a business report: focus on business problems and fixes (sales, customers, money, deadlines).

`;



export const UI = {

  home: {

    badge: '5 AI helpers · read → plan → act',

    subtitle:

      'Paste a business report. Get a simple summary, what could go wrong, and what to do next — in seconds.',

    riskLabel: 'How serious?',

    sureLabel: 'How sure?',

    actionsLabel: 'Demo steps',

    actionsSubDone: 'Pretend actions',

    actionsSubReady: 'Shows after run',

    featureAgents: '5 AI helpers',

    featureAgentsDesc: 'Read → Main points → Problems → Next steps → Results',

    featureDemo: 'Try-it demo',

    featureDemoDesc: 'Fake actions + before/after — nothing real is sent',

    recentTitle: 'Past reports',

    seeAll: 'See all',

    historyRisk: (score: number) => `Seriousness ${score}`,

    ctaTitleReady: 'Ready to start',

    ctaTitleAgain: 'Run another report',

    ctaSubReady: 'Paste text, upload a PDF, or try our sample business report.',

    ctaSubAgain: 'Add new text or open your last report.',

    startBtn: 'Add document',

    viewLastBtn: 'Open last report',

  },

  upload: {

    title: 'Add your document',

    subtitle: 'Paste text or pick a .txt or .pdf file. Works best with business reports.',

    industryLabel: 'What kind of business?',

    fileTitle: 'Pick a .txt or .pdf file',

    fileLoaded: (name: string) => `Loaded: ${name}`,

    fileTap: 'Tap to choose a file',

    pasteDivider: 'or paste here',

    sampleBtn: 'Try sample report',

    placeholder: 'Paste a sales report, team update, or business memo...',

    submit: 'Analyze with AI',

    resumeWarning:

      'This looks like a resume. The app works best with business reports. For your demo, tap "Try sample report".',

  },

  analysis: {

    titleFull: 'AI is reading your report',

    titleFast: 'Quick AI read',

    done: 'Done! Check the preview below.',

    runningFull: 'Five helpers are reading your text, one after another...',

    runningFast: 'One quick pass — same report, faster.',

    progress: 'Progress',

    agentsDone: (done: number, total: number) => `${done} of ${total} helpers finished`,

    fastProgress: 'Working on your report...',

    fastEngine: 'Quick mode',

    fastEngineDesc: 'All steps in one AI call',

    previewTitleFull: 'Preview',

    previewTitleFast: 'Preview (quick mode)',

    viewReport: 'See full report',

    queued: 'Waiting to start...',

    fastRunning: 'Reading everything in one go...',

  },

  results: {

    title: 'Your AI report',

    subtitle: 'Here is what we found — and what you could do next.',

    emptyTitle: 'No report yet',

    emptySubtitle: 'Add a document on the Upload tab first.',

    traceTitle: 'How the AI worked (step by step)',

    traceHint: 'Five helpers read your text one after another.',

    scorecardTitle: 'AI Decision Scorecard',

    scorecardHint: 'How sure, how urgent, and how hard this plan is — all in one view.',

    scorecardBadge: 'FROM YOUR REPORT',

    scoreConfidence: 'Confidence',

    scoreConfidenceHint: 'How sure the AI is that the top action is the right move.',

    scoreUrgency: 'Urgency',

    scoreUrgencyHint: 'How fast you should act before things get worse.',

    scoreFinancial: 'Financial Impact',

    scoreFinancialHint: 'Money, revenue, or customers that could be lost or saved.',

    scoreOperational: 'Operational Risk',

    scoreOperationalHint: 'How much day-to-day work could break down if you wait.',

    scoreExecution: 'Execution Complexity',

    scoreExecutionHint: 'How many teams, tools, and steps it takes to follow the plan.',

    summaryTitle: 'Quick summary',

    summaryHint: 'The main message in a few easy sentences.',

    problemSeriousness: 'How serious is the problem?',

    problemSeriousnessHint: '0 = small issue · 100 = very serious',

    howSure: 'How sure is the AI?',

    howSureHint: 'Higher = the AI is more confident in this report',

    priority: 'Urgency',

    whatCouldHappen: 'What could happen if nothing is done',

    findingsTitle: 'Main points we noticed',

    findingsHint: 'Simple, direct points from your document.',

    problemsTitle: 'What could go wrong',

    problemsHint: 'Possible bad outcomes if you ignore this.',

    actionsTitle: 'What you should do next',

    actionsHint: 'Clear steps anyone can follow.',

    simulatedTitle: 'Actions we pretended to run',

    simulatedHint: 'Demo only — nothing was really sent or changed.',

    simulatedDone: 'DEMO',

    impactTitle: 'Before vs after (if you follow the steps)',

    impactHint: 'A simple guess of how things might improve.',

    before: 'Before',

    after: 'After',

    projected: 'After fixes',

    logsTitle: 'Activity log (demo)',

    logsHint: 'Fake timeline — not real emails or systems.',

    ceoBriefTitle: 'Short talk for your presentation',

    ceoBriefHint: '4 simple bullets you can say out loud.',

    ceoBriefBtn: 'Make 4 talking points',

    ceoBriefBtnAgain: 'Make new talking points',

    ceoBriefLoading: 'Working...',

    share: 'Share report',

    copy: 'Copy report',

    newAnalysis: 'New report',

    backHome: 'Back to home',

    resumeBanner:

      'Heads up: this looks like a resume. Numbers and “before/after” are just a demo. For judges, use “Try sample report” on Upload.',

  },

  modePicker: {

    label: 'How should the AI work?',

  },

} as const;



/** Guess if pasted/uploaded text is a resume (for friendly UI hints). */

export function looksLikeResume(text: string): boolean {

  const t = text.toLowerCase();

  let score = 0;

  if (/\b(resume|curriculum vitae|cv)\b/.test(t)) score += 2;

  if (/work experience|professional experience|employment history/.test(t)) score += 1;

  if (/education|university|bachelor|master|degree/.test(t)) score += 1;

  if (/skills|technical skills|core competencies/.test(t)) score += 1;

  if (/references available|linkedin\.com|github\.com/.test(t)) score += 1;

  return score >= 2;

}


