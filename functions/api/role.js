/** GET /api/role — ce que le visiteur a le droit de voir. */
import { resoudreRole } from "../_lib/roles.js";
import { json } from "../_lib/shopify.js";

export async function onRequest({ request, env }) {
  const { role, apercu } = await resoudreRole(request, env);
  return json({ role, apercu });
}
