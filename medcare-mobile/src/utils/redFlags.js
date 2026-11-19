/**
 * Détection locale de signes d'alerte, exécutée AVANT tout appel à l'IA.
 * Principe de sécurité : un message grave ne doit jamais dépendre d'un serveur en ligne.
 * Liste volontairement prudente : elle déclenche un avertissement, pas un diagnostic.
 * À faire relire par un médecin avant mise en production.
 */
const PATTERNS = [
  /douleur(s)?\s+(dans\s+)?(la\s+)?(poitrine|thorac)/i,
  /(oppression|serrement)\s+(dans\s+)?(la\s+)?poitrine/i,
  /(difficult|mal)\w*\s+(à|pour)\s+respirer/i,
  /(je\s+)?(ne\s+)?(peux|arrive)\s+(plus|pas)\s+respirer/i,
  /(perte\s+de\s+connaissance|évanoui|malaise\s+grave)/i,
  /(paralysie|visage\s+qui\s+(tombe|penche)|bouche\s+déviée)/i,
  /(saignement|hémorragie)\s+(abondant|important|qui\s+ne\s+s.arrête)/i,
  /(convulsion|crise\s+d.épilepsie)/i,
  /(idées?\s+suicidaires?|envie\s+de\s+mourir|me\s+suicider|me\s+faire\s+du\s+mal)/i,
  /(vomi\w*\s+du\s+sang|crache\w*\s+du\s+sang)/i,
];

export function hasRedFlag(text = '') {
  return PATTERNS.some((p) => p.test(text));
}
