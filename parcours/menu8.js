/* Left-hand menu shared by every page of step 8 (être et avoir).
   On a narrow screen it becomes a "☰ Menu" button at the top. */
(function () {
  'use strict';
  if (window.self !== window.top) return; // not inside a frame
  const MENU = [
    ['😊 Le verbe ÊTRE', [
      ['🌈', 'La classe de Lili', 'classe_lili_etre_avoir.html?verbe=etre'],
      ['❓', 'Les questions de Lili', 'etape8-etre.html']]],
    ['🎒 Le verbe AVOIR', [
      ['🌈', 'La classe de Lili', 'classe_lili_etre_avoir.html?verbe=avoir'],
      ['❓', 'Les questions de Lili', 'etape8-avoir.html']]],
    ['🎲 Les jeux', [
      ['🎲', 'Les ateliers de Lili', 'etape8.html#jeu-1'],
      ['🎣', 'La pêche aux verbes', 'etape8.html#jeu-2'],
      ['🎈', 'Les ballons', 'etape8.html#jeu-3'],
      ['🚂', 'Le train des pronoms', 'etape8.html#jeu-4'],
      ['🏰', 'Le Royaume des verbes', 'etape8.html#jeu-5'],
      ['🎯', 'Le jeu des flèches', 'etape8.html#jeu-6']]],
    ['⭐ Pour finir', [
      ['📖', 'Les petites histoires de Lili', 'etape8-reperer.html'],
      ['📝', 'Le petit devoir', 'etape8-devoir.html'],
      ['🖨️', 'Fiche à imprimer', 'fiche8.html'],
      ['🧾', 'Exercices à imprimer (6 feuilles)', 'exercices8.html']]]
  ];
  const ici = () => {
    const page = location.pathname.split('/').pop() || 'etape8.html';
    const q = new URLSearchParams(location.search).get('verbe');
    return page + (q ? '?verbe=' + q : '') + (page === 'etape8.html' && /^#jeu-\d$/.test(location.hash) ? location.hash : '');
  };
  const css = `
  .menu8{position:fixed;left:0;top:0;bottom:0;width:250px;overflow-y:auto;background:#3d2a73;color:#fff;padding:14px 10px 20px;z-index:200;font-family:system-ui,'Segoe UI',sans-serif}
  .menu8 .m8-titre{display:block;color:#fff;text-decoration:none;font-weight:900;font-size:19px;padding:6px 8px 12px}
  .menu8 .m8-groupe{font-size:14px;font-weight:900;color:#e7dcff;text-transform:uppercase;letter-spacing:.5px;margin:14px 8px 6px}
  .menu8 a.m8-item{display:flex;gap:10px;align-items:center;color:#fff;text-decoration:none;font-size:17px;font-weight:700;padding:10px 10px;border-radius:12px;margin:2px 0}
  .menu8 a.m8-item:hover{background:#ffffff1f}
  .menu8 a.m8-item[aria-current="page"],.menu8 a.m8-item[aria-current="step"]{background:#ffda70;color:#2f2160}.menu8 .m8-num{font-size:13px;opacity:.8;width:22px;flex:none}
  .menu8 .m8-emo{font-size:22px;width:28px;text-align:center}
  .menu8 .m8-bas{margin-top:18px;border-top:1px solid #ffffff33;padding-top:10px}
  .menu8-bouton{display:none}
  body.avec-menu8{padding-left:250px}
  @media(max-width:900px){
    body.avec-menu8{padding-left:0;padding-top:58px}
    .menu8{padding-top:64px;width:min(300px,86vw);transform:translateX(-105%);transition:transform .2s;box-shadow:6px 0 24px #0005}
    .menu8.ouvert{transform:none}
    .menu8-bouton{display:block;position:fixed;top:8px;left:8px;z-index:210;border:0;border-radius:14px;background:#3d2a73;color:#fff;font:900 18px system-ui,sans-serif;padding:10px 16px;cursor:pointer;box-shadow:0 3px 10px #0003}
  }
  @media print{.menu8,.menu8-bouton{display:none!important}body.avec-menu8{padding:0}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.append(st);
  const nav = document.createElement('nav');
  nav.className = 'menu8'; nav.setAttribute('aria-label', 'Menu de l’étape 8');
  let html = '<a class="m8-titre" href="etape8.html">🌈 Étape 8 · Être et avoir</a>';
  MENU.forEach(([g, items]) => {
    html += '<div class="m8-groupe">' + g + '</div>';
    items.forEach(([e, t, h]) => { html += `<a class="m8-item" href="${h}"${/^(fiche|exercices)/.test(h) ? ' target="_blank" rel="noopener"' : ''}><span class="m8-emo" aria-hidden="true">${e}</span><span>${t}</span></a>`; });
  });
  // All the steps of the path, like on the other step pages.
  const ETAPES = [[1, '🔤', 'Les sons et les lettres'], [2, '🧩', 'Les syllabes'], [3, '🖼️', 'Les mots de tous les jours'], [4, '🔊', 'Les sons composés'],
    [5, '📝', 'La phrase'], [6, '❗', 'La ponctuation'], [7, '📚', 'Le nom et le déterminant'], [8, '🌈', 'Être et avoir'],
    [9, '🎤', 'Les verbes en -er'], [10, '🏁', 'Les verbes comme finir'], [11, '🚶', 'Le 3e groupe'], [12, '⏭️', 'Le futur proche'],
    [13, '⏮️', 'Le passé composé'], [14, '🕰️', 'L’imparfait'], [15, '🔮', 'Le futur simple'], [16, '📖', 'Lire et comprendre'], [17, '✍️', 'J’écris']];
  html += '<div class="m8-bas"><a class="m8-item" href="index.html"><span class="m8-emo" aria-hidden="true">⬅</span><span>Retour aux étapes</span></a></div>';
  nav.innerHTML = html;
  const bouton = document.createElement('button');
  bouton.type = 'button'; bouton.className = 'menu8-bouton'; bouton.textContent = '☰ Menu';
  bouton.setAttribute('aria-expanded', 'false');
  bouton.onclick = () => { const o = nav.classList.toggle('ouvert'); bouton.setAttribute('aria-expanded', String(o)); bouton.textContent = o ? '✕ Fermer' : '☰ Menu'; };
  function marquer() {
    const cur = ici();
    nav.querySelectorAll('a.m8-item:not(.m8-etape)').forEach(a => { if (a.getAttribute('href') === cur) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  }
  function installer() {
    document.body.prepend(nav); document.body.prepend(bouton); document.body.classList.add('avec-menu8'); marquer();
    nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('ouvert'); bouton.textContent = '☰ Menu'; } });
  }
  if (document.body) installer(); else document.addEventListener('DOMContentLoaded', installer);
  window.addEventListener('hashchange', marquer);
  window.MENU8_MARQUER = marquer;
})();
