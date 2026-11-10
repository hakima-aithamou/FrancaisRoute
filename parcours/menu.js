/* Left-hand menu of the 17-step path (every step page except step 8, which has menu8.js):
   the parts of this step, then all the steps with their stars. On a narrow screen: a "☰ Menu" button. */
(function () {
  'use strict';
  if (window.self !== window.top) return;
  const E = window.ETAPE || {};
  const ETAPES = [[1, '🔤', 'Les sons et les lettres'], [2, '🧩', 'Les syllabes'], [3, '🖼️', 'Les mots de tous les jours'], [4, '🔊', 'Les sons composés'],
    [5, '📝', 'La phrase'], [6, '❗', 'La ponctuation'], [7, '📚', 'Le nom et le déterminant'], [8, '🌈', 'Être et avoir'],
    [9, '🎤', 'Les verbes en -er'], [10, '🏁', 'Les verbes comme finir'], [11, '🚶', 'Le 3e groupe'], [12, '⏭️', 'Le futur proche'],
    [13, '⏮️', 'Le passé composé'], [14, '🕰️', 'L’imparfait'], [15, '🔮', 'Le futur simple'], [16, '📖', 'Lire et comprendre'], [17, '✍️', 'J’écris']];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let etoiles = {};
  try { etoiles = JSON.parse(localStorage.getItem('fr17_etoiles') || '{}') || {}; } catch (e) { etoiles = {}; }
  const css = `
  .menup{position:fixed;left:0;top:0;bottom:0;width:260px;overflow-y:auto;background:#0d5c45;color:#fff;padding:14px 10px 20px;z-index:200;font-family:system-ui,'Segoe UI',sans-serif}
  .menup .mp-titre{display:block;color:#fff;font-weight:900;font-size:19px;padding:6px 8px 10px;line-height:1.3}
  .menup .mp-groupe{font-size:14px;font-weight:900;color:#cdeee0;text-transform:uppercase;letter-spacing:.5px;margin:14px 8px 6px}
  .menup .mp-item{display:flex;gap:10px;align-items:center;width:100%;border:0;background:none;color:#fff;text-decoration:none;font:700 17px system-ui,'Segoe UI',sans-serif;padding:10px;border-radius:12px;margin:2px 0;cursor:pointer;text-align:left}
  .menup .mp-item:hover{background:#ffffff1f}
  .menup .mp-item[aria-current="page"],.menup .mp-item[aria-current="step"]{background:#ffda70;color:#173b39}
  .menup .mp-emo{font-size:21px;width:28px;text-align:center;flex:none}
  .menup .mp-num{font-size:13px;opacity:.8;width:22px;flex:none}
  .menup .mp-et{margin-left:auto;font-size:11px;letter-spacing:-1px;white-space:nowrap}
  .menup .mp-bas{margin-top:18px;border-top:1px solid #ffffff33;padding-top:10px}
  .menup-bouton{display:none}
  body.avec-menup{padding-left:260px}
  body.avec-menup .pr-onglets{display:none}
  @media(max-width:900px){
    body.avec-menup{padding-left:0;padding-top:58px}
    .menup{padding-top:64px;width:min(300px,86vw);transform:translateX(-105%);transition:transform .2s;box-shadow:6px 0 24px #0005}
    .menup.ouvert{transform:none}
    .menup-bouton{display:block;position:fixed;top:8px;left:8px;z-index:210;border:0;border-radius:14px;background:#0d5c45;color:#fff;font:900 18px system-ui,sans-serif;padding:10px 16px;cursor:pointer;box-shadow:0 3px 10px #0003}
  }
  @media print{.menup,.menup-bouton{display:none!important}body.avec-menup{padding:0}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.append(st);
  const nav = document.createElement('nav');
  nav.className = 'menup'; nav.setAttribute('aria-label', 'Menu du parcours');
  const etoile = n => { const e = (etoiles[n] || {}).etoiles || 0; return e ? '⭐'.repeat(e) : ''; };
  let h = `<span class="mp-titre">${esc(E.emoji || '📚')} Étape ${E.n} · ${esc(E.titre || '')}</span><div class="mp-groupe">Cette étape</div>`;
  h += '<button type="button" class="mp-item" data-partie="lecon"><span class="mp-emo">📖</span><span>La leçon</span></button>';
  h += '<button type="button" class="mp-item" data-partie="exo"><span class="mp-emo">✏️</span><span>Je m’entraîne</span></button>';
  h += '<button type="button" class="mp-item" data-partie="devoir"><span class="mp-emo">📝</span><span>Le petit devoir</span></button>';
  h += `<a class="mp-item" href="exercices${E.n}.html" target="_blank" rel="noopener"><span class="mp-emo">🧾</span><span>Exercices à imprimer</span></a>`;
  if (E.fiche) h += `<a class="mp-item" href="${esc(E.fiche)}" target="_blank" rel="noopener"><span class="mp-emo">🖨️</span><span>Fiche à imprimer</span></a>`;
  h += '<div class="mp-bas"><a class="mp-item" href="index.html"><span class="mp-emo" aria-hidden="true">⬅</span><span>Retour aux étapes</span></a></div>';
  nav.innerHTML = h;
  const bouton = document.createElement('button');
  bouton.type = 'button'; bouton.className = 'menup-bouton'; bouton.textContent = '☰ Menu'; bouton.setAttribute('aria-expanded', 'false');
  const fermer = () => { nav.classList.remove('ouvert'); bouton.textContent = '☰ Menu'; bouton.setAttribute('aria-expanded', 'false'); };
  bouton.onclick = () => { const o = nav.classList.toggle('ouvert'); bouton.textContent = o ? '✕ Fermer' : '☰ Menu'; bouton.setAttribute('aria-expanded', String(o)); };
  nav.addEventListener('click', e => {
    const b = e.target.closest('[data-partie]');
    if (b && window.FR17 && window.FR17.aller) window.FR17.aller(b.dataset.partie);
    if (e.target.closest('.mp-item')) fermer();
  });
  window.addEventListener('fr17-partie', e => nav.querySelectorAll('[data-partie]').forEach(b => { if (b.dataset.partie === e.detail) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); }));
  document.body.prepend(nav); document.body.prepend(bouton); document.body.classList.add('avec-menup');
  if (window.FR17 && window.FR17.partie) window.dispatchEvent(new CustomEvent('fr17-partie', { detail: window.FR17.partie }));
})();
