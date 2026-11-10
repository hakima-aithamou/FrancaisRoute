/* Engine of the 17-step French path.
   Each step page defines window.ETAPE = { n, titre, emoji, lecons, exercices, devoir, note }
   and loads this file. Item types: 'choix' (default), 'ordre', 'ecrire', 'rediger'. */
(function () {
  'use strict';
  const E = window.ETAPE;
  const TOTAL = 17, CLE = 'fr17_etoiles';
  const $ = id => document.getElementById(id);
  const lire = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } };

  // ---------- Progress ----------
  function progres() { try { return JSON.parse(lire(CLE) || '{}') || {}; } catch (e) { return {}; } }
  function garder(n, score, total) {
    const p = progres(), pc = total ? score / total : 1;
    const etoiles = pc >= .9 ? 3 : pc >= .7 ? 2 : 1;
    const avant = p[n] || { etoiles: 0 };
    if (etoiles >= avant.etoiles) p[n] = { etoiles, score, total };
    ecrire(CLE, JSON.stringify(p));
    return etoiles;
  }
  window.FR17 = { progres, garder };
  if (!E) return; // home page: only the progress helpers are needed

  // ---------- Voice ----------
  let voix = lire('fr17_voix') !== 'off';
  function parle(t) {
    if (!voix || !t || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(t).replace(/_{2,}/g, ', , ').replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, ''));
      u.lang = 'fr-CA'; u.rate = .8; speechSynthesis.speak(u);
    } catch (e) { }
  }

  // ---------- Helpers ----------
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Escaped text; "___" becomes a line to fill, **word** becomes bold.
  const fmt = s => esc(s).replace(/_{2,}/g, '<span class="case" aria-label="mot manquant"></span>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  function melange(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const norm = s => String(s).normalize('NFC').toLocaleLowerCase('fr').replace(/[’']/g, '\'').replace(/[.!?,;:«»"]/g, '').replace(/\s+/g, ' ').trim();
  function GLISSER(depuis, cible, mot) {
    // The chosen word slides from its button into the box of the sentence.
    if (!cible) return;
    const finir = () => { cible.textContent = mot; cible.classList.add('pleine'); };
    if (!depuis || cible.classList.contains('pleine') || matchMedia('(prefers-reduced-motion: reduce)').matches) { finir(); return; }
    const a = depuis.getBoundingClientRect(), b = cible.getBoundingClientRect();
    const g = document.createElement('span');
    g.className = 'glisse'; g.textContent = mot;
    g.style.cssText = `position:fixed;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;display:flex;align-items:center;justify-content:center;z-index:999;transition:transform .65s cubic-bezier(.3,.8,.3,1);pointer-events:none`;
    document.body.append(g);
    g.getBoundingClientRect();
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    g.style.transform = `translate(${dx}px,${dy}px) scale(.85)`;
    let fait = false;
    const fin = () => { if (fait) return; fait = true; g.remove(); finir(); };
    g.addEventListener('transitionend', fin); setTimeout(fin, 900);
  }
  function el(tag, cls, html) { const x = document.createElement(tag); if (cls) x.className = cls; if (html !== undefined) x.innerHTML = html; return x; }
  function bouton(txt, fn, cls) { const b = el('button', cls || ''); b.type = 'button'; b.textContent = txt; b.onclick = fn; return b; }

  // ---------- Page skeleton ----------
  document.title = 'FrançaisRoute — ' + E.titre;
  document.body.innerHTML = `
  <header class="pr-barre"><a href="${E.retour ? E.retour[0] : 'index.html'}">${E.retour ? esc(E.retour[1]) : '← Parcours'}</a><span class="pr-titre">📚 FrançaisRoute · ${esc(E.titre)}</span><button id="voix" type="button" aria-label="Couper ou remettre la voix"></button></header>
  <main class="pr-shell">
    <h1>${E.emoji} ${esc(E.titre)}</h1>
    <nav class="pr-onglets" aria-label="Parties de l’étape"><button type="button" data-m="lecon">📖 La leçon</button><button type="button" data-m="exo">✏️ Je m’entraîne</button><button type="button" data-m="devoir">📝 Petit devoir</button></nav>
    <div class="pr-progres" aria-hidden="true"><div id="barre"></div></div>
    <section class="pr-carte" id="carte" aria-live="polite"></section>
    ${E.note ? `<details class="pr-note"><summary>👩‍🏫 Notes pour l’enseignante</summary><p>${esc(E.note)}</p></details>` : ''}
  </main>`;
  const bv = $('voix');
  const majVoix = () => { bv.textContent = voix ? '🔊' : '🔇'; };
  majVoix();
  bv.onclick = () => { voix = !voix; ecrire('fr17_voix', voix ? 'on' : 'off'); if (!voix && 'speechSynthesis' in window) speechSynthesis.cancel(); majVoix(); };
  document.querySelectorAll('.pr-onglets button').forEach(b => { b.onclick = () => aller(b.dataset.m, 0); });

  // ---------- State ----------
  let mode = 'lecon', i = 0;
  const etat = { exo: {}, devoir: {} };       // per item: {essais, reussi, ordre}
  const liste = m => m === 'exo' ? E.exercices : E.devoir;

  function aller(m, idx) { mode = m; i = idx; if ('speechSynthesis' in window) speechSynthesis.cancel(); dessiner(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  // The left menu (menu.js) opens a part and is told which part is shown.
  window.FR17.aller = m => aller(m, 0);
  const signaler = () => { window.FR17.partie = mode.startsWith('bilan') ? (mode === 'bilan-exo' ? 'exo' : 'devoir') : mode; window.dispatchEvent(new CustomEvent('fr17-partie', { detail: window.FR17.partie })); };

  function dessiner() {
    signaler();
    document.querySelectorAll('.pr-onglets button').forEach(b => b.setAttribute('aria-current', String(b.dataset.m === mode || (mode.startsWith('bilan') && b.dataset.m === (mode === 'bilan-exo' ? 'exo' : 'devoir')))));
    const c = $('carte'); c.replaceChildren();
    const nL = E.lecons.length, nE = E.exercices.length, nD = E.devoir.length, tot = nL + nE + nD;
    const fait = mode === 'lecon' ? i + 1 : mode === 'exo' ? nL + i + 1 : mode === 'bilan-exo' ? nL + nE : mode === 'devoir' ? nL + nE + i + 1 : tot;
    $('barre').style.width = (fait / tot * 100) + '%';
    if (mode === 'lecon') return lecon(c);
    if (mode === 'bilan-exo' || mode === 'bilan') return bilan(c);
    return exercice(c);
  }

  // ---------- Lesson screens ----------
  function lecon(c) {
    const l = E.lecons[i];
    c.append(el('p', 'pr-etiquette', 'Découverte ' + (i + 1) + ' / ' + E.lecons.length + (l.titre ? ' · ' + esc(l.titre) : '')));
    if (l.img) c.append(el('span', 'pr-img', esc(l.img)));
    if (l.texte) c.append(el('div', 'pr-grand', fmt(l.texte)));
    if (l.tableau) {
      const t = el('div', 'pr-tableau');
      l.tableau.forEach(([p, f]) => {
        const m = /^(.*?)\[(.*)\]$/.exec(f); // "chant[e]" → ending shown in colour
        t.append(el('span', '', esc(p) + ' <b>' + (m ? esc(m[1]) + '<span class="fin">' + esc(m[2]) + '</span>' : esc(f)) + '</b>'));
      });
      c.append(t);
    }
    if (l.sous) c.append(el('p', 'pr-sous', fmt(l.sous)));
    const a = el('div', 'pr-actions');
    const dire = l.dire || [l.texte, l.sous].filter(Boolean).join('. ');
    if (i > 0) a.append(bouton('← Précédent', () => aller('lecon', i - 1), 'second'));
    a.append(bouton('🔊 Écouter', () => parle(dire), 'second'));
    if (E.fiche) { const f = el('a', 'second', '🖨️ Fiche à imprimer'); f.href = E.fiche; f.target = '_blank'; f.rel = 'noopener'; a.append(f); }
    a.append(bouton(i < E.lecons.length - 1 ? 'Suivant →' : 'Je m’entraîne →', () => i < E.lecons.length - 1 ? aller('lecon', i + 1) : aller('exo', 0)));
    c.append(a);
  }

  // ---------- Exercises and homework ----------
  function exercice(c) {
    const L = liste(mode), x = L[i], st = etat[mode][i] || (etat[mode][i] = { essais: 0, reussi: false, fini: false });
    const type = x.t || 'choix';
    c.append(el('p', 'pr-etiquette', (mode === 'exo' ? 'Je m’entraîne ' : 'Petit devoir ') + (i + 1) + ' / ' + L.length));
    if (x.texte) c.append(el('div', 'pr-histoire', esc(x.texte)));
    if (x.img) c.append(el('span', 'pr-img', esc(x.img)));
    if (x.consigne) c.append(el('p', 'pr-consigne', fmt(x.consigne)));
    if (x.q) c.append(el('div', 'pr-question', fmt(x.q)));
    const retour = el('div', 'pr-retour'), aide = el('p', 'pr-aide'), a = el('div', 'pr-actions');
    retour.setAttribute('role', 'status');

    const suivant = () => {
      if (i < L.length - 1) aller(mode, i + 1); else aller(mode === 'exo' ? 'bilan-exo' : 'bilan', 0);
    };
    const montrerSuivant = () => { if (!a.querySelector('.suiv')) a.append(bouton(i < L.length - 1 ? 'Suivant →' : 'Terminer ✔', suivant, 'suiv')); };
    // First try right = 1 point. After two mistakes the answer is shown.
    function juger(ok, bonneReponse, afficher) {
      if (st.fini) return;
      st.essais++;
      if (ok) { st.reussi = st.essais === 1; st.fini = true; retour.className = 'pr-retour bon'; retour.textContent = st.essais === 1 ? '⭐ Bravo !' : '👍 C’est ça !'; if (x.apres) aide.innerHTML = fmt(x.apres); montrerSuivant(); }
      else if (st.essais >= 2) { st.fini = true; retour.className = 'pr-retour non'; retour.textContent = 'La bonne réponse : ' + bonneReponse; aide.innerHTML = fmt(x.aide || ''); if (afficher) afficher(); montrerSuivant(); }
      else { retour.className = 'pr-retour non'; retour.textContent = 'Essaie encore !'; aide.innerHTML = fmt(x.aide || ''); }
    }

    if (type === 'choix') {
      st.ordre = st.ordre || melange(x.opts.map((_, k) => k));
      const zone = el('div', 'pr-choix');
      st.ordre.forEach(k => {
        const b = bouton(x.opts[k], () => {
          if (st.fini) return;
          const ok = x.opts[k] === x.a;
          b.classList.add(ok ? 'bon' : 'non');
          juger(ok, x.a, () => zone.querySelectorAll('button').forEach(z => { if (z.textContent === x.a) z.classList.add('bon'); }));
          if (st.fini) {
            zone.querySelectorAll('button').forEach(z => { z.disabled = true; });
            GLISSER([...zone.querySelectorAll('button')].find(z => z.textContent === x.a), c.querySelector('.pr-question .case'), x.a);
          }
        });
        zone.append(b);
      });
      c.append(zone);
    } else if (type === 'ordre') {
      st.ordre = st.ordre || melange(x.mots.map((_, k) => k));
      const choisis = [], phrase = el('div', 'pr-phrase'), mots = el('div', 'pr-mots');
      const redessiner = () => {
        phrase.textContent = choisis.map(k => x.mots[k]).join(' ').replace(/\s+([.!?,])/g, '$1') || ' ';
        mots.replaceChildren();
        st.ordre.forEach(k => { if (!choisis.includes(k)) mots.append(bouton(x.mots[k], () => { if (st.fini) return; choisis.push(k); redessiner(); })); });
      };
      redessiner();
      c.append(mots, phrase);
      a.append(bouton('↩ Effacer', () => { if (st.fini) return; choisis.length = 0; redessiner(); }, 'second'));
      a.append(bouton('✔ Vérifier', () => {
        if (st.fini) return;
        if (choisis.length < x.mots.length) { retour.className = 'pr-retour non'; retour.textContent = 'Utilise tous les mots.'; return; }
        const rep = choisis.map(k => x.mots[k]).join(' ').replace(/\s+([.!?,])/g, '$1');
        juger(rep === x.a, x.a, () => { phrase.textContent = x.a; });
        if (!st.fini && rep !== x.a) { choisis.length = 0; redessiner(); }
      }));
    } else if (type === 'ecrire') {
      const champ = el('input'); champ.type = 'text'; champ.autocomplete = 'off'; champ.spellcheck = false; champ.setAttribute('aria-label', 'Ta réponse');
      const ok = () => [x.a].concat(x.aussi || []).some(r => norm(r) === norm(champ.value));
      const verifier = () => { if (st.fini) return; if (!champ.value.trim()) { retour.className = 'pr-retour non'; retour.textContent = 'Écris ta réponse.'; return; } juger(ok(), x.a); if (st.fini) { champ.disabled = true; GLISSER(champ, c.querySelector('.pr-question .case'), x.a); } };
      champ.onkeydown = e => { if (e.key === 'Enter') verifier(); };
      c.append(champ);
      a.append(bouton('✔ Vérifier', verifier));
      setTimeout(() => champ.focus(), 50);
    } else if (type === 'rediger') {
      const zone = el('textarea'); zone.setAttribute('aria-label', 'Ton texte'); zone.value = st.texte || '';
      zone.oninput = () => { st.texte = zone.value; };
      const verifs = el('ul', 'pr-liste');
      c.append(zone, verifs);
      const controler = () => {
        const t = zone.value.trim(), phrases = t.split(/(?<=[.!?])\s+/).filter(p => p.trim());
        const reglesOk = [
          [phrases.length >= (x.min || 1), 'J’ai écrit ' + (x.min || 1) + ' phrase' + ((x.min || 1) > 1 ? 's' : '') + ' ou plus.'],
          [phrases.length > 0 && phrases.every(p => /^[A-ZÀÂÇÉÈÊËÎÏÔÛÙÜŸ«"]/.test(p.trim())), 'Chaque phrase commence par une majuscule.'],
          [/[.!?]$/.test(t) && phrases.every(p => /[.!?]$/.test(p.trim())), 'Chaque phrase se termine par un point (. ? !).']
        ];
        verifs.innerHTML = reglesOk.map(([v, txt]) => `<li>${v ? '✅' : '⬜'} ${esc(txt)}</li>`).join('') + (x.idees ? `<li>💡 ${esc(x.idees)}</li>` : '');
        return reglesOk.every(r => r[0]);
      };
      controler();
      a.append(bouton('✔ Vérifier mon texte', () => {
        if (!zone.value.trim()) { retour.className = 'pr-retour non'; retour.textContent = 'Écris ton texte d’abord.'; return; }
        if (controler()) { st.fini = true; st.reussi = true; retour.className = 'pr-retour bon'; retour.textContent = '⭐ Bravo ! Montre ton texte à ton enseignante.'; montrerSuivant(); }
        else { retour.className = 'pr-retour non'; retour.textContent = 'Regarde la liste et corrige ton texte.'; }
      }));
      a.append(bouton('📋 Copier', () => { try { navigator.clipboard.writeText(zone.value); retour.className = 'pr-retour bon'; retour.textContent = 'Texte copié.'; } catch (e) { zone.select(); } }, 'second'));
      a.append(bouton('🖨️ Imprimer', () => {
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write('<!doctype html><meta charset="utf-8"><title>Mon texte</title><body style="font:22px/1.6 system-ui;padding:30px"><h2>' + esc(x.consigne || 'Mon texte') + '</h2><p style="white-space:pre-line">' + esc(zone.value) + '</p><p>Nom : ________________</p>');
        w.document.close(); w.print();
      }, 'second'));
    }
    c.append(retour, aide);
    if (i > 0) a.prepend(bouton('← Précédent', () => aller(mode, i - 1), 'second'));
    a.append(bouton('🔊 Écouter', () => parle(x.dire || [x.texte, x.consigne, x.q].filter(Boolean).join('. ')), 'second'));
    if (st.fini) {
      retour.className = 'pr-retour ' + (st.reussi ? 'bon' : 'non');
      retour.textContent = st.reussi ? '⭐ Déjà réussi.' : 'La bonne réponse : ' + (x.a || '');
      c.querySelectorAll('.pr-choix button').forEach(z => { z.disabled = true; if (z.textContent === x.a) z.classList.add('bon'); });
      const cs = c.querySelector('.pr-question .case'); if (cs && x.a) { cs.textContent = x.a; cs.classList.add('pleine'); }
      montrerSuivant();
    }
    c.append(a);
  }

  // ---------- Results ----------
  function bilan(c) {
    const m = mode === 'bilan-exo' ? 'exo' : 'devoir', L = liste(m);
    const notes = L.filter(x => x.t !== 'rediger');
    const score = L.filter((x, k) => x.t !== 'rediger' && etat[m][k] && etat[m][k].reussi).length;
    const faits = L.filter((x, k) => etat[m][k] && etat[m][k].fini).length;
    let etoiles = 0;
    if (m === 'devoir' && faits === L.length) etoiles = garder(E.cle || E.n, score, notes.length);
    c.append(el('div', 'pr-etoiles', m === 'devoir' && etoiles ? '⭐'.repeat(etoiles) + '<span class="vide">' + '⭐'.repeat(3 - etoiles) + '</span>' : '🌟'));
    c.append(el('p', 'pr-texte', m === 'exo' ? 'Tu as terminé l’entraînement !' : faits === L.length ? 'Petit devoir terminé !' : 'Il reste des questions sans réponse.'));
    if (notes.length) c.append(el('p', 'pr-texte', '<b>' + score + ' / ' + notes.length + '</b> du premier coup.'));
    const a = el('div', 'pr-actions');
    a.append(bouton('🔁 Recommencer', () => { etat[m] = {}; aller(m, 0); }, 'second'));
    if (m === 'exo') a.append(bouton('📝 Petit devoir →', () => aller('devoir', 0)));
    else if (E.suite) { const l = el('a', '', E.suite[1]); l.href = E.suite[0]; a.append(l); }
    else if (E.n < TOTAL) { const l = el('a', '', 'Activité suivante →'); l.href = 'etape' + (E.n + 1) + '.html'; a.append(l); }
    else { const sup = el('a', '', '🎓 Niveau supérieur : Cours de français →'); sup.href = '../francais/cours.html'; a.append(sup); }
    if (m === 'devoir') { const ex = el('a', 'second', '🧾 Exercices à imprimer'); ex.href = 'exercices' + E.n + '.html'; ex.target = '_blank'; ex.rel = 'noopener'; a.append(ex); }
    // Way back to the list of all the steps.
    const tout = el('a', 'second', '⬅ Retour au parcours'); tout.href = 'index.html'; a.append(tout);
    c.append(a);
  }

  const depart = new URLSearchParams(location.search).get('partie');
  aller(['exo', 'devoir'].includes(depart) ? depart : 'lecon', 0);
})();
