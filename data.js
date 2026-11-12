// Content for the AOTY 2026 judges prototype.
// Copy comes from the v2 Figma designs (Nike ACG and G42 case pages, showreel captions).
// Anything in [brackets] is a placeholder until interviews and final copy land.

window.AOTY = (() => {
  const cases = [
    { id: 'google-health', n: '01', name: 'Google Health', line: 'Case headline goes here', ready: false },
    { id: 'fox-1', n: '02', name: 'Fox 1', line: 'Case headline goes here', ready: false },
    { id: 'moncler', n: '03', name: 'Moncler', line: 'Agentic commerce', ready: false },
    {
      id: 'nike-acg', n: '04', name: 'Nike ACG', line: 'All Conditions World', ready: true,
      challenge: 'ACG had lost credibility with the very communities who define the outdoors. The aesthetic traveled, but belief in ACG as real performance gear had weakened. The relaunch, timed to the Milan Winter Olympics, had to win back the core and reach a new generation of hikers and runners who were tired of stats, metrics and clean digital polish.',
      solution: [
        'We built All Conditions World, an immersive WebGL globe that works as an interactive trail map and a cultural storytelling platform. It surfaces wild routes hand-sourced by ACG athletes and trail communities, each linked to a real trail on Strava, and it’s designed to do something unusual for a website: get people to close it and go outside.',
        'The brand’s rough, playful, nineties spirit is built into the system itself. A live Wild Score reads weather, terrain and season to rate every trail, every day, so ACG responds to real conditions rather than describing them.',
        'Routes come straight from athletes and grassroots communities, with personal stories, voice notes and visuals. The beginner and the seasoned trail runner each find their own way in, and the Wild 300 challenge turns that into real-world participation across countries.',
        'Spatial audio reacts to how you move. Conditions change daily. Easter eggs, a fishing yeti and a live view from the ACG Express reward the curious, so the world is never quite the same twice.',
        'Digital innovation that points away from the screen. The platform connects live data, community content and Strava into one system built to drive real movement, not screen time.'
      ],
      results: 'Nearly 500,000 people ran the routes and took on the Wild 300, driving 45 million impressions. Digital experiences don’t have to compete with the real world. They can send people into it.',
      reelAt: 12
    },
    {
      id: 'g42', n: '05', name: 'G42 (tbc)', line: 'Case headline goes here', ready: true,
      challenge: 'G42 came to us with a provocation: “Websites are dead. Agencies are irrelevant. Prove us wrong.” For an AI infrastructure leader, a static website wasn’t just dated, it was a contradiction.',
      solution: [
        'We agreed, then built what comes after the website. G42.ai is a generative interface, a brand you converse with rather than browse, powered by integrated language models.',
        'The intelligence isn’t a feature, it’s the foundation. Source material like PDFs, videos and press releases is ingested and synthesised into living knowledge, and the brand speaks from it within clear guardrails, to people and to other AI agents.',
        'An investor gets an executive briefing. A researcher gets a technical deep dive. A government partner gets the story framed around their policy context. Each one is generated in seconds, for one person.',
        'There’s no menu to learn. Voice and text lead, the system reads intent, and no two visits are the same.'
      ],
      results: 'A live, working proof that the shift is buildable today.',
      reelAt: 90
    }
  ];

  // Showreel, 2:26. Chapter times are illustrative until the edit is locked.
  const reel = {
    duration: 146,
    chapters: [
      { t: 0, project: null, text: 'A year of work that sent people outside, spoke back, and changed how brands behave.' },
      { t: 12, project: 'Nike ACG', text: 'For Nike ACG, we built a digital world designed to get people off their screens.' },
      { t: 30, project: 'Nike ACG', text: 'A hand-built 3D globe of the wildest trails in Europe, sourced by ACG athletes and trail communities.' },
      { t: 48, project: 'Nike ACG', text: 'Every route is real, linked to Strava, and tied to a global challenge: 300 minutes outdoors.' },
      { t: 68, project: 'Nike ACG', text: 'Nearly 500,000 participants took on the routes, generating 45M impressions.' },
      { t: 90, project: 'G42', text: 'For G42, we answered the brief “websites are dead, agencies are irrelevant, prove us wrong” by not building a website.' },
      { t: 110, project: 'G42', text: 'G42.ai is a generative interface. It writes a different answer for every visitor, in real time.' },
      { t: 128, project: 'G42', text: 'An investor gets a briefing. A researcher gets the deep dive.' }
    ]
  };

  // Knowledge base. Every answer is built from these entries only.
  const kb = [
    { id: 'n-challenge', project: 'Nike ACG', title: 'The Challenge', src: 'Nike ACG · Case study · The Challenge', reel: 12,
      tags: ['challenge', 'brief', 'problem', 'credibility', 'olympics', 'hikers', 'runners', 'why', 'start'],
      text: cases[3].challenge, detail: 'Relaunch timed to the Milan Winter Olympics.' },
    { id: 'n-solution', project: 'Nike ACG', title: 'The Solution', src: 'Nike ACG · Case study · The Solution', reel: 30,
      tags: ['solution', 'globe', 'webgl', 'trail map', 'built', 'build', 'what did you make', 'all conditions world', 'approach'],
      text: cases[3].solution[0], detail: 'Every route is linked to a real trail on Strava.' },
    { id: 'n-wild', project: 'Nike ACG', title: 'Wild Score', src: 'Nike ACG · Case study · The Solution', reel: 48,
      tags: ['wild score', 'weather', 'terrain', 'season', 'conditions', 'intelligent', 'intelligence', 'adapt', 'live', 'data', 'ai', 'respond'],
      text: cases[3].solution[1], detail: 'The Wild Score rates every trail, every day.' },
    { id: 'n-people', project: 'Nike ACG', title: 'Personalised routes', src: 'Nike ACG · Case study · The Solution', reel: 48,
      tags: ['personalised', 'personalized', 'personalisation', 'beginner', 'seasoned', 'routes', 'community', 'athletes', 'wild 300', 'participation', 'stories'],
      text: cases[3].solution[2], detail: 'The Wild 300 challenge runs across countries.' },
    { id: 'n-feel', project: 'Nike ACG', title: 'Less like a website', src: 'Nike ACG · Case study · The Solution', reel: 30,
      tags: ['website', 'feel', 'less like a website', 'audio', 'spatial', 'easter', 'yeti', 'express', 'different', 'delight', 'screen', 'outside', 'go outside'],
      text: cases[3].solution[3] + ' ' + cases[3].solution[4], detail: 'Built to drive real movement, not screen time.' },
    { id: 'n-results', project: 'Nike ACG', title: 'The Results', src: 'Nike ACG · Case study · The Results', reel: 68,
      tags: ['results', 'result', 'impressions', '500,000', 'participants', 'numbers', 'outcome', 'impact', 'success', 'worked', 'performance'],
      text: cases[3].results, detail: 'Nearly 500,000 people. 45 million impressions.' },
    { id: 'g-challenge', project: 'G42', title: 'The Challenge', src: 'G42 · Case study · The Challenge', reel: 90,
      tags: ['challenge', 'brief', 'problem', 'provocation', 'websites are dead', 'why', 'start'],
      text: cases[4].challenge, detail: 'The brief: prove that websites are dead and agencies are irrelevant wrong.' },
    { id: 'g-solution', project: 'G42', title: 'The Solution', src: 'G42 · Case study · The Solution', reel: 110,
      tags: ['solution', 'generative', 'interface', 'converse', 'language models', 'built', 'build', 'approach', 'what did you make', 'g42.ai'],
      text: cases[4].solution[0], detail: 'G42.ai is a brand you converse with rather than browse.' },
    { id: 'g-intel', project: 'G42', title: 'Where the intelligence sits', src: 'G42 · Case study · The Solution', reel: 110,
      tags: ['intelligent', 'intelligence', 'ai', 'guardrails', 'knowledge', 'ingest', 'agents', 'synthesised', 'foundation', 'pdfs'],
      text: cases[4].solution[1], detail: 'The brand speaks to people and to other AI agents.' },
    { id: 'g-personal', project: 'G42', title: 'One person at a time', src: 'G42 · Case study · The Solution', reel: 128,
      tags: ['personalised', 'personalized', 'personalisation', 'investor', 'researcher', 'government', 'briefing', 'deep dive', 'adapts', 'adapt', 'audience'],
      text: cases[4].solution[2], detail: 'Each answer is generated in seconds, for one person.' },
    { id: 'g-ui', project: 'G42', title: 'No menu', src: 'G42 · Case study · The Solution', reel: 128,
      tags: ['menu', 'voice', 'text', 'intent', 'navigation', 'visit', 'interface', 'experience', 'feel'],
      text: cases[4].solution[3], detail: 'No two visits are the same.' },
    { id: 'g-results', project: 'G42', title: 'The Results', src: 'G42 · Case study · The Results', reel: 110,
      tags: ['results', 'result', 'outcome', 'impact', 'success', 'worked', 'proof', 'numbers'],
      text: cases[4].results, detail: 'A live, working proof.' },
    { id: 'x-projects', project: null, title: 'The five projects', src: 'Welcome page · The work', reel: null,
      tags: ['five projects', 'what projects', 'which projects', 'list the projects', 'tell me about the projects', 'overview', 'where should i start', 'where do i start', 'where to start'],
      text: 'The five projects are Google Health, Fox 1, Moncler (agentic commerce), Nike ACG (All Conditions World) and G42. Case material is loaded for Nike ACG and G42 so far.', detail: 'Nike ACG and G42 are fully loaded.' }
  ];

  const projects = [
    { key: 'nike', label: 'Nike ACG', match: ['nike', 'acg', 'all conditions'] },
    { key: 'g42', label: 'G42', match: ['g42'] },
    { key: 'moncler', label: 'Moncler', match: ['moncler'], noKb: true },
    { key: 'google', label: 'Google Health', match: ['google health', 'google'], noKb: true },
    { key: 'fox', label: 'Fox 1', match: ['fox'], noKb: true }
  ];

  const offTopic = /(who (should|will|would) win|which agency|best agency|better than|revenue|salary|stock|share price|weather today|joke|poem|politic|election|crypto|recipe|your opinion|do you like)/i;
  const scopeWords = /(project|work|case|team|reel|video|r\/ga|rga|result|challenge|solution|brief|intelligen|design|build|built|brand|ai|judge|moment|interview|website|interface)/i;

  function norm(s) { return s.toLowerCase().replace(/[’']/g, "'"); }

  function mentionedProject(q, context) {
    const s = norm(q);
    for (const p of projects) if (p.match.some((m) => s.includes(m))) return p;
    if (context) return projects.find((p) => p.label === context) || null;
    return null;
  }

  function score(entry, q, proj) {
    const s = norm(q);
    let sc = 0;
    for (const t of entry.tags) if (s.includes(t)) sc += t.includes(' ') ? 3 : 2;
    const words = s.split(/[^a-z0-9']+/).filter((w) => w.length > 3);
    const body = norm(entry.text);
    for (const w of words) if (body.includes(w)) sc += 0.4;
    if (s.includes(norm(entry.title))) sc += 2;
    if (proj && entry.project === proj.label) sc += 1.5;
    if (proj && entry.project && entry.project !== proj.label) sc -= 4;
    return sc;
  }

  function first(text, max = 210) {
    const parts = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
    let out = parts[0].trim();
    if (parts[1] && (out + ' ' + parts[1].trim()).length <= max) out += ' ' + parts[1].trim();
    return out;
  }

  function followups(entry, proj) {
    const p = proj ? proj.label : (entry && entry.project) || null;
    const t = entry ? entry.title : '';
    const l = [];
    if (!p) return ['Tell me about Nike ACG', 'Tell me about G42'];
    if (t !== 'The Challenge') l.push(`What was the challenge on ${p}?`);
    if (t !== 'The Solution') l.push(`What was the solution on ${p}?`);
    if (t !== 'The Results') l.push(`What were the results for ${p}?`);
    if (t !== 'Where the intelligence sits' && t !== 'Wild Score') l.push(`Where is the system intelligent on ${p}?`);
    return l.slice(0, 2);
  }

  function nearest(q) {
    const s = norm(q);
    const ranked = reel.chapters.filter((c) => c.t > 0).map((c) => ({
      c, sc: norm(c.text).split(/[^a-z0-9]+/).filter((w) => w.length > 3 && s.includes(w)).length
    })).sort((a, b) => b.sc - a.sc || a.c.t - b.c.t);
    return ranked.slice(0, 3).map((r) => r.c).sort((a, b) => a.t - b.t);
  }

  // Returns { kind, text, sources, followups, reel, extras }
  function ask(q, context) {
    const clean = q.trim();
    if (!clean) return null;
    const proj = mentionedProject(clean, context);
    const explicit = projects.find((p) => p.match.some((m) => norm(clean).includes(m)));
    if (offTopic.test(clean)) return { kind: 'out', text: 'That’s outside what I can help with. I can talk about the five projects and R/GA’s work on them.', followups: ['Show me the five projects', 'Where should I start?'] };
    if (explicit && explicit.noKb) {
      return { kind: 'gap', text: `I don’t have case material for ${explicit.label} in the knowledge base yet, so I won’t guess. I can tell you about Nike ACG and G42.`, followups: ['Tell me about Nike ACG', 'Tell me about G42'], nearest: nearest(clean) };
    }
    const ranked = kb.map((e) => ({ e, sc: score(e, clean, proj) })).sort((a, b) => b.sc - a.sc);
    const top = ranked[0];
    if (!top || top.sc < 2) {
      if (!explicit && !scopeWords.test(clean)) return { kind: 'out', text: 'That’s outside what I can help with. I can talk about the five projects and R/GA’s work on them.', followups: ['Show me the five projects', 'Where should I start?'] };
      const named = explicit ? ` for ${explicit.label}` : '';
      return { kind: 'gap', text: `I don’t have that in the material our teams approved${named}, so I won’t guess. It isn’t part of this knowledge base.`, followups: followups(null, proj), nearest: nearest(clean) };
    }
    const picked = [top.e];
    const second = ranked.find((r) => r.e.project && r.e.project !== top.e.project && r.sc >= Math.max(2, top.sc * 0.6));
    if (!proj && second && top.e.project) picked.push(second.e);
    const text = picked.length > 1 ? picked.map((e) => `${e.project}: ${first(e.text, 320)}`).join('\n\n') : top.e.text;
    const short = picked.length > 1 ? picked.map((e) => `${e.project}: ${first(e.text, 120)}`).join(' ') : first(top.e.text);
    const entry = top.e;
    return {
      kind: 'ok', text, short,
      sources: [...picked.map((e) => e.src), entry.project ? `${entry.project} · Team interview · [Name], [Role] (pending)` : null].filter(Boolean),
      followups: followups(entry, proj),
      reel: entry.reel,
      project: entry.project,
      extras: {
        note: '[Team side note from the project interview. Pending transcript review.]',
        quote: '“[Short pull quote from the team interview.]”',
        detail: entry.detail,
        who: '[Name], [Role]'
      }
    };
  }

  const suggestions = ['What was the challenge on Nike ACG?', 'How is the G42 experience intelligent?', 'Show me results across all projects', 'How did you make ACG feel less like a website?'];

  return { cases, reel, kb, ask, suggestions, nearest };
})();
