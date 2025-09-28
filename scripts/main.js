// Load config & projects
(async function(){
  try {
    const cfg = await (await fetch('site.config.json')).json();
    const projects = await (await fetch('projects.json')).json();

    // Hero content
    document.title = `${cfg.name} - ${cfg.role}`;
    document.querySelector('#name').textContent = cfg.name;
    document.querySelector('#role').textContent = cfg.role;
    document.querySelector('#tagline').textContent = cfg.portfolio_tagline;
    document.querySelector('#email').setAttribute('href', `mailto:${cfg.email}`);
    document.querySelector('#resume').setAttribute('href', cfg.resume_url || '#');
    document.querySelector('#github').setAttribute('href', `https://github.com/${cfg.github}`);
    if(cfg.linkedin) document.querySelector('#linkedin').setAttribute('href', `https://www.linkedin.com/in/${cfg.linkedin}`);

    // Projects grid
    const grid = document.querySelector('#projects-grid');
    const frag = document.createDocumentFragment();
    projects.filter(p=>p.highlight).forEach(p=>{
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <h3>${p.name}</h3>
        <p class="small">${p.description}</p>
        <div>${p.tags.map(t=>`<span class='tag'>${t}</span>`).join('')}</div>
        <p style="margin-top:10px">
           <a class="btn" href="${p.link}" target="_blank" rel="noopener">Source</a>
           ${p.live?`<a class="btn" href="${p.live}" target="_blank" rel="noopener">Live</a>`:''}
        </p>`;
      frag.appendChild(card);
    });
    grid.appendChild(frag);

    // JSON-LD
    const ld = {
      "@context":"https://schema.org",
      "@type":"Person",
      "name": cfg.name,
      "jobTitle": cfg.role,
      "url": location.origin,
      "sameAs": [
        cfg.github?`https://github.com/${cfg.github}`:null,
        cfg.linkedin?`https://www.linkedin.com/in/${cfg.linkedin}`:null
      ].filter(Boolean)
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(ld);
    document.head.appendChild(script);
  } catch(e){ console.error(e); }
})();

// Theme toggle
const toggle = document.querySelector('#theme-toggle');
if (toggle) {
  toggle.addEventListener('click', ()=>{
    const current = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', current==='light'?'dark':'light');
  });
}
