/**
 * Post-traitement de l'export web (exécuté après `expo export`) :
 * 1. Vercel ne déploie pas les dossiers nommés "node_modules" : les polices d'icônes placées par Expo dans
 *    dist/assets/node_modules/ seraient absentes → on renomme en assets/vendor et on corrige les références.
 * 2. Ajoute à index.html les balises PWA : manifeste, couleur de thème, icône iOS, langue française
 *    → l'application peut être installée sur l'écran d'accueil (téléphone) ou comme application (ordinateur).
 */
const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, '..', 'dist');

const from = path.join(dist, 'assets', 'node_modules');
if (fs.existsSync(from)) {
  fs.renameSync(from, path.join(dist, 'assets', 'vendor'));
  (function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (/\.(js|html|json|css)$/.test(f)) {
        const t = fs.readFileSync(p, 'utf8');
        if (t.includes('assets/node_modules')) fs.writeFileSync(p, t.split('assets/node_modules').join('assets/vendor'));
      }
    }
  })(dist);
  console.log('assets/node_modules → assets/vendor : OK');
}

const indexPath = path.join(dist, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
if (!html.includes('rel="manifest"')) {
  const tags = [
    '<link rel="manifest" href="/manifest.json" />',
    '<meta name="theme-color" content="#1565D8" />',
    '<meta name="description" content="Consultez un médecin en ligne, par appel vidéo ou par chat." />',
    '<meta name="mobile-web-app-capable" content="yes" />',
    '<meta name="apple-mobile-web-app-capable" content="yes" />',
    '<meta name="apple-mobile-web-app-title" content="Medcare" />',
    '<meta name="apple-mobile-web-app-status-bar-style" content="default" />',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
  ].join('\n    ');
  html = html.replace('</head>', `    ${tags}\n  </head>`).replace('<html lang="en">', '<html lang="fr">');
  html = html.replace(/<meta name="viewport"[^>]*>/, '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />');
  fs.writeFileSync(indexPath, html);
  console.log('Balises PWA ajoutées à index.html : OK');
}
