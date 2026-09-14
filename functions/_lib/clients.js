/**
 * Vérification de l'étiquette « pro-valide » auprès de Shopify.
 *
 * C'est ce qui rend la révocation réelle : un cookie de session valide ne
 * suffit pas, on redemande à Shopify si le salon est toujours validé. Une
 * gérante qui retire l'étiquette coupe l'accès aux tarifs.
 *
 * Mise en cache 5 minutes : sans elle, chaque affichage de page déclencherait
 * un appel à l'API Admin, dont le quota est vite atteint.
 */
import { adminGql } from "./shopify.js";

export const ETIQUETTE_PRO = "pro-valide";

const TTL = 300; // secondes

export async function salonValide(env, idClient) {
  if (!idClient) return false;

  const cle = new Request(`https://manika.interne/salon/${encodeURIComponent(idClient)}`);
  const cache = caches.default;

  const enCache = await cache.match(cle);
  if (enCache) return (await enCache.text()) === "1";

  let valide = false;
  try {
    const gid = String(idClient).startsWith("gid://")
      ? idClient
      : `gid://shopify/Customer/${idClient}`;
    const d = await adminGql(
      env,
      /* GraphQL */ `query Client($id: ID!) { customer(id: $id) { tags } }`,
      { id: gid }
    );
    valide = Boolean(d?.customer?.tags?.includes(ETIQUETTE_PRO));
  } catch (e) {
    // API injoignable : on refuse plutôt que d'ouvrir les tarifs par défaut.
    console.error("salonValide", e);
    return false;
  }

  await cache.put(
    cle,
    new Response(valide ? "1" : "0", { headers: { "Cache-Control": `max-age=${TTL}` } })
  );
  return valide;
}
