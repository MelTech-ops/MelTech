if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
// ---------- Tabs ----------
const panels = [...document.querySelectorAll('.panel')];
const tabBtns = [...document.querySelectorAll('.tabs [data-tab]')];
const glow = document.querySelector('.tab-glow');

function moveGlow(btn) {
  if (!glow) return;
  if (!btn || btn.classList.contains('tab-cta')) { glow.style.opacity = 0; return; }
  glow.style.opacity = 1;
  glow.style.left = btn.offsetLeft + 14 + 'px';
  glow.style.width = btn.offsetWidth - 28 + 'px';
}

function showTab(id, push = true) {
  if (!document.getElementById('p-' + id)) id = 'home';
  panels.forEach((p) => {
    const on = p.id === 'p-' + id;
    p.hidden = !on;
    p.classList.toggle('enter', on);
  });
  tabBtns.forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === id));
  const active = tabBtns.find((b) => b.dataset.tab === id);
  moveGlow(active);
  const bar = document.querySelector('.tabs');
  if (active && bar.scrollWidth > bar.clientWidth) bar.scrollLeft = active.offsetLeft - (bar.clientWidth - active.offsetWidth) / 2;
  if (push) history.replaceState(null, '', '#' + id);
  window.scrollTo(0, 0);
  requestAnimationFrame(() => window.scrollTo(0, 0));
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-tab]');
  if (!t) return;
  e.preventDefault();
  showTab(t.dataset.tab);
  if (t.dataset.svc) showSvc(t.dataset.svc);
});
window.addEventListener('hashchange', () => showTab(location.hash.slice(1), false));
window.addEventListener('resize', () => moveGlow(tabBtns.find((b) => b.getAttribute('aria-selected') === 'true')));

// ---------- Services picker ----------
const svcBtns = [...document.querySelectorAll('.svc-btn')];
const svcCards = [...document.querySelectorAll('.svc-card')];
function showSvc(id) {
  svcBtns.forEach((b) => b.setAttribute('aria-selected', b.dataset.svc === id));
  svcCards.forEach((c) => { c.hidden = c.dataset.svc !== id; });
}
svcBtns.forEach((b) => b.addEventListener('click', () => showSvc(b.dataset.svc)));
showSvc('wifi');

// ---------- Icon placeholders (gallery + feed) ----------
document.querySelectorAll('.ph[data-icon]').forEach((el) => {
  el.style.setProperty('--i', `url(assets/icons/${el.dataset.icon}.png)`);
});

// ---------- Social feed scroller ----------
// To use real photos, add them to assets/work/ and list them here as { img: 'assets/work/NAME.jpg', t: 'Caption' }
const FEED = [
  { i: 'cameras', t: '32-camera NVR overhaul' },
  { i: 'wifi', t: 'Venue Wi-Fi upgrade' },
  { i: 'managed-it', t: 'Rack rebuild & cleanup' },
  { i: 'tools', t: 'Low-voltage build-out' },
  { i: 'cybersecurity', t: 'Firewall & secure Wi-Fi' },
  { i: 'cameras', t: 'Ring camera system' },
  { i: 'wifi', t: 'Network rack & cabling' },
  { i: 'tools', t: 'POS network setup' },
];
const track = document.getElementById('feedTrack');
if (track) {
  const card = (p) => p.img
    ? `<div class="post"><img src="${p.img}" alt="${p.t}" loading="lazy"><b>${p.t}</b></div>`
    : `<div class="post"><div class="ph" style="--i:url(assets/icons/${p.i}.png)"></div><b>${p.t.replace(/&/g, '&amp;')}</b></div>`;
  const html = FEED.map(card).join('');
  track.innerHTML = html + html;
}

// ---------- Starfield ----------
const cv = document.getElementById('stars');
if (cv) {
  const ctx = cv.getContext('2d');
  let stars = [];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size() {
    const d = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * d; cv.height = innerHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    stars = Array.from({ length: Math.round(innerWidth * innerHeight / 5200) }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      r: Math.random() * 1.1 + 0.2, a: Math.random(), s: Math.random() * 0.012 + 0.003,
      v: Math.random() * 0.06 + 0.01, p: Math.random() < 0.12,
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const s of stars) {
      s.a += s.s; s.y += still ? 0 : s.v;
      if (s.y > innerHeight) s.y = 0;
      const o = 0.35 + Math.abs(Math.sin(s.a)) * 0.65;
      ctx.fillStyle = s.p ? `rgba(220,170,255,${o})` : `rgba(220,240,255,${o})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
    }
    if (!still) requestAnimationFrame(draw);
  }
  size(); draw();
  addEventListener('resize', () => { size(); if (still) draw(); });
}

// ---------- Footer year ----------
const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();

// ---------- Formspree lead form ----------
const form = document.getElementById('lead');
if (form) {
  const note = form.querySelector('.form-note');
  const btn = form.querySelector('button[type=submit]');
  const label = btn.innerHTML;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true; btn.textContent = 'Sending…';
    note.className = 'form-note'; note.textContent = '';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error();
      form.reset();
      note.classList.add('ok');
      note.textContent = "Thank you! Your request is in. We'll be in touch soon.";
    } catch {
      note.classList.add('err');
      note.textContent = 'Something went wrong. Please email mel@meltechindustries.com.';
    }
    btn.disabled = false; btn.innerHTML = label;
  });
}

showTab(location.hash.slice(1) || 'home', false);
addEventListener('load', () => window.scrollTo(0, 0));
