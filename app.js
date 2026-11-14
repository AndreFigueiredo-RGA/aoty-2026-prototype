/* AOTY 2026 judges prototype: Bronze, Silver, Gold in one site with an overarching switcher. */
(() => {
  const D = window.AOTY;
  const app = document.getElementById('app');
  const VARIANTS = ['bronze', 'silver', 'gold'];
  const session = { signedIn: sessionStorage.getItem('aoty-in') === '1', name: 'Nick C.' };
  let cleanup = [];

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2600); }

  /* ---------- Routing: #/<variant>/<page>[/<id>] ---------- */
  function route() {
    const [path, qs = ''] = location.hash.split('?');
    const [, v, p, id] = path.split('/'); const q = new URLSearchParams(qs);
    return { v: VARIANTS.includes(v) ? v : 'bronze', p: p || (session.signedIn ? 'welcome' : 'login'), id, ai: q.get('ai'), q: q.get('q'), s: q.get('s') };
  }
  // Every state is a URL: the assistant (?ai=take|page&q=...) and the landing stage (?s=work) are history entries,
  // so the browser's back button, and every in-page "back" (close, Esc), step through them with history.back().
  function hashWith(ch) {
    const [path, qs = ''] = location.hash.split('?'); const q = new URLSearchParams(qs);
    Object.entries(ch).forEach(([k, v]) => (v == null ? q.delete(k) : q.set(k, v)));
    const s = q.toString(); return path + (s ? '?' + s : '');
  }
  function go(v, p, id) { location.hash = `/${v}/${p}${id ? '/' + id : ''}`; }

  function render() {
    const r = route();
    const key = `${r.v}/${r.p}/${r.id || ''}`;
    // Same page, only a state changed (assistant open/closed, stage): update the state, don't rebuild the page.
    if (r.v === 'gold' && render.key === key && window.__gen) { window.__gen.sync(r.ai, r.q); if (window.__deck) window.__deck.sync(r.s); return; }
    render.key = key;
    cleanup.forEach((f) => f()); cleanup = [];
    document.body.classList.remove('on-work');
    if (!session.signedIn && r.p !== 'login') { go(r.v, 'login'); return; }
    document.body.dataset.variant = r.v;
    document.body.classList.toggle('has-bar', r.v === 'silver' && r.p !== 'login');
    $$('#switcher [data-v]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.v === r.v)));
    window.scrollTo(0, 0);
    if (r.p === 'login') app.innerHTML = loginHTML(r);
    else if (r.p === 'case') app.innerHTML = caseHTML(r);
    else app.innerHTML = welcomeHTML(r);
    app.classList.remove('page-in'); void app.offsetWidth; app.classList.add('page-in');
    { const n = $('.site-nav'); document.documentElement.style.setProperty('--navh', (n ? n.offsetHeight : 0) + 'px'); }
    wire(r);
    initMotion();
    // First arrival at the prototype this session: introduce the three options.
    if (r.p === 'welcome' && !sessionStorage.getItem('aoty-intro')) openIntro();
  }

  /* ---------- Templates ---------- */
  // Geometry of the three rectangles, taken from Figma "Motion Step 0 to 4" (1440 x 742 artboard).
  // Each box is traced from one start corner in two directions (A and B). l1 is how far each
  // direction has travelled at Step 1. 'r' edges are red, 'g' edges are grey.
  const G = {
    W: 1440, H: 742,
    boxes: [
      { k: 'b', A: [[56, 119, 488, 119, 'r'], [488, 119, 488, 553, 'r']], B: [[56, 119, 56, 553, 'g'], [56, 553, 488, 553, 'r']], l1: [224, 226] },
      { k: 'e', A: [[1101, 663, 392, 663, 'g'], [392, 663, 392, 299, 'r']], B: [[1101, 663, 1101, 299, 'r'], [1101, 299, 392, 299, 'g']], l1: [472, 242] },
      { k: 's', A: [[1376, 80, 862, 80, 'r'], [862, 80, 862, 420, 'r']], B: [[1376, 80, 1376, 420, 'r'], [1376, 420, 862, 420, 'g']], l1: [309, 204] }
    ],
    // when: 'start' (visible from Step 1), 'A1' / 'B1' (visible once that edge is drawn)
    handles: [
      { id: 'b-tl', box: 'b', x: 56, y: 119, when: 'start' }, { id: 'b-tr', box: 'b', x: 488, y: 119, when: 'A1' }, { id: 'b-bl', box: 'b', x: 56, y: 553, when: 'B1' },
      { id: 'e-br', box: 'e', x: 1101, y: 663, when: 'start' }, { id: 'e-bl', box: 'e', x: 392, y: 663, when: 'A1' },
      { id: 's-tr', box: 's', x: 1376, y: 80, when: 'start' }, { id: 's-tl', box: 's', x: 862, y: 80, when: 'A1' }, { id: 's-br', box: 's', x: 1376, y: 420, when: 'B1' }
    ],
    tints: [[392, 299, 96, 254], [862, 299, 239, 121]],
    labels: [{ x: 86, y: 149, a: 'BRANDS', b: 'Intelligent by design' }, { x: 892, y: 110, a: 'STORIES', b: 'Personalised at scale' }, { x: 422, y: 584, a: 'EXPERIENCES', b: 'Adaptive by nature' }]
  };
  const nav = (r) => `<nav class="site-nav"><a class="logo" href="#/${r.v}/welcome${r.v === 'gold' && r.p !== 'welcome' ? '?s=work' : ''}" aria-label="R/GA home"><img src="assets/rga-logo.svg" alt="R/GA" height="18"></a>
    <div class="nav-r"><span>Agency of the Year 2026</span><button data-act="logout">Log out</button></div></nav>`;
  const SIGNATURE = '<img class="signature" src="assets/rga-signature.png" alt="R/GA 1977–TMRW. We design intelligent brand systems that help businesses get ahead." width="1360" height="341">';
  const footer = () => `<footer class="foot rv">${SIGNATURE}</footer>`;

  function loginHTML(r) {
    return `<main class="login">
      <section class="login-art"><div class="cube-scene" id="cubeScene" aria-label="Interactive 3D cube. Drag to rotate."><div class="cube"><i class="cf f-front"></i><i class="cf f-back"></i><i class="cf f-right"></i><i class="cf f-left"></i><i class="cf f-top"></i><i class="cf f-bottom"></i></div></div><span class="brandline">R/GA • CAMPAIGN UK</span><h2>Agency of the Year 2026</h2></section>
      <form class="login-form" id="loginForm" autocomplete="off">
        <h1>Hello ${esc(session.name)}</h1><p>Enter the details from your invitation.</p>
        <label class="field">Email<input type="email" placeholder="name@organisation.com" aria-label="Email"></label>
        <label class="field">Access code<input type="password" placeholder="••••••" aria-label="Access code"></label>
        <button class="btn" type="submit">Enter</button>
        <p class="login-note">Prototype: any details work. The version switcher stays at the top.</p>
      </form></main>`;
  }

  function welcomeHTML(r) {
    if (r.v === 'gold') return goldWelcomeHTML(r);
    const gold = false;
    const cards = D.cases.map((c, i) => `<button class="card rv ${c.ready ? '' : 'pending'}" style="--d:${0.15 + i * 0.09}s" data-case="${c.id}">
      <div class="thumb">Case image</div><small>${c.n}</small><b>${esc(c.name)}</b><span>${esc(c.line)}</span></button>`).join('');
    const pct = (v, t) => `${(v / t) * 100}%`;
    const handles = G.handles.map((h) => `<i class="mg-h" data-h="${h.id}" style="left:${pct(h.x, G.W)};top:${pct(h.y, G.H)}"></i>`).join('');
    const tints = G.tints.map((t) => `<div class="mg-tint" style="left:${pct(t[0], G.W)};top:${pct(t[1], G.H)};width:${pct(t[2], G.W)};height:${pct(t[3], G.H)}"></div>`).join('');
    const labels = G.labels.map((l) => `<div class="mg-l" style="left:${pct(l.x, G.W)};top:${pct(l.y, G.H)}">${l.a}<br>${l.b}</div>`).join('');
    // One content container at a time: each stage below fills the viewport and the scroll hands over to the next.
    return `${nav(r)}
    <div class="deck" id="deck">
      <div class="deck-view" id="deckView">
        <section class="stg stg-welcome" data-stg="welcome" aria-label="Welcome">
          <div class="intro"><div class="who rv">WELCOME ${esc(session.name.toUpperCase())}</div>
            <div class="intro-r"><p class="rv" style="--d:.15s">We’re glad you’re here. Explore the work in whatever order feels right.${r.v === 'bronze' ? '' : ' If you’d like company, the assistant is close by.'}</p>
            <h1 data-split>We design intelligent brand systems to help business get ahead.</h1></div></div>
        </section>
        <section class="stg stg-rects" data-stg="rects" aria-label="Brands, stories, experiences">
          <div class="mgraph" id="graph"><svg class="mg-svg" viewBox="0 0 ${G.W} ${G.H}" aria-hidden="true"></svg>${tints}${handles}${labels}</div>
        </section>
        ${`<section class="stg stg-video" data-stg="video" aria-label="The work">
          <div class="work-head"><h2 data-split>The work</h2><p class="work-note rv">*All client results and data is\nconfidential and for judges eyes only.</p></div>
          ${reelHTML(r.v)}
        </section>
        <section class="stg stg-cases" data-stg="cases" aria-label="Case studies">
          <div class="work-head"><h2 data-split>Case studies</h2><p class="work-note rv">Choose a project to read the full case.</p></div>
          <div class="cards">${cards}</div>
        </section>`}
        <section class="stg stg-close" data-stg="close" aria-label="Closing">
          <div class="foot-big rv">${SIGNATURE}</div>
        </section>
      </div>
      <ol class="dots" aria-label="Sections">${(gold ? ['Welcome', 'Brands, stories, experiences', 'The work', 'Close'] : ['Welcome', 'Brands, stories, experiences', 'The work', 'Case studies', 'Close']).map((n, i) => `<li><button data-stage="${i}" aria-label="${n}"></button></li>`).join('')}</ol>
    </div>
    ${r.v === 'silver' ? silverBarHTML(true) : ''}`;
  }

  /* ---------- Gold (Figma "Gold" 2124:3065): welcome, then a grid of the work. Assistant entry sits in the page ---------- */
  // The same icon + copy, in the same place (48px under the nav, aligned with the logo), on every page and state.
  const AID = '<span class="sp">✦</span><b>An entry that adapts to you.</b><small>I can help you deep dive or see the work in another way. Just say the word.</small>';
  // Tiles play their video on roll-over (muted). Only Nike ACG and G42 open a case study.
  const TILES = [
    { id: 'ceo', img: 'ceo.png', label: 'A message from R/GA' },
    { id: 'fox-1', img: 'fox-1.png', video: true, label: 'FOX ONE' },
    { id: 'g42', img: 'g42.png', video: true, link: 'case', label: 'G42' },
    { id: 'nike-acg', img: 'nike-acg.png', video: true, link: 'case', label: 'Nike ACG' },
    { blank: true },
    { id: 'moncler', img: 'moncler.png', video: true, label: 'Moncler' },
    { id: 'google-health', img: 'google-health.png', video: true, label: 'Google Health' },
    { id: 'ibs', text: 'We design intelligent brand systems to help business get ahead.', chip: 'what does that mean?', label: 'Intelligent brand systems' }
  ];
  function goldWelcomeHTML(r) {
    const tiles = TILES.map((t, i) => {
      const d = `style="--d:${0.1 + i * 0.07}s"`;
      if (t.blank) return `<div class="tile tile-blue rv" ${d} aria-hidden="true"></div>`;
      const media = t.img ? `<img src="assets/tiles/${t.img}" alt="">${t.video ? `<video class="tv" muted loop playsinline preload="none" aria-hidden="true"></video>` : ''}` : `<p>${esc(t.text)}</p>`;
      const inner = `${media}${t.chip ? `<span class="tchip">${esc(t.chip)}</span>` : ''}`;
      const vs = t.video ? ` data-vsrc="assets/video/${t.id}.mp4"` : '';
      return t.link === 'case'
        ? `<button class="tile rv link" ${d} data-case="${t.id}"${vs} aria-label="${esc(t.label)}">${inner}</button>`
        : `<div class="tile rv ${t.img ? '' : 'tile-red'}" ${d}${vs} role="img" aria-label="${esc(t.label)}">${inner}</div>`;
    }).join('');
    return `${nav(r)}
    <div class="deck" id="deck">
      <div class="deck-view" id="deckView">
        <section class="stg stg-welcome stg-gwelcome" data-stg="welcome" aria-label="Welcome">
          <div class="gw-who rv">WELCOME ${esc(session.name.toUpperCase())}</div>
          <div class="gw-copy rv" style="--d:.15s"><p>We’re glad you’re here. Explore the work in whatever order feels right.</p><p>If you’d like company, the assistant is close by.</p></div>
        </section>
        <section class="stg stg-work" data-stg="work" aria-label="The work">
          <button class="gw-ask aid rv" data-gen-open>${AID}</button>
          <div class="tg">${tiles}</div>
        </section>
      </div>
      <ol class="dots" aria-label="Sections">${['Welcome', 'The work'].map((n, i) => `<li><button data-stage="${i}" aria-label="${n}"></button></li>`).join('')}</ol>
    </div>`;
  }
  function mountTiles() {
    $$('.tile[data-vsrc]').forEach((t) => {
      const v = $('video', t); if (!v) return;
      t.addEventListener('mouseenter', () => {
        if (!v.getAttribute('src')) { v.src = t.dataset.vsrc; v.load(); }
        const p = v.play(); if (p && p.then) p.then(() => t.classList.add('vplay')).catch(() => {});
      });
      t.addEventListener('mouseleave', () => { v.pause(); t.classList.remove('vplay'); try { v.currentTime = 0; } catch (e) { /* not loaded yet */ } });
    });
  }

  // Suggested questions in the case-page rail. Each is anchored to the component it relates to and appears as you scroll to it.
  const CASE_CHIPS = {
    'nike-acg': [{ q: 'How does the Wild Score work?', at: 'a-solution' }, { q: 'Did it get people outside?', at: 'a-v6' }, { q: 'How did you reach 1.3M visitors?', at: 'a-results' }],
    g42: [{ q: 'What’s generated live vs pre-written?', at: 'a-solution' }, { q: 'What happens when the AI gets it wrong?', at: 'a-v5' }, { q: 'What’s changed for G42 since launch?', at: 'a-results' }]
  };
  const railHTML = (chips) => `<aside class="grail"><button class="grail-ask aid" data-gen-open>${AID}</button>
    <div class="grail-chips">${chips.map((c) => `<button class="gchip" data-chip-gen="${esc(c.q)}" data-at="${c.at}">${esc(c.q)}</button>`).join('')}</div></aside>`;
  function mountRailChips() {
    const chips = $$('.gchip[data-at]'); if (!chips.length) return;
    const upd = () => chips.forEach((c) => { const el = document.getElementById(c.dataset.at); c.classList.toggle('on', !el || el.getBoundingClientRect().top < window.innerHeight * 0.72); });
    window.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
    cleanup.push(() => { window.removeEventListener('scroll', upd); window.removeEventListener('resize', upd); });
  }

  function goldCaseHTML(r) {
    const c = D.cases.find((x) => x.id === r.id) || D.cases[3];
    const vid = (n) => `<div class="g-ph g-vid" id="a-v${n}"><span>[VIDEO ${n}]</span></div>`;
    const body = `
      <section class="g-row rv" id="a-challenge"><h3>The Challenge</h3><p>${esc(c.challenge)}</p></section>
      ${vid(1)}${vid(2)}${vid(3)}
      <section class="g-row rv" id="a-solution"><h3>The Solution</h3><div>${c.solution.map((p) => `<p>${esc(p)}</p>`).join('')}</div></section>
      ${vid(4)}${vid(5)}${vid(6)}
      <section class="g-row rv" id="a-results"><h3>The Results</h3><p>${esc(c.results)}</p></section>`;
    return `${nav(r)}<div class="gcase">${railHTML(CASE_CHIPS[c.id] || [])}
      <main class="gmain"><section class="g-hero"><h1 data-split>${esc(c.name.replace(' (tbc)', '').toUpperCase())}</h1></section>${body}${footer()}</main></div>`;
  }

  function caseHTML(r) {
    if (r.v === 'gold') return goldCaseHTML(r);
    const c = D.cases.find((x) => x.id === r.id) || D.cases[3];
    const i = D.cases.indexOf(c); const prev = D.cases[(i + 4) % 5]; const next = D.cases[(i + 1) % 5];
    const body = c.ready ? `
      <section class="row rv"><h3>The Challenge</h3><div><p>${esc(c.challenge)}</p></div></section>
      <div class="ph rv">Image or film placeholder</div>
      <section class="row rv"><h3>The Solution</h3><div>${c.solution.map((p) => `<p>${esc(p)}</p>`).join('')}
        </div></section>
      <div class="ph rv">Image or film placeholder</div>
      <section class="row rv"><h3>The Results</h3><div><p>${esc(c.results)}</p></div></section>`
      : `<p class="pend rv">Case material for ${esc(c.name)} is still in production. This page will follow the same Challenge, Solution, Results structure.</p>`;
    return `${nav(r)}<section class="case-hero"><h1 data-split>${esc(c.name.replace(' (tbc)', ''))}</h1><p class="line rv" style="--d:.25s">${esc(c.line)}</p></section>
      ${body}
      <div class="case-nav rv"><a href="#/${r.v}/case/${prev.id}">← ${esc(prev.name)}</a><a href="#/${r.v}/case/${next.id}">${esc(next.name)} →</a></div>
      ${footer()}${r.v === 'silver' ? silverBarHTML() : ''}`;
  }

  /* ---------- Showreel ---------- */
  const PLAY = '<svg width="26" height="30" viewBox="0 0 26 30"><path d="M0 0L26 15L0 30Z" fill="#000"/></svg>';
  const PAUSE_S = '<svg width="12" height="14" viewBox="0 0 12 14"><rect width="4" height="14" fill="#fff"/><rect x="8" width="4" height="14" fill="#fff"/></svg>';
  const PLAY_S = '<svg width="12" height="14" viewBox="0 0 12 14"><path d="M0 0L12 7L0 14Z" fill="#fff"/></svg>';

  function reelHTML(v) {
    const gold = v === 'gold';
    // Red moment markers belong to the intelligent showreel (Gold) only.
    const mk = !gold ? '' : D.reel.chapters.filter((c) => c.t > 0).map((c) => `<span class="mk" style="left:${(c.t / D.reel.duration) * 100}%" data-t="${c.t}"></span>`).join('');
    return `<div class="reel" data-reel-root>
      <div class="stage">
        <img class="poster" src="assets/showreel-poster.png" alt="A collage of R/GA work: Nike ACG, G42 and healthcare interfaces">
        <span class="chap" data-chap>A year at R/GA</span>
        <button class="bigplay" data-play aria-label="Play the showreel">${PLAY}</button>
        <div class="controls"><div class="bar">
          <button data-toggle aria-label="Play or pause">${PLAY_S}</button>
          <span class="time" data-time>0:00 / ${fmt(D.reel.duration)}</span>
          <div class="track" data-track role="slider" aria-label="Showreel position" tabindex="0"><div class="fill" data-fill></div>${mk}<div class="thumb-h" data-thumb></div><div data-pills></div></div>
          <button data-skip aria-label="Next chapter" title="Next chapter">⏭</button>
        </div>${gold ? `<button class="ask-me" data-askme>Ask Me <i>✦</i></button>` : ''}</div>
        <div class="zone" data-zone><div class="cap" data-cap></div></div>
      </div></div>`;
  }

  function createReel(root, onTick) {
    const dur = D.reel.duration; let t = 0; let playing = false; let timer = null;
    const q = (s) => $(s, root);
    const chapterAt = (x) => D.reel.chapters.reduce((a, c) => (x >= c.t ? c : a), D.reel.chapters[0]);
    const api = {
      get time() { return t; }, get playing() { return playing; }, capLocked: false,
      paint() {
        const pct = (t / dur) * 100;
        q('[data-fill]').style.width = pct + '%'; q('[data-thumb]').style.left = pct + '%';
        q('[data-time]').textContent = `${fmt(t)} / ${fmt(dur)}`;
        const c = chapterAt(t);
        q('[data-chap]').textContent = c.project ? c.project : 'A year at R/GA';
        if (!api.capLocked) { const cap = q('[data-cap]'); if (cap && cap.textContent !== c.text) { cap.textContent = c.text; cap.classList.remove('swap'); void cap.offsetWidth; cap.classList.add('swap'); } }
        $$('.mk', root).forEach((m) => m.classList.toggle('on', !!api.hi && Math.abs(+m.dataset.t - api.hi) < 1));
        if (onTick) onTick(t);
      },
      seek(x) { t = Math.max(0, Math.min(dur - 0.1, x)); api.paint(); },
      play() { if (playing) return; playing = true; root.classList.add('playing'); q('[data-toggle]').innerHTML = PAUSE_S; timer = setInterval(() => { t += 0.25; if (t >= dur) { t = dur - 0.1; api.pause(); } api.paint(); }, 250); },
      pause() { playing = false; root.classList.remove('playing'); q('[data-toggle]').innerHTML = PLAY_S; clearInterval(timer); },
      toggle() { playing ? api.pause() : api.play(); },
      destroy() { clearInterval(timer); }
    };
    q('[data-play]').addEventListener('click', api.play);
    q('[data-toggle]').addEventListener('click', api.toggle);
    const track = q('[data-track]');
    const seekFrom = (e) => { const b = track.getBoundingClientRect(); api.hi = null; api.seek(((e.clientX - b.left) / b.width) * dur); };
    track.addEventListener('click', seekFrom);
    track.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') api.seek(t + 5); if (e.key === 'ArrowLeft') api.seek(t - 5); });
    q('[data-skip]').addEventListener('click', () => { const n = D.reel.chapters.find((c) => c.t > t + 0.5); api.seek(n ? n.t : 0); });
    api.paint();
    return api;
  }

  /* ---------- Gold: the assistant takes over the screen and generates a page ----------
     Demo scope: every question builds the one designed page (Figma "Gold v3"), with the judge's own words in the rail. */
  const MIC = '<svg width="26" height="32" viewBox="0 0 26 32" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="9" y="2" width="8" height="16" rx="4"/><path d="M4 14a9 9 0 0 0 18 0M13 23v6M8 29h10"/></svg>';
  const KEYB = '<svg width="30" height="20" viewBox="0 0 30 20" fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="1" width="28" height="18" rx="3"/><path d="M6 6h2M11 6h2M16 6h2M21 6h2M6 10h2M11 10h2M16 10h2M21 10h2M9 14h12" stroke-linecap="round"/></svg>';
  const A_PLAY = '<svg width="10" height="12" viewBox="0 0 10 12" fill="none" stroke="#000" stroke-width="1" aria-hidden="true"><path d="M1 1l8 5-8 5z"/></svg>';
  const A_PODCAST = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#000" stroke-width="1" aria-hidden="true"><circle cx="7" cy="6" r="1.6"/><path d="M3.6 9.4a4.8 4.8 0 1 1 6.8 0M5 8a2.8 2.8 0 1 1 4 0"/><path d="M7 8.5V12"/></svg>';
  function genPageHTML() {
    const ph = (cls, i, txt, extra = '') => `<div class="gb gph ${cls}" style="--i:${i}" ${extra}>${txt}</div>`;
    return `
    <section class="gb g-cover" style="--i:0"><p class="g-kick">Brands that think.<br>Experiences that adapt.</p>
      <h2>This year, we stopped building brand channels and started building brand systems that think.</h2></section>
    <section class="gb g-lead" style="--i:1"><p>G42 challenged us to prove websites were dead. We agreed, and built what comes next. G42.ai is a generative interface where the brand itself is an intelligent agent. It turns PDFs, videos and press releases into living knowledge, then speaks from it, within guardrails, to people and to other AI agents. That’s an intelligent brand system.</p>
      <ul><li>/ Generative Interfaces</li><li>/ Future of Websites</li></ul></section>
    ${ph('g-hero', 2, '[VIDEO, hero, 10 sec loop, autoplay muted]<br>Quick cut between the two worlds: the G42.ai interface responding to a spoken query.')}
    <div class="gg">
      <p class="gb gt gt1" style="--i:3">It also makes personalisation scalable. An investor gets an executive briefing, a researcher gets a technical deep dive, and a government partner gets the story framed around their policy context. Each is generated in seconds, for one person, with no content team behind every version.</p>
      ${ph('gq', 3, 'G42 Investor / Researcher / Government<br>toggle')}
      <p class="gb gt gt2" style="--i:4">Nike ACG points the same thinking outward. All Conditions World is a hand-built globe where a live Wild Score reads weather, terrain and season, so the experience changes as the real world does.</p>
      ${ph('gv', 4, '[GIF / VIDEO]<br>Spinning the globe, opening a hotspot, hitting “Take it on”.')}
      ${ph('gw', 5, '[GIF / VIDEO]<br>The Wildhorse Hill view: the 9.8 Wild Score card, the Strava route card and the athlete card over the 3D terrain.')}
      ${ph('gi', 5, '[IMAGE]<br>The community route cards (Canella.cc, At Last Atalanta, Cri Cri Crew, Bold. Running Club, Sentier Chamonix) with their country tags,')}
      <div class="gdata">${ph('gd1', 6, '[DATA]<br>500K+ participants')}${ph('gd2', 6, '[DATA]<br>45M impressions')}</div>
    </div>
    <section class="gb g-two" style="--i:7"><p>Routes from athletes and grassroots communities link to real trails on Strava, and beginners and seasoned runners each find their own way in.</p><p>Nearly 500,000 people ran the routes and took on the Wild 300, driving 45 million impressions.</p></section>
    <section class="gb g-two g-end" style="--i:8"><h3>Different briefs,<br>one thread</h3><p>Intelligence built into the system, stories shaped for each person, experiences that adapt to the moment. One makes the screen smarter. The other sends people beyond it.</p></section>`;
  }

  const CLOSE_X = '<svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" aria-hidden="true"><path d="M2 2l30 30M32 2L2 32"/></svg>';
  const THINK = ['Reading the work…', 'Finding what connects it…', 'Building your page…'];
  const IDEAS = ['What is the common tread between all the projects?', 'Tell me more about Intelligent Brand Systems', 'What’s changed for G42 since launch?', 'What happens when the AI gets it wrong, and what guardrails exist?', 'Where did you fail this year, and what did you do about it?'];
  // The generated article builds itself: every word is wrapped so the copy streams in, block by block.
  function streamify(root) {
    $$('.gb', root).forEach((b) => {
      if (b.classList.contains('gph')) { const d = document.createElement('div'); while (b.firstChild) d.appendChild(b.firstChild); b.appendChild(d); }   // keep the words in one centred text block
      if (b.classList.contains('gt')) { const d = document.createElement('span'); d.className = 'gtw'; while (b.firstChild) d.appendChild(b.firstChild); b.appendChild(d); }   // the grid cell is a flex box: one block child keeps the words flowing as text
      let n = 0; const w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT); const nodes = [];
      while (w.nextNode()) nodes.push(w.currentNode);
      nodes.forEach((tn) => {
        if (!tn.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        tn.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--wd', (n++ * 0.03).toFixed(2) + 's'); s.textContent = part; frag.appendChild(s);
        });
        tn.replaceWith(frag);
      });
      // Until a block is generated, its text shows as skeleton lines that match its real line count.
      $$('p,h2,h3,li,.gtw', b).concat(b.matches('p') && !b.classList.contains('gt') ? [b] : []).forEach((t) => t.classList.add('gsk'));
    });
  }
  function mountGen() {
    const el = document.createElement('div'); el.id = 'gen'; el.className = 'gen'; el.hidden = true;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'R/GA assistant');
    el.innerHTML = `<div class="gen-bg"></div>
      <main class="gen-main" data-main tabindex="-1"></main>
      <div class="gen-id aid"><button class="gen-star" data-gen-toggle aria-label="Ask something new">✦</button>
        <div class="gen-intro"><b>An entry that adapts to you.</b><small>I can help you deep dive or see the work in another way. Just say the word.</small></div>
        <p class="gen-q" data-qtext></p><p class="gen-reply">Here is a quick download. Let me know if you need more information.</p></div>
      <button class="gen-x" data-gen-close aria-label="Close the assistant">${CLOSE_X}</button>
      <form class="gen-ask" data-form autocomplete="off">
        <div class="gen-row"><div class="gen-field empty" data-field><input data-q aria-label="Ask the assistant"><button type="button" class="gen-tick" data-tick tabindex="-1" aria-label="Use this suggestion"><span data-tickt></span></button></div>
          <button type="button" class="gen-ic" data-mic aria-label="Speak your question">${MIC}</button><button type="button" class="gen-ic" data-kb aria-label="Type your question">${KEYB}</button></div>
        <p class="gen-status" data-status aria-live="polite"></p>
      </form>`;
    document.body.appendChild(el);
    const input = $('[data-q]', el); const main = $('[data-main]', el); const qText = $('[data-qtext]', el); const status = $('[data-status]', el);
    const field = $('[data-field]', el); const tickT = $('[data-tickt]', el);
    const timers = []; const raw = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const clearT = () => timers.splice(0).forEach(clearTimeout);
    const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let mode = 'closed';                   // closed | take | think | page

    /* ticker: ideas for what to ask, sliding through the text field */
    let ti = 0;
    const tickReset = () => { ti = 0; tickT.textContent = IDEAS[0]; tickT.className = ''; };
    tickReset();
    raw.push(setInterval(() => {
      if (mode !== 'take' || input.value) return;
      tickT.className = 'out';
      setTimeout(() => { ti = (ti + 1) % IDEAS.length; tickT.textContent = IDEAS[ti]; tickT.className = 'in'; }, 320);
    }, 3300));
    input.addEventListener('input', () => field.classList.toggle('empty', !input.value));

    /* visual states */
    const resetInput = () => { input.value = ''; input.readOnly = false; field.classList.add('empty'); status.textContent = ''; tickReset(); };
    function visualOpen() {                // the red panel slides in from the right
      clearT(); el.hidden = false; el.className = 'gen take'; resetInput(); mode = 'take';
      document.documentElement.classList.add('gen-open');
      void el.offsetWidth; el.classList.add('in'); later(() => input.focus(), 460);
    }
    function toTake() {
      clearT(); el.classList.remove('page', 'think', 'reveal'); el.classList.add('take'); resetInput(); mode = 'take';
      later(() => input.focus(), 500);
    }
    function visualClose() {               // and slides back out to the right
      if (mode === 'closed') return;
      clearT(); mode = 'closed'; el.classList.remove('in'); document.documentElement.classList.remove('gen-open');
      later(() => { el.hidden = true; el.className = 'gen'; }, 700);
    }
    // The article is generated as you scroll: each block is written the moment it comes into view.
    let io = null;
    function watchBlocks() {
      if (io) io.disconnect();
      io = new IntersectionObserver((es) => {
        let k = 0;
        es.filter((e) => e.isIntersecting).sort((x, y) => x.boundingClientRect.top - y.boundingClientRect.top).forEach((e) => {
          e.target.style.setProperty('--o', k++); e.target.classList.add('on'); io.unobserve(e.target);
        });
      }, { root: main, rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
      $$('.gb', main).forEach((b) => io.observe(b));
    }
    function loadArticle(q) {
      if (io) io.disconnect();
      qText.textContent = q; input.value = q; input.readOnly = true; field.classList.remove('empty');
      main.innerHTML = genPageHTML(); streamify(main); main.scrollTop = 0;
    }
    function showPage(q) {                 // arriving straight on the article (history forward / reload)
      clearT(); loadArticle(q); el.hidden = false; document.documentElement.classList.add('gen-open');
      el.className = 'gen page'; void el.offsetWidth; el.classList.add('in'); mode = 'page';
      later(() => { el.classList.add('reveal'); watchBlocks(); }, 650);
    }
    // Demo: every question gets the same designed article ("Common Tread"), after a short generation animation.
    function runGenerate(q) {
      clearT(); loadArticle(q); input.blur();
      el.classList.remove('take', 'page', 'reveal'); el.classList.add('think'); mode = 'think';
      const step = reduceMotion ? 700 : 1050;
      THINK.forEach((s, k) => later(() => { status.classList.remove('swap'); void status.offsetWidth; status.textContent = s; status.classList.add('swap'); }, k * step));
      later(() => {                        // the red screen collapses into the rail, the page builds beside it
        el.classList.remove('think'); el.classList.add('page'); mode = 'page';
        later(() => { el.classList.add('reveal'); watchBlocks(); }, 650);
      }, THINK.length * step + 150);
    }
    // The assistant's state follows the URL (?ai=take|page&q=...), so back and forward always work.
    function sync(ai, q) {
      if (!ai) return visualClose();
      if (ai === 'take') { if (mode === 'closed') visualOpen(); else if (mode !== 'take') toTake(); return; }
      if (ai === 'page' && q) {
        if (mode === 'take') runGenerate(q);
        else if (mode === 'closed') showPage(q);
        else if (mode === 'page' && qText.textContent !== q) showPage(q);
      }
    }
    const setHash = (ch) => { const h = hashWith(ch); if (h !== location.hash) location.hash = h; };
    const ask = () => setHash({ ai: 'take', q: null });
    const generate = (q) => { q = (q || '').trim(); if (q && mode === 'take') setHash({ ai: 'page', q }); };
    function back() {                      // close, Esc: one step back in history
      history.back();
      setTimeout(() => { if (route().ai && mode !== 'closed') setHash({ ai: null, q: null }); }, 400);
    }
    // A suggested question: open the assistant, type it for the judge, then generate.
    function openWith(q) {
      if (mode === 'closed') ask();
      const iv = setInterval(() => {
        if (mode !== 'take') return; clearInterval(iv);
        let n = 0;
        const typeNext = () => { n += 1; input.value = q.slice(0, n); field.classList.remove('empty'); if (n < q.length) later(typeNext, 22); else later(() => generate(q), 450); };
        later(typeNext, 560);
      }, 40);
      raw.push(iv); setTimeout(() => clearInterval(iv), 4000);
    }
    el.addEventListener('submit', (e) => { e.preventDefault(); generate(input.value); });
    el.addEventListener('click', (e) => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.matches('[data-gen-close]')) return back();
      if (t.matches('[data-gen-toggle]')) return mode === 'page' ? ask() : undefined;
      if (t.matches('[data-tick]')) { input.value = IDEAS[ti]; return generate(IDEAS[ti]); }
      if (t.matches('[data-kb]')) return input.focus();
      if (t.matches('[data-mic]')) {
        const stub = { classList: t.classList, textContent: '' };
        return void startVoice(stub, (txt) => { input.value = txt; field.classList.remove('empty'); }, (txt) => txt && generate(txt));
      }
    });
    const onKey = (e) => { if (e.key === 'Escape' && mode !== 'closed') back(); };
    document.addEventListener('keydown', onKey);
    window.__gen = { open: ask, openWith, sync };
    cleanup.push(() => {
      clearT(); raw.forEach((x) => { clearInterval(x); clearTimeout(x); }); document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('gen-open'); el.remove(); window.__gen = null;
    });
    const r0 = route(); if (r0.ai) sync(r0.ai, r0.q);
  }

  /* ---------- Voice (Web Speech API where available) ---------- */
  function startVoice(btn, onText, onDone) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('Voice input is not supported in this browser. Type instead.'); return null; }
    const r = new SR(); r.lang = 'en-GB'; r.interimResults = true; let final = '';
    btn.classList.add('live'); btn.textContent = '● Listening…';
    r.onresult = (e) => { final = [...e.results].map((x) => x[0].transcript).join(''); onText(final); };
    r.onend = () => { btn.classList.remove('live'); btn.textContent = '● Voice'; onDone(final.trim()); };
    r.onerror = () => { toast('Could not hear anything. Try again or type.'); };
    r.start(); return r;
  }

  /* ---------- Silver: the red bar grows into the assistant ---------- */
  // The bar only appears with the showreel, the case study list and case study pages (away = hidden).
  function silverBarHTML(away) {
    return `<section class="sbar${away ? ' away' : ''}" id="sbar" aria-label="R/GA assistant">
      <div class="sbar-w sbar-wc"><div class="sbar-inner"><button class="sbar-collapsed" data-open>Ask the R/GA assistant <i>✦</i></button></div></div>
      <div class="sbar-w sbar-wo"><div class="sbar-inner"><div class="sbar-open"><div class="sbar-head"><span>R/GA assistant ✦</span><button data-collapse>Collapse ↓</button></div>
        <div class="convo" data-convo aria-live="polite"></div>
        <form class="sin" data-sform><input data-sq placeholder="Ask about any of the five projects…" aria-label="Ask the assistant" autocomplete="off"><button type="button" class="vbtn" data-svoice>● Voice</button><button class="sbtn" aria-label="Send">→</button></form>
        <p class="sbar-hint">Conversations are logged for review. Answers never go beyond approved material.</p></div></div></div></section>`;
  }

  function mountSilver(r) {
    const bar = $('#sbar'); const convo = $('[data-convo]', bar); const input = $('[data-sq]', bar);
    const ctx = r.p === 'case' ? ((D.cases.find((c) => c.id === r.id) || {}).name || '').replace(' (tbc)', '') : null;
    const row = (label, inner) => `<div class="crow"><label>${label}</label><div class="c">${inner}</div></div>`;
    const chips = (list, label = 'TRY ASKING') => row(label, `<div class="chips">${list.map((s) => `<button type="button" class="chip" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div>`);
    const scroll = () => { convo.scrollTop = convo.scrollHeight; };
    function welcome() {
      const list = ctx ? [`What was the challenge on ${ctx}?`, `Where is the system intelligent on ${ctx}?`, `What were the results for ${ctx}?`] : D.suggestions;
      convo.innerHTML = `<div class="crow"><div class="hi">Hi ${esc(session.name.split(' ')[0])}. Ask me anything about the five projects.</div><div class="c"><div class="chips">${list.map((s) => `<button type="button" class="chip" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div></div></div>`;
    }
    function open() { bar.classList.add('open'); if (!convo.children.length) welcome(); setTimeout(() => input.focus(), 50); }
    function collapse() { bar.classList.remove('open'); }
    function ask(q) {
      $$('.crow', convo).forEach((x) => { if (x.dataset.suggest) x.remove(); });
      if (!convo.querySelector('.hi')) { /* keep history */ } else convo.innerHTML = '';
      convo.insertAdjacentHTML('beforeend', row('YOU', `<div class="q">${esc(q)}</div>`));
      const id = 'th' + Date.now();
      convo.insertAdjacentHTML('beforeend', `<div class="crow" id="${id}"><label>R/GA ASSISTANT</label><div class="c"><div class="sk" style="width:100%"></div><div class="sk" style="width:82%"></div><div class="sk" style="width:55%"></div><small>Reading the case study and team interview…</small></div></div>`);
      scroll();
      setTimeout(() => {
        const a = D.ask(q, ctx); const el = document.getElementById(id); if (!a || !el) return;
        let inner = '';
        if (a.kind !== 'ok') inner += `<span class="tag">${a.kind === 'out' ? 'Out of scope' : 'Not in knowledge base'}</span>`;
        inner += `<div class="a">${esc(a.text)}</div>`;
        el.outerHTML = `<div class="crow"><label>R/GA ASSISTANT</label><div class="c">${inner}</div></div>`
          + (a.kind === 'ok' ? row('SOURCES', a.sources.map((s, i) => `<div class="cite"><b>${i + 1}</b>${esc(s)}</div>`).join('')) : '')
          + chips(a.followups, a.kind === 'ok' ? 'KEEP GOING' : a.kind === 'out' ? 'TRY INSTEAD' : 'CLOSEST I CAN OFFER');
        scroll(); input.focus();
      }, 800);
    }
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.matches('[data-open]')) return open();
      if (b.matches('[data-collapse]')) return collapse();
      if (b.dataset.s) return ask(b.dataset.s);
      if (b.matches('[data-svoice]')) startVoice(b, (txt) => { input.value = txt; }, (txt) => { if (txt) { input.value = ''; ask(txt); } });
    });
    // Clicking anywhere outside the red bar collapses it.
    const outside = (e) => { if (bar.classList.contains('open') && !e.composedPath().includes(bar)) collapse(); };
    document.addEventListener('click', outside); cleanup.push(() => document.removeEventListener('click', outside));
    $('[data-sform]', bar).addEventListener('submit', (e) => { e.preventDefault(); const v = input.value.trim(); if (!v) return; input.value = ''; ask(v); });
    const esc2 = (e) => { if (e.key === 'Escape') collapse(); };
    document.addEventListener('keydown', esc2); cleanup.push(() => document.removeEventListener('keydown', esc2));
  }

  /* ---------- Motion: reveal on scroll, split headlines, outlines drawn by scroll ---------- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function initMotion() {
    $$('[data-split]', app).forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map((w, i) => `<span class="w"><span style="--i:${i}">${esc(w)}</span></span>`).join(' ');
      el.classList.add('rv-split');
    });
    // Content inside deck stages is revealed by the deck (class "on" on the stage), not by the observer.
    const targets = $$('.rv, .rv-split', app).filter((t) => !t.closest('.stg'));
    if (reduce || !('IntersectionObserver' in window)) targets.forEach((t) => t.classList.add('in'));
    else {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      targets.forEach((t) => io.observe(t));
      cleanup.push(() => io.disconnect());
    }
    initDeck();
  }

  /* ---------- The three rectangles, traced by scroll (Figma Motion Step 0 to 4) ----------
     Step 0  black
     Step 1  three traces start from their corner handles and run both ways
     Step 2  the outlines complete and every corner handle appears
     Step 3  the two overlap areas fill red
     Step 4  the BRANDS / STORIES / EXPERIENCES labels arrive                              */
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  function buildGraph() {
    const graph = $('#graph'); if (!graph) return null;
    const svg = $('.mg-svg', graph); const NS = 'http://www.w3.org/2000/svg';
    const lines = [];
    G.boxes.forEach((b) => ['A', 'B'].forEach((dir, di) => {
      const edges = b[dir].map((e) => {
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', `M${e[0]} ${e[1]} L${e[2]} ${e[3]}`);
        p.setAttribute('class', 'mg-line ' + (e[4] === 'r' ? 'red' : 'grey'));
        const len = Math.hypot(e[2] - e[0], e[3] - e[1]);
        p.style.strokeDasharray = `${len} ${len}`; p.style.strokeDashoffset = len;
        svg.appendChild(p);
        return { p, len, red: e[4] === 'r' };
      });
      lines.push({ box: b.k, dir, edges, l1: b.l1[di], total: edges[0].len + edges[1].len });
    }));
    const handles = $$('.mg-h', graph).map((el) => ({ el, def: G.handles.find((h) => h.id === el.dataset.h) }));
    const tints = $$('.mg-tint', graph); const labels = $$('.mg-l', graph);
    return {
      set(p) {
        // Each step draws, then rests, so every step has room to be seen:
        // 0 rest | 1 draw .10-.26 rest | 2 draw .34-.52 rest | 3 fill .60-.68 rest | 4 labels .76-.86 rest
        const t1 = clamp01((p - 0.10) / 0.16); const t2 = clamp01((p - 0.34) / 0.18);
        const t3 = clamp01((p - 0.60) / 0.08); const t4 = clamp01((p - 0.76) / 0.10);
        const redA = 0.5 + 0.4 * ease(t4);
        const drawn = {};
        lines.forEach((ln) => {
          const d = t2 > 0 ? ln.l1 + (ln.total - ln.l1) * t2 : ln.l1 * t1; // linear, so the trace never slows between steps
          const e1 = Math.min(d, ln.edges[0].len); const e2 = Math.max(0, Math.min(d - ln.edges[0].len, ln.edges[1].len));
          [e1, e2].forEach((v, i) => { const e = ln.edges[i]; e.p.style.strokeDashoffset = e.len - v; e.p.style.stroke = '#FF0000'; });
          drawn[ln.box + ln.dir] = { d, e1 };
        });
        handles.forEach(({ el, def }) => {
          let on = false;
          if (def.when === 'start') on = (drawn[def.box + 'A'].d > 0.5);
          else on = (drawn[def.box + def.when[0]].e1 >= (def.when === 'A1' ? lines.find((l) => l.box === def.box && l.dir === 'A') : lines.find((l) => l.box === def.box && l.dir === 'B')).edges[0].len - 0.5);
          el.style.setProperty('--v', on ? 1 : 0);
        });
        tints.forEach((t) => { t.style.opacity = ease(t3); });
        labels.forEach((l) => { l.style.opacity = ease(t4); l.style.transform = `translateY(${(1 - ease(t4)) * 12}px)`; });
      }
    };
  }

  /* ---------- Deck: a sequence of steps. Each swipe down plays the next step ----------
     0  load welcome copy
        swipe down
     1  transition to black, animate the red outlines, load the copy inside the rectangles
        swipe down
     2  transition to the video, grow it, display play
        swipe down
     3  transition to case studies
        swipe down
     4  transition to closing                                                                  */
  function initDeck() {
    const deck = $('#deck'); if (!deck) return;
    const stages = $$('.stg', deck); const dots = $$('.dots button', deck);
    const view = $('#deckView');
    const graph = buildGraph() || { set() {} };
    const isGold = !!$('.stg-gwelcome', deck);
    const reelEl = $('.stg-video .reel', deck); const videoHead = $('.stg-video .work-head', deck);
    const navEl = $('.site-nav');
    let idx = 0; let busy = false; let stacked = false; let alive = true;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const tween = (ms, fn) => new Promise((res) => {
      const t0 = performance.now();
      const tick = () => { if (!alive) return res(); const t = Math.min(1, (performance.now() - t0) / ms); fn(t); if (t < 1) setTimeout(tick, 16); else res(); };
      tick();
    });

    // The video starts as the image only, grows to fill the window, then the player functions appear.
    function setVideo(g, ui) {
      if (!reelEl) return;
      const vw = view.clientWidth; const vh = view.clientHeight;
      const sw = Math.min(vw * 0.56, (vh - 150) * 16 / 9); const sh = sw * 9 / 16; const sx = (vw - sw) / 2; const sy = (vh - sh) / 2 + 28;
      reelEl.style.left = sx * (1 - g) + 'px'; reelEl.style.top = sy * (1 - g) + 'px';
      reelEl.style.width = (sw + (vw - sw) * g) + 'px'; reelEl.style.height = (sh + (vh - sh) * g) + 'px';
      reelEl.style.setProperty('--ui', ui); reelEl.classList.toggle('ui-off', ui < 0.5);
      if (videoHead) videoHead.style.opacity = 1 - clamp01(g * 2.4);
    }
    function resetVideo() {
      if (!reelEl) return;
      ['left', 'top', 'width', 'height'].forEach((k) => { reelEl.style[k] = ''; });
      reelEl.style.setProperty('--ui', 1); reelEl.classList.remove('ui-off'); if (videoHead) videoHead.style.opacity = '';
    }
    // Final resting look of each stage (used when stepping back or jumping)
    function rest(i) {
      if (i === 1 && graph) graph.set(1);
      if (i === 2) setVideo(1, 1);
    }
    // Silver's assistant bar belongs to the showreel (2) and the case study list (3) only.
    const sbarEl = $('#sbar');
    const setBar = (show) => {
      if (!sbarEl) return;
      sbarEl.classList.toggle('away', !show);
      if (!show) sbarEl.classList.remove('open');
    };
    function mark(i) {
      stages.forEach((st, k) => st.classList.toggle('on', k === i));
      dots.forEach((d, k) => d.classList.toggle('active', k === i));
      idx = i; setBar(i === 2 || i === 3);
      document.body.classList.toggle('on-work', !!stages[i] && stages[i].dataset.stg === 'work');
    }
    const off = (to) => { stages.forEach((st) => st.classList.remove('on')); if (to !== 2 && to !== 3) setBar(false); };

    async function forward(to) {
      if (idx === 2 && app._reel) app._reel.pause();
      // Steps 2 and 3 complete in 2s: 0.3s fade away + 0.2s settle + 1.5s animation, eased in and out.
      off(to); await sleep(300);                             // current container fades away
      if (to === 1 && $('#graph')) {
        graph.set(0); mark(1); await sleep(200);             // transition to black background
        // Outlines, overlaps and copy play as one continuous animation (no pauses): the scroll mapping's
        // rest bands are skipped so the timeline moves at an even pace from start to end.
        // Weights follow how far each part of the drawing travels, so the lines move at one even speed.
        const bands = [[0.10, 0.26, 0.23], [0.34, 0.52, 0.55], [0.60, 0.68, 0.10], [0.76, 0.86, 0.12]];
        const mapP = (t) => { let u = t; for (const [a, b, w] of bands) { if (u <= w) return a + (b - a) * (u / w); u -= w; } return 0.86; };
        await tween(1500, (t) => graph.set(mapP(inOut(t)))); // accelerates, then slows to a stop
        graph.set(1);
      } else if (to === 2 && reelEl) {
        setVideo(0, 0); mark(2); await sleep(200);           // transition to the video component, image only
        await tween(1200, (t) => setVideo(inOut(t), 0));     // grow the video: accelerates, then slows to a stop
        await tween(300, (t) => setVideo(1, inOut(t)));      // display play
      } else { mark(to); await sleep(600); }                 // case studies, closing
    }
    async function backward(to) {
      off(to); await sleep(250); rest(to); mark(to); await sleep(500);
    }
    // Scroll position and step stay in step: stage k "lives" at scrollY = k * zone.
    const zone = () => (view.clientHeight || window.innerHeight);
    const homeY = (i) => deckTop() + i * zone();
    const deckTop = () => deck.getBoundingClientRect().top + window.scrollY;
    const snapTo = (i) => window.scrollTo({ top: homeY(i), behavior: 'instant' });
    async function go(to, instant) {
      if (busy || to === idx || to < 0 || to >= stages.length) return;
      busy = true;
      try {
        if (instant) { off(to); await sleep(450); rest(to); mark(to); await sleep(450); }
        else if (to > idx) await forward(to); else await backward(to);
      } finally { busy = false; }
      snapTo(idx);   // the scroll position follows the step (the stage itself is pinned, so nothing visibly jumps)
      if (isGold && !stacked) { const h = hashWith({ s: stages[idx].dataset.stg === 'work' ? 'work' : null }); if (h !== location.hash) location.hash = h; }
    }
    window.__deck = { goto: async (i) => { if (stacked) return window.scrollTo(0, 0); await go(i, true); snapTo(i); },
      sync: (s) => { if (!isGold || stacked || busy) return; const t = s === 'work' ? 1 : 0; if (t !== idx) go(t); } };

    /* ----- scroll triggers the steps: scrolling past a stage's threshold plays the next sequence ----- */
    // Steps pause while the judge is in a conversation (Gold's ask panel open).
    const paused = () => idx === 2 && !!$('.stg-video .ask-in', deck);
    function evaluate() {
      if (stacked || busy || paused()) return;
      const rel = window.scrollY - deckTop(); const Z = zone();
      if (rel > idx * Z + 0.3 * Z && idx < stages.length - 1) go(idx + 1);
      else if (rel < idx * Z - 0.3 * Z && idx > 0) go(idx - 1);
    }
    dots.forEach((d) => d.addEventListener('click', () => window.__deck.goto(+d.dataset.stage)));

    /* ----- layout mode: steps on desktop, stacked scroll on small screens ----- */
    function updateStacked() {
      stages.forEach((st) => st.classList.add('on')); resetVideo();
      const inView = (sel) => { const e = $(sel, deck); if (!e) return false; const b = e.getBoundingClientRect(); return b.top < window.innerHeight * 0.6 && b.bottom > window.innerHeight * 0.4; };
      setBar(inView('.stg-video') || inView('.stg-cases'));
      if (graph) { const g = $('#graph'); const top = g.getBoundingClientRect().top; const vh = window.innerHeight; graph.set(reduce ? 1 : clamp01((vh * 0.95 - top) / (vh * 0.8))); }
    }
    function measure() {
      const was = stacked;
      stacked = reduce || window.innerWidth < 821 || window.innerHeight < 640;
      deck.classList.toggle('stacked', stacked);
      document.documentElement.style.setProperty('--navh', (navEl ? navEl.offsetHeight : 60) + 'px');
      if (stacked) { deck.style.height = ''; updateStacked(); }
      else {
        // The page is as tall as one screen per stage, so scrolling has somewhere to go.
        deck.style.height = (view.clientHeight || window.innerHeight) * stages.length + 'px';
        if (was !== stacked) { idx = 0; graph.set(0); mark(0); setVideo(0, 0); }
      }
    }
    const onResize = () => { measure(); if (!stacked && idx === 2) setVideo(1, 1); };
    const onScroll = () => { if (stacked) updateStacked(); else evaluate(); };
    stacked = true; measure();            // first pass decides the mode
    if (!stacked) { graph.set(0); mark(0); setVideo(0, 0); }
    // Coming back from a case page lands on the list of case studies.
    if (sessionStorage.getItem('aoty-to-work') || route().s === 'work') {
      sessionStorage.removeItem('aoty-to-work');
      const li = stages.findIndex((s) => s.dataset.stg === 'work' || s.dataset.stg === 'cases');
      if (li > 0) {
        if (stacked) stages[li].scrollIntoView({ block: 'start' });
        else { graph.set(1); mark(li); snapTo(li); }
      }
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    cleanup.push(() => {
      alive = false;
      window.removeEventListener('resize', onResize); window.removeEventListener('scroll', onScroll);
      window.__deck = null;
    });
  }

  /* ---------- Login cube: drag to rotate, gentle spin when idle ---------- */
  function mountCube() {
    const scene = $('#cubeScene'); if (!scene) return;
    const cube = scene.querySelector('.cube');
    let rx = -24, ry = 32, vx = 0, vy = 0.08, down = false, lx = 0, ly = 0, raf = 0;
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    // One fixed light (upper left, towards the viewer). Each face is shaded by the angle between its
    // rotated normal and that light, so the shading changes naturally as the cube turns.
    const L = (() => { const v = [-0.8, -0.5, 1.4], m = Math.hypot(...v); return v.map((n) => n / m); })();
    // Each face: outward normal n, and its own x / y axes (ex, ey) as laid out by the CSS transforms.
    const faces = [
      ['.f-front',  [0, 0, 1],  [1, 0, 0],  [0, 1, 0]],
      ['.f-back',   [0, 0, -1], [-1, 0, 0], [0, 1, 0]],
      ['.f-right',  [1, 0, 0],  [0, 0, -1], [0, 1, 0]],
      ['.f-left',   [-1, 0, 0], [0, 0, 1],  [0, 1, 0]],
      ['.f-top',    [0, -1, 0], [1, 0, 0],  [0, 0, 1]],
      ['.f-bottom', [0, 1, 0],  [1, 0, 0],  [0, 0, -1]],
    ].map(([sel, n, ex, ey]) => ({ el: cube.querySelector(sel), n, ex, ey }));
    // Acrylic with ONE light source. Light sits at a fixed point (upper left, towards the viewer) in the
    // same space as the cube. For every face we mirror that point in the face's plane and look where the
    // line from the camera to the mirror image crosses the plane: that is where the reflection really lands,
    // so the highlight slides across the faces consistently as the cube turns.
    const DARK = [150, 0, 0], LIGHT = [255, 78, 78], CAM = 1100;
    const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
    const shade = () => {
      const s = cube.offsetWidth || 240;
      const a = rx * Math.PI / 180, b = ry * Math.PI / 180;
      const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
      const rot = (v) => { const x1 = v[0] * cb + v[2] * sb, z1 = -v[0] * sb + v[2] * cb; return [x1, v[1] * ca - z1 * sa, v[1] * sa + z1 * ca]; };
      const P = [-0.8 * s, -0.5 * s, 1.4 * s], C = [0, 0, CAM];   // the one light, same direction as L
      faces.forEach(({ el, n, ex, ey }) => {
        const nw = rot(n), exw = rot(ex), eyw = rot(ey);
        const c = nw.map((v) => v * s / 2);
        const d = Math.max(0, dot(nw, L));
        const t = Math.min(1, 0.2 + 0.9 * d);
        const front = dot(nw, [C[0] - c[0], C[1] - c[1], C[2] - c[2]]) > 0;   // seen from outside vs through the acrylic
        let spec = '';
        const sideL = dot(nw, [P[0] - c[0], P[1] - c[1], P[2] - c[2]]);
        if (front && sideL > 0) {
          const k = 2 * sideL, M = [P[0] - k * nw[0], P[1] - k * nw[1], P[2] - k * nw[2]];  // light mirrored in the plane
          const den = dot(nw, [M[0] - C[0], M[1] - C[1], M[2] - C[2]]);
          const tt = dot(nw, [c[0] - C[0], c[1] - C[1], c[2] - C[2]]) / den;
          const X = [C[0] + tt * (M[0] - C[0]) - c[0], C[1] + tt * (M[1] - C[1]) - c[1], C[2] + tt * (M[2] - C[2]) - c[2]];
          const u = 50 + 100 * dot(X, exw) / s, v = 50 + 100 * dot(X, eyw) / s;
          // the light is a soft box, not a pin-point: glow strength falls off with how far the mirror point is from the face
          const dx = Math.max(0, Math.abs(u - 50) - 50), dy = Math.max(0, Math.abs(v - 50) - 50), I = Math.exp(-((dx * dx + dy * dy) / (90 * 90)));
          spec = `radial-gradient(circle at ${u.toFixed(1)}% ${v.toFixed(1)}%,rgba(255,255,255,${(0.7 * I).toFixed(3)}),rgba(255,255,255,${(0.24 * I).toFixed(3)}) 40%,rgba(255,255,255,0) 95%),`;
        }
        const col = DARK.map((cc, i) => Math.round(cc + (LIGHT[i] - cc) * t)).join(',');
        el.style.background = `${spec}rgba(${col},${front ? 0.66 : 0.4})`;
      });
    };
    const paint = () => { cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; shade(); };
    const tick = () => {
      if (!scene.isConnected) return;
      if (!down) {
        // heavy: a long, slow coast back to a lazy idle spin
        ry += vy; rx += vx;
        vx *= 0.985; vy += ((reduce ? 0 : 0.08) - vy) * 0.008;
      }
      paint(); raf = requestAnimationFrame(tick);
    };
    scene.addEventListener('pointerdown', (e) => { down = true; lx = e.clientX; ly = e.clientY; scene.classList.add('drag'); scene.setPointerCapture(e.pointerId); });
    scene.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
      // low gain + velocity that builds up gradually, so the cube feels like it has mass
      const gx = dx * 0.2, gy = dy * 0.2;
      ry += gx; rx -= gy;
      vy = Math.max(-3, Math.min(3, vy * 0.8 + gx * 0.2)); vx = Math.max(-3, Math.min(3, vx * 0.8 - gy * 0.2));
    });
    const up = () => { down = false; scene.classList.remove('drag'); };
    scene.addEventListener('pointerup', up); scene.addEventListener('pointercancel', up);
    paint(); raf = requestAnimationFrame(tick);
  }

  /* ---------- Wiring ---------- */
  function wire(r) {
    if (r.p === 'login') {
      $('#loginForm').addEventListener('submit', (e) => { e.preventDefault(); session.signedIn = true; sessionStorage.setItem('aoty-in', '1'); go(r.v, 'welcome'); });
      mountCube();
      return;
    }
    app.addEventListener('click', onClick);
    cleanup.push(() => app.removeEventListener('click', onClick));
    const root = $('[data-reel-root]');
    if (root) {
      const reel = createReel(root); app._reel = reel; cleanup.push(() => reel.destroy());
    }
    if (r.v === 'silver') mountSilver(r);
    if (r.v === 'gold') { mountGen(); mountTiles(); mountRailChips(); }
  }
  function onClick(e) {
    const r = route();
    if (e.target.closest('[data-gen-open]') && window.__gen) return window.__gen.open();
    if (e.target.closest('[data-to-work]')) sessionStorage.setItem('aoty-to-work', '1');   // the welcome page then opens on the case list
    const chipq = e.target.closest('[data-chip-gen]'); if (chipq && window.__gen) return window.__gen.openWith(chipq.dataset.chipGen);
    const card = e.target.closest('[data-case]'); if (card) return go(r.v, 'case', card.dataset.case);
    if (e.target.closest('[data-act="logout"]')) { session.signedIn = false; sessionStorage.removeItem('aoty-in'); go(r.v, 'login'); }
  }

  /* ---------- Intro overlay: introduces the three options before the prototype ---------- */
  const ICONS = {
    bronze: '<svg viewBox="0 0 83 83" aria-hidden="true"><circle cx="41.5" cy="41.5" r="41.5" fill="#000"/><rect x="12.15" y="12.16" width="58.69" height="58.69" fill="#f00"/><circle cx="41.5" cy="41.5" r="29.34" fill="#f00"/></svg>',
    silver: '<svg viewBox="0 0 83 83" aria-hidden="true"><circle cx="41.5" cy="41.5" r="41.5" fill="#000"/><rect x="41.5" width="58.69" height="58.69" transform="rotate(45 41.5 0)" fill="#f00"/><circle cx="41.5" cy="41.5" r="29.05" fill="#000" stroke="#f00" stroke-width=".58"/><rect x="21.12" y="21.12" width="40.77" height="40.77" fill="#f00"/></svg>',
    gold: '<svg viewBox="0 0 83 83" aria-hidden="true"><circle cx="41.5" cy="41.5" r="41.5" fill="#000"/><rect x="12.15" y="12.15" width="58.69" height="58.69" fill="#f00"/><circle cx="41.5" cy="41.5" r="29.05" fill="#000" stroke="#f00" stroke-width=".58"/><rect x="21.12" y="21.12" width="40.77" height="40.77" fill="#f00"/><circle cx="41.5" cy="41.5" r="20.24" fill="#000" stroke="#f00" stroke-width=".29"/><rect x="27.27" y="27.27" width="28.47" height="28.47" fill="#f00"/></svg>'
  };
  const TIERS = [
    ['bronze', 'Bronze', 'A one-minute showreel of our year and a page for every project. Familiar by design, so the focus stays on the work, not the interface.'],
    ['silver', 'Silver', 'The same work, with a virtual assistant alongside. It answers judges’ questions from a knowledge base curated by our teams.'],
    ['gold', 'Gold', 'A generative interface. The assistant takes over the screen, and every question a judge asks becomes a page built just for them.']
  ];
  function openIntro() {
    if ($('#intro')) return;
    const el = document.createElement('div');
    el.id = 'intro'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Choose a version of the prototype');
    el.innerHTML = `<div class="intro-panel"><div class="intro-top"><span>AOTY</span><span>V1</span></div>
      <div class="intro-tiers">${TIERS.map((t) => `<button class="tier" data-tier="${t[0]}">${ICONS[t[0]]}<h2>${t[1]}</h2><p>${t[2]}</p><span class="go">&gt;&gt;</span></button>`).join('')}</div></div>`;
    document.body.appendChild(el); document.documentElement.classList.add('intro-open');
    requestAnimationFrame(() => el.classList.add('in')); setTimeout(() => el.classList.add('in'), 30);
    const first = $('.tier', el); if (first) first.focus();
    el.addEventListener('click', (e) => {
      const b = e.target.closest('.tier');
      if (b) { closeIntro(); const r = route(); go(b.dataset.tier, r.p === 'login' ? 'welcome' : r.p, r.id); }
      else if (!e.target.closest('.intro-panel')) closeIntro();
    });
  }
  function closeIntro() {
    const el = $('#intro'); if (!el) return;
    sessionStorage.setItem('aoty-intro', '1');
    el.classList.remove('in'); el.classList.add('out');
    document.documentElement.classList.remove('intro-open');
    setTimeout(() => el.remove(), 650);
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#intro')) closeIntro(); });

  /* ---------- Switcher ---------- */
  const swTitle = $('#switcher .sw-title');
  if (swTitle) { swTitle.addEventListener('click', openIntro); swTitle.setAttribute('role', 'button'); swTitle.setAttribute('tabindex', '0'); swTitle.title = 'About the three versions'; swTitle.addEventListener('keydown', (e) => { if (e.key === 'Enter') openIntro(); }); }
  // Switching version always starts at the homepage (the login first if not signed in).
  function jumpTo(v) { const before = location.hash; render.key = null; go(v, session.signedIn ? 'welcome' : 'login'); if (location.hash === before) render(); }
  $$('#switcher [data-v]').forEach((b) => b.addEventListener('click', () => jumpTo(b.dataset.v)));
  document.addEventListener('keydown', (e) => {
    if (/input|textarea/i.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
    const i = ['1', '2', '3'].indexOf(e.key); if (i < 0) return;
    jumpTo(VARIANTS[i]);
  });
  window.addEventListener('hashchange', render);
  if (!location.hash) location.hash = '/bronze/' + (session.signedIn ? 'welcome' : 'login'); else render();
})();
