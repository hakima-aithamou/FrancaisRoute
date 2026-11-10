/* 🖨️ The word printing shop: letters, syllables, sentences, determiners, agreement, homophones. */
(function () {
const A = Atelier.api, { node, hasard, pioche, melange } = A;
const MOTS = [['🐱', 'chat'], ['🌙', 'lune'], ['🚲', 'vélo'], ['🍎', 'pomme'], ['📖', 'livre'], ['🌳', 'arbre'], ['🏠', 'maison'], ['☀️', 'soleil'], ['🌸', 'fleur'], ['🐟', 'poisson'], ['🐸', 'grenouille'], ['🎈', 'ballon'], ['🦊', 'renard'], ['🍞', 'pain'], ['🐮', 'vache'], ['🚗', 'auto']];
const SYLL = [['⛵', ['ba', 'teau']], ['🐰', ['la', 'pin']], ['🍅', ['to', 'ma', 'te']], ['🦒', ['gi', 'ra', 'fe']], ['🎩', ['cha', 'peau']], ['🦋', ['pa', 'pil', 'lon']], ['🐊', ['cro', 'co', 'di', 'le']], ['🐘', ['é', 'lé', 'phant']], ['🍌', ['ba', 'na', 'ne']], ['🥕', ['ca', 'rot', 'te']], ['🐢', ['tor', 'tue']], ['🚂', ['lo', 'co', 'mo', 'ti', 've']], ['🍫', ['cho', 'co', 'lat']], ['🧸', ['nou', 'nours']]];
const PHRASES = ['Le chat dort sur le lit.', 'Ma sœur mange une pomme.', 'Nous jouons au ballon.', 'Le chien court dans le parc.', 'Papa lit un livre.', 'Les oiseaux chantent le matin.', 'Je vais à l’école en autobus.', 'La neige tombe sur la ville.', 'Mon ami porte un chandail rouge.', 'Le soleil brille dans le ciel.'];
/* noun, gender (m/f), emoji, starts with a vowel */
const NOMS = [['pomme', 'f', '🍎'], ['ballon', 'm', '🎈'], ['fleur', 'f', '🌸'], ['livre', 'm', '📖'], ['maison', 'f', '🏠'], ['vélo', 'm', '🚲'], ['lune', 'f', '🌙'], ['chapeau', 'm', '🎩'], ['tortue', 'f', '🐢'], ['crayon', 'm', '✏️'], ['banane', 'f', '🍌'], ['camion', 'm', '🚚'], ['étoile', 'f', '⭐', 1], ['arbre', 'm', '🌳', 1], ['orange', 'f', '🍊', 1], ['avion', 'm', '✈️', 1]];
const ACCORDS = [ // [start, [m.s, f.s, m.p, f.p], end, expected form, reason]
  ['les', 'chiens', 'petit', 'm', 'p'], ['une', 'robe', 'vert', 'f', 's'], ['des', 'fleurs', 'jaune', 'f', 'p', 'jaunes'], ['un', 'chat', 'noir', 'm', 's'], ['les', 'souris', 'gris', 'f', 'p', 'grises', 'grises'],
  ['deux', 'ballons', 'rouge', 'm', 'p', 'rouges'], ['la', 'lune', 'rond', 'f', 's'], ['mes', 'amies', 'content', 'f', 'p'], ['des', 'gâteaux', 'délicieux', 'm', 'p', 'délicieux'], ['une', 'grande', null, 'f', 's']];
const formes = a => { const b = a[2]; if (a[1] === 'souris') return ['gris', 'grise', 'gris', 'grises']; if (b === 'délicieux') return ['délicieux', 'délicieuse', 'délicieux', 'délicieuses']; if (/e$/.test(b)) return [b, b, b + 's', b + 's']; return [b, b + 'e', b + 's', b + 'es']; };
const HOMO = [
  ['a', 'à', [['Léa ', ' un chat.', 0], ['Il va ', ' la piscine.', 1], ['Mon frère ', ' huit ans.', 0], ['Je joue ', ' la balle.', 1], ['Sami ', ' faim.', 0], ['Nous allons ', ' Ottawa.', 1]], 'On peut remplacer « a » par « avait » : Léa avait un chat. Avec « à », ça ne marche pas.'],
  ['et', 'est', [['Le chat ', ' noir.', 1], ['J’ai un crayon ', ' une gomme.', 0], ['Maman ', ' contente.', 1], ['Il mange du pain ', ' du fromage.', 0], ['La soupe ', ' chaude.', 1], ['Léa ', ' Noah jouent.', 0]], 'On peut remplacer « est » par « était ». « Et » veut dire « et puis ».'],
  ['son', 'sont', [['Ils ', ' gentils.', 1], ['Sami lave ', ' vélo.', 0], ['Les pommes ', ' rouges.', 1], ['Léa range ', ' sac.', 0], ['Mes amis ', ' ici.', 1], ['Il mange ', ' dîner.', 0]], 'On peut remplacer « sont » par « étaient ». « Son » veut dire « le sien ».'],
  ['on', 'ont', [['Les enfants ', ' faim.', 1], [' va au parc.', '', 0, 1], ['Mes parents ', ' une auto.', 1], ['Demain, ', ' joue dehors.', 0], ['Ils ', ' gagné !', 1], ['Ce soir, ', ' mange des pâtes.', 0]], 'On peut remplacer « ont » par « avaient ». « On » peut être remplacé par « il ».']];
const rang = (items, api) => api.ordre(items);
const pl = n => n + (/(eau|au)$/.test(n) ? 'x' : 's');
const niveaux = [
  { titre: 'Imprimer un mot', description: 'Remets les lettres dans l’ordre.', manche(api) {
    const [e, m] = pioche(MOTS), L = [...m], items = melange(L.map(t => ({ t }))), o = (() => { const z = node('p', 'image-mot', e); api.zone().append(z); return rang(items, api); })();
    return { consigne: 'Imprime le mot de l’image : touche les lettres dans le bon ordre.', oral: 'Imprime le mot ' + m + '.', indice: 'Dis le mot lentement. Il commence par la lettre « ' + m[0] + ' » et finit par « ' + m[m.length - 1] + ' ».', explication: 'Le mot est « ' + m + ' ».',
      verifier() { if (!o.complet()) return { manque: 'Place toutes les lettres.' }; return o.valeur().map(i => items[i].t).join('') === m; },
      montrer() { const pris = new Set(); o.montrer(L.map(c => { const i = items.findIndex((it, j) => it.t === c && !pris.has(j)); pris.add(i); return i; })); } }; } },
  { titre: 'Les syllabes', description: 'Assemble les morceaux du mot.', manche(api) {
    const [e, S] = pioche(SYLL), m = S.join(''), items = melange(S.map(t => ({ t }))); api.zone().append(node('p', 'image-mot', e)); const o = rang(items, api);
    return { consigne: 'Assemble les syllabes pour écrire le mot de l’image.', oral: 'Assemble les syllabes du mot ' + m + '.', indice: 'Tape dans tes mains pour chaque syllabe : ' + S.join(' - ') + '.', explication: S.join(' - ') + ' : « ' + m + ' ».',
      verifier() { if (!o.complet()) return { manque: 'Place toutes les syllabes.' }; return o.valeur().map(i => items[i].t).join('') === m; },
      montrer() { const pris = new Set(); o.montrer(S.map(c => { const i = items.findIndex((it, j) => it.t === c && !pris.has(j)); pris.add(i); return i; })); } }; } },
  { titre: 'Imprimer une phrase', description: 'Remets les mots dans l’ordre.', manche(api) {
    const p = pioche(PHRASES), M = p.split(' '), items = melange(M.map(t => ({ t }))), o = rang(items, api);
    return { consigne: 'Remets les mots dans l’ordre pour faire une phrase.', oral: 'Remets les mots dans l’ordre pour faire une phrase.', indice: 'La phrase commence par une majuscule (' + M[0] + ') et finit par un point.', explication: '« ' + p + ' »',
      verifier() { if (!o.complet()) return { manque: 'Place tous les mots.' }; return o.valeur().map(i => items[i].t).join(' ') === p; },
      montrer() { const pris = new Set(); o.montrer(M.map(c => { const i = items.findIndex((it, j) => it.t === c && !pris.has(j)); pris.add(i); return i; })); } }; } },
  { titre: 'Le bon petit mot', description: 'le, la, l’, un, une, les', manche(api, k) {
    const [n0, g, e, voy] = pioche(NOMS), defini = k % 2 === 0, plur = defini && k % 3 === 2;
    const n = plur ? pl(n0) : n0, bon = plur ? 'les' : defini ? (voy ? 'l’' : g === 'm' ? 'le' : 'la') : (g === 'm' ? 'un' : 'une');
    const opts = plur ? ['le', 'la', 'les'] : defini ? (voy ? ['le', 'la', 'l’'] : ['le', 'la', 'les']) : ['un', 'une', 'des'], z = node('div', 'zone');
    z.append(node('p', 'image-mot', plur ? e + e + e : e), node('p', 'grand-texte', '___ ' + n)); api.zone().append(z); const f = api.choix(opts);
    return { consigne: 'Quel petit mot va devant « ' + n + ' » ?', indice: plur ? 'Il y en a plusieurs : regarde la lettre muette à la fin du mot.' : voy ? 'Le mot commence par une voyelle : on écrit l’ avec une apostrophe.' : 'Dis-le à voix haute : « ' + (g === 'm' ? 'un' : 'une') + ' ' + n0 + ' ». Est-ce masculin ou féminin ?', explication: '« ' + bon + (bon === 'l’' ? '' : ' ') + n + ' »',
      verifier: () => f() === null ? { manque: 'Choisis un mot.' } : opts[f()] === bon, montrer() { f.boutons()[opts.indexOf(bon)].classList.add('bonne'); } }; } },
  { titre: 'Les accords', description: 'Masculin, féminin, singulier, pluriel.', manche(api) {
    const a = pioche(ACCORDS.filter(x => x[2])), F = formes(a), idx = (a[3] === 'f' ? 1 : 0) + (a[4] === 'p' ? 2 : 0), bon = F[idx], opts = [...new Set(F)], z = node('div', 'zone');
    z.append(node('p', 'grand-texte', a[0] + ' ' + a[1] + ' ___')); api.zone().append(z); const f = api.choix(opts);
    const raison = (a[4] === 'p' ? 'pluriel' : 'singulier') + ' et ' + (a[3] === 'f' ? 'féminin' : 'masculin');
    return { consigne: 'Choisis la bonne façon d’écrire le mot pour compléter : « ' + a[0] + ' ' + a[1] + ' … »', indice: '« ' + a[1] + ' » est ' + raison + '. Le mot qui le décrit s’accorde avec lui.', explication: '« ' + a[0] + ' ' + a[1] + ' ' + bon + ' » : ' + raison + '.',
      verifier: () => f() === null ? { manque: 'Choisis une réponse.' } : opts[f()] === bon, montrer() { f.boutons()[opts.indexOf(bon)].classList.add('bonne'); } }; } },
  { titre: 'Les homophones', description: 'a/à, et/est, son/sont, on/ont', manche(api, k) {
    const [m1, m2, P, truc] = HOMO[k % 4], [av, ap, b, debut] = pioche(P), bon = b ? m2 : m1, phr = debut ? '___' + av : av + '___' + ap, z = node('div', 'zone');
    z.append(node('p', 'grand-texte', phr)); api.zone().append(z); const opts = [m1, m2], f = api.choix(opts);
    const vrai = debut ? (bon[0].toUpperCase() + bon.slice(1)) + av : av + bon + ap;
    return { consigne: 'Complète la phrase avec « ' + m1 + ' » ou « ' + m2 + ' ».', oral: 'Complète la phrase avec ' + m1 + ' ou ' + m2 + '.', indice: truc, explication: '« ' + vrai + ' »',
      verifier: () => f() === null ? { manque: 'Choisis un mot.' } : opts[f()] === bon, montrer() { f.boutons()[opts.indexOf(bon)].classList.add('bonne'); } }; } }];
Atelier.definir({ id: 'imprimerie', titre: 'L’imprimerie des mots', icone: '🖨️', couleur: '#8e3b8e', intro: 'Bienvenue à l’imprimerie ! Place les lettres et les syllabes pour imprimer des mots, remets les phrases en ordre, puis choisis les bons petits mots, les bons accords et les bons homophones.', niveaux });
})();
