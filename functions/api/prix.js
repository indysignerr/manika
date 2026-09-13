/**
 * POST /api/prix   { handles: ["...", "..."] }
 *
 * Renvoie les tarifs professionnels — et uniquement à un compte validé.
 * C'est le point unique par lequel un prix peut sortir : le build ne contient
 * aucun montant, et le jeton Storefront ne quitte jamais le serveur.
 */
import { resoudreRole, PRO } from "../_lib/roles.js";
import { storefront, json } from "../_lib/shopify.js";

const REQUETE = /* GraphQL */ `
  query Prix($handles: [String!]!) {
    nodes: products(first: 250, query: "") { nodes { handle } }
  }
`;

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return json({ message: "Méthode non autorisée." }, 405);

  const { role, apercu } = await resoudreRole(request, env);
  if (role !== PRO) {
    // 403 explicite : le site sait alors afficher « tarif réservé aux professionnels »
    return json({ role, message: "Tarifs réservés aux professionnels validés." }, 403);
  }

  let corps;
  try { corps = await request.json(); } catch { return json({ message: "Requête illisible." }, 400); }
  const handles = Array.isArray(corps?.handles) ? corps.handles.slice(0, 100) : [];
  if (!handles.length) return json({ message: "Aucun produit demandé." }, 400);

  // Une requête par produit via alias : Storefront n'accepte pas de filtre
  // « handle IN (…) », et c'est plus économe qu'un appel par produit.
  const alias = handles
    .map((h, i) => `p${i}: productByHandle(handle: ${JSON.stringify(h)}) {
      handle
      priceRange { minVariantPrice { amount currencyCode } }
      variants(first: 100) { nodes { id title availableForSale price { amount currencyCode } } }
    }`)
    .join("\n");

  const data = await storefront(env, `{ ${alias} }`);

  const prix = {};
  for (let i = 0; i < handles.length; i++) {
    const p = data[`p${i}`];
    if (!p) continue;
    prix[p.handle] = {
      min: Number(p.priceRange.minVariantPrice.amount),
      devise: p.priceRange.minVariantPrice.currencyCode,
      variantes: p.variants.nodes.map((v) => ({
        id: v.id,
        titre: v.title,
        prix: Number(v.price.amount),
        dispo: v.availableForSale,
      })),
    };
  }

  return json({ role, apercu, prix });
}
