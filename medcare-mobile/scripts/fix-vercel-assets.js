/**
 * Vercel ne déploie pas les dossiers nommés "node_modules" : les polices d'icônes (Ionicons)
 * placées par Expo dans dist/assets/node_modules/ seraient absentes → icônes invisibles.
 * Ce script renomme le dossier et corrige les références dans les fichiers générés.
 */
const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, '..', 'dist');
const from = path.join(dist, 'assets', 'node_modules');
if (!fs.existsSync(from)) process.exit(0);
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
