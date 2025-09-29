// Enhanced site loader: config, projects, experiences, interactions
async function loadJSON(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function el(tag, cls, html){ const e = document.createElement(tag); if(cls) e.className = cls; if(html) e.innerHTML = html; return e; }

async function init(){
  try{
    const [cfg, projects, experiences] = await Promise.all([
      loadJSON('site.config.json'),
      loadJSON('projects.json'),
      loadJSON('experiences.json').catch(()=>[])
    ]);

    // Basic hero wiring (guard elements that may not exist)
    document.title = `${cfg.name} - ${cfg.role}`;
    const nameEl = document.querySelector('#name'); if(nameEl) nameEl.textContent = cfg.name;
    const roleEl = document.querySelector('#role'); if(roleEl) roleEl.textContent = cfg.role;
    const tagEl = document.querySelector('#tagline'); if(tagEl) tagEl.textContent = cfg.portfolio_tagline;
    const emailEl = document.querySelector('#email'); if(emailEl) emailEl.setAttribute('href', `mailto:${cfg.email}`);
    const email2El = document.querySelector('#email2'); if(email2El) email2El.setAttribute('href', `mailto:${cfg.email}`);
    const resumeEl = document.querySelector('#resume'); if(resumeEl) resumeEl.setAttribute('href', cfg.resume_url || '#');
    const githubEl = document.querySelector('#github'); if(githubEl) githubEl.setAttribute('href', cfg.github && cfg.github.startsWith('http') ? cfg.github : `https://github.com/${cfg.github}`);
    const github2El = document.querySelector('#github2'); if(github2El) github2El.setAttribute('href', cfg.github && cfg.github.startsWith('http') ? cfg.github : `https://github.com/${cfg.github}`);
    if(cfg.linkedin) {
      const lnUrl = cfg.linkedin.startsWith('http') ? cfg.linkedin : `https://www.linkedin.com/in/${cfg.linkedin}`;
      const ln = document.querySelector('#linkedin'); if(ln) ln.setAttribute('href', lnUrl);
      const ln2 = document.querySelector('#linkedin2'); if(ln2) ln2.setAttribute('href', lnUrl);
    }

    // Skill chips (inferred from projects tag frequency)
    const skillCounts = {};
    projects.forEach(p=> (p.tags||[]).forEach(t=> skillCounts[t] = (skillCounts[t]||0)+1));
    const skills = Object.entries(skillCounts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(s=>s[0]);
    const chips = document.querySelector('#skill-chips');
    skills.forEach(s=> chips.appendChild(el('span','skill',s)));

    // Render projects & filters
    const grid = document.querySelector('#projects-grid');
    const filtersEl = document.querySelector('#project-filters');
    // Use the static filter buttons present in HTML (All / Web Applications / Data Science)
    filtersEl.addEventListener('click', e=>{
      const btn = e.target.closest('button'); if(!btn) return;
      [...filtersEl.querySelectorAll('.chip')].forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter || 'all';
      renderProjects(projects, f==='all'?null:f);
    });
    // default render: show all
    renderProjects(projects, null);

    // Experiences
    renderExperiences(experiences || []);

    // Small UX: reveal on scroll
    const observer = new IntersectionObserver(entries=>{
      entries.forEach(en=>{ if(en.isIntersecting) en.target.classList.add('visible'); });
    }, {threshold:0.12});
    document.querySelectorAll('.reveal').forEach(n=>observer.observe(n));

    // Theme toggle with persistence
    const toggle = document.querySelector('#theme-toggle');
    const stored = localStorage.getItem('theme');
    if(stored) document.documentElement.setAttribute('data-theme', stored);
    toggle && toggle.addEventListener('click', ()=>{
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });

  }catch(err){ console.error('Init error', err); }
}

function renderProjects(projects, filter){
  const grid = document.querySelector('#projects-grid');
  grid.innerHTML = '';
  const frag = document.createDocumentFragment();
  const normFilter = filter && typeof filter === 'string' ? filter.trim().toLowerCase() : null;
  projects.filter(p=> p.highlight !== false).filter(p=>{
    if(!normFilter) return true; // show all
    if(normFilter === 'all') return true;
    // match category (case-insensitive)
    if(p.category && String(p.category).toLowerCase() === normFilter) return true;
    // match any tag (case-insensitive)
    if(Array.isArray(p.tags) && p.tags.some(t=> String(t).toLowerCase() === normFilter)) return true;
    // fallback: match name
    if(p.name && String(p.name).toLowerCase().includes(normFilter)) return true;
    return false;
  }).forEach(p=>{
    const card = el('article','card reveal project-card', '');
    card.innerHTML = `
      ${p.image ? `<div class="project-image"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>` : ''}
      <div class="project-content">
        <h3>${p.name}</h3>
        <p class="small">${p.description}</p>
        <div class="tags">${(p.tags||[]).map(t=>`<span class='tag'>${t}</span>`).join('')}</div>
        <div class="project-links">
          ${p.github ? `<a class="btn" href="${p.github}" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"></path></svg> GitHub</a>` : ''}
          ${p.live ? `<a class="btn primary" href="${p.live}" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> Live Demo</a>` : ''}
        </div>
      </div>`;
    card.querySelector('[data-action=open]')?.addEventListener('click', ()=>openProjectModal(p));
    // clicking the card (outside buttons/links) should open the project's GitHub if available
    card.addEventListener('click', (e)=>{
      // ignore clicks on interactive elements
      if(e.target.closest('a') || e.target.closest('button')) return;
      if(p.github){ window.open(p.github, '_blank', 'noopener'); }
    });
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

function openProjectModal(p){
  const modal = document.getElementById('project-modal');
  const body = document.getElementById('modal-body');
  body.innerHTML = `
    ${p.image ? `<div class="project-image-full"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>` : ''}
    <h2>${p.name}</h2>
    <p class="small">${p.description}</p>
    <div class="tags">${(p.tags||[]).map(t=>`<span class='tag'>${t}</span>`).join('')}</div>
    <div style="margin-top:12px">${p.details || ''}</div>
    <p style="margin-top:12px">
      ${p.github?`<a class="btn" href="${p.github}" target="_blank" rel="noopener">Source</a>`:''}
      ${p.live?`<a class="btn" href="${p.live}" target="_blank" rel="noopener">Live</a>`:''}
    </p>`;
  modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', e=>{ if(e.target === modal) closeModal(); });
}

function closeModal(){ const m = document.getElementById('project-modal'); m.classList.add('hidden'); m.setAttribute('aria-hidden','true'); }

function renderExperiences(list){
  const grid = document.getElementById('experience-grid');
  if(!grid) return;
  grid.innerHTML = '';
  list.forEach(exp=>{
    const card = el('article','card reveal');
    card.innerHTML = `
      <h3>${exp.title} — ${exp.company}</h3>
      <p class="small">${exp.range} — <span class="muted">${exp.location||''}</span></p>
      <div style="margin-top:8px">${exp.summary}</div>
      ${exp.bullets?`<ul style="margin-top:10px">${exp.bullets.map(b=>`<li>${b}</li>`).join('')}</ul>`:''}
    `;
    grid.appendChild(card);
  });
}

init();
