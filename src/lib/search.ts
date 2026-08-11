/**
 * Recherche produit — index construit au BUILD, filtrage côté navigateur.
 *
 * Le site est en export statique : aucun serveur ne peut répondre à une requête.
 * On embarque donc un index allégé dans la page /recherche/ et on filtre en
 * mémoire. À l'échelle du catalogue (~80 produits, ~30 teintes chacun) c'est
 * instantané et ça évite tout appel réseau.
 *
 * Un coiffeur cherche rarement le nom commercial : il tape « 7.34 », « blond
 * cendré », « oxydant 20 » ou « gants ». L'index indexe donc aussi les TEINTES
 * et la catégorie, pas seulement le titre.
 */

export type IndexEntry = {
  slug: string;
  name: string;
  category: string;
  image: string;
  price: number;
  available: boolean;
  /** Libellés des variantes (teintes, volumes, contenances). */
  variantes: string[];
};

/** Minuscules sans accents ni ponctuation — pour comparer ce que les gens tapent. */
export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.]+/g, " ")
    .trim();

export type Hit = { entry: IndexEntry; score: number; teintes: string[] };

/**
 * Tous les mots de la requête doivent être trouvés (ET), mais chacun peut
 * l'être dans un champ différent : « coloration cendré » matche un produit
 * « Coloration … » dont une teinte est « cendré ».
 */
export function chercher(index: IndexEntry[], requete: string, max = 40): Hit[] {
  const mots = norm(requete).split(" ").filter(Boolean);
  if (!mots.length) return [];

  const hits: Hit[] = [];

  for (const entry of index) {
    const nom = norm(entry.name);
    const cat = norm(entry.category);
    const variantesNorm = entry.variantes.map((v) => ({ brut: v, n: norm(v) }));

    let score = 0;
    let tousTrouves = true;
    const teintesTouchees = new Set<string>();

    for (const mot of mots) {
      let pointsMot = 0;

      if (nom.startsWith(mot)) pointsMot = 100;
      else if (nom.includes(mot)) pointsMot = 60;

      if (!pointsMot && cat.includes(mot)) pointsMot = 40;

      if (!pointsMot) {
        for (const v of variantesNorm) {
          if (v.n.includes(mot)) {
            // Un code teinte exact (« 7.34 ») vaut mieux qu'un mot générique.
            pointsMot = Math.max(pointsMot, v.n.startsWith(mot) ? 35 : 20);
            teintesTouchees.add(v.brut);
          }
        }
      }

      if (!pointsMot) {
        tousTrouves = false;
        break;
      }
      score += pointsMot;
    }

    if (!tousTrouves) continue;

    // À pertinence égale, un produit commandable passe devant.
    if (entry.available) score += 15;

    hits.push({ entry, score, teintes: [...teintesTouchees].slice(0, 6) });
  }

  return hits
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, max);
}
