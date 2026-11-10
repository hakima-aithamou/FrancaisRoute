/* Shared voice for the step 8 games: reads a text aloud in French (only after a click).
   window.LIRE(text) speaks; window.BOUTON_ECOUTE(getText) returns a 🔊 button. */
(function () {
  'use strict';
  function nettoyer(t) {
    return String(t || '')
      .replace(/_{2,}|\?(?=\s*[\p{L}])/gu, ' … ')          // the blank to fill
      .replace(/[\u{1F300}-\u{1FAFF}☀-➿️]/gu, '') // emoji
      .replace(/\s+/g, ' ').replace(/\s+([.!?,])/g, '$1').replace(/([!?])\./g, '$1').trim();
  }
  function voixCoupee() { try { return localStorage.getItem('fr17_voix') === 'off'; } catch (e) { return false; } }
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
  window.GLISSER = GLISSER;
  window.LIRE = function (t, force) {
    if (!('speechSynthesis' in window) || (!force && voixCoupee())) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(nettoyer(t));
      u.lang = 'fr-CA'; u.rate = .8;
      speechSynthesis.speak(u);
    } catch (e) { /* voice unavailable */ }
  };
  window.BOUTON_ECOUTE = function (getText, cls) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = cls || 'ecoute'; b.textContent = '🔊 Écouter';
    b.setAttribute('aria-label', 'Écouter');
    b.onclick = () => window.LIRE(typeof getText === 'function' ? getText() : getText, true);
    return b;
  };
})();
