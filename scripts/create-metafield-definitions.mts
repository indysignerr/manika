/**
 * Crée les 11 définitions de métachamps produit exigées par l'arborescence.
 *
 * Idempotent : une définition déjà présente est signalée puis ignorée.
 * L'accès Storefront est indispensable — sans lui le site headless ne voit
 * jamais la donnée, quand bien même elle serait renseignée.
 *
 *   source .env.local && npx tsx scripts/create-metafield-definitions.mts
 */
import { admin } from "./shopify-admin.mts";

const CHAMPS: { key: string; name: string; description: string }[] = [
  { key: "marque",        name: "Marque",              description: "Marque commercialisée (Tassel, Biopygma, Manika…)" },
  { key: "univers",       name: "Univers",             description: "Coloration & Technique, Soins, Accessoires coloration, Matériel & consommables, Coiffage" },
  { key: "type",          name: "Type de produit",     description: "Coloration, Oxydant, Shampooing, Gants…" },
  { key: "besoin",        name: "Besoin capillaire",   description: "Cheveux colorés, secs, abîmés, nutrition, hydratation, volume" },
  { key: "gamme",         name: "Gamme",               description: "Nom exact de la gamme du fabricant" },
  { key: "format",        name: "Format",              description: "Contenance, dimensions ou quantité" },
  { key: "jetable",       name: "Jetable ou réutilisable", description: "Pour les gants, serviettes et capes" },
  { key: "volume_oxydant", name: "Volume d'oxydant",   description: "10, 20, 30 ou 40 Vol" },
  { key: "ammoniaque",    name: "Ammoniaque",          description: "Avec ou sans ammoniaque" },
  { key: "reflets",       name: "Reflets disponibles", description: "Familles de reflets présentes dans la gamme" },
  { key: "hauteurs_ton",  name: "Hauteurs de ton",     description: "Hauteurs de ton présentes dans la gamme" },
];

const MUTATION = /* GraphQL */ `
  mutation Creer($def: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $def) {
      createdDefinition { id namespace key name }
      userErrors { field message code }
    }
  }
`;

async function main() {
  console.log(`\nCréation de ${CHAMPS.length} définitions dans l'espace de noms « manika »\n`);
  let crees = 0, existants = 0, echecs = 0;

  for (const c of CHAMPS) {
    const d = await admin(MUTATION, {
      def: {
        name: c.name,
        namespace: "manika",
        key: c.key,
        description: c.description,
        type: "single_line_text_field",
        ownerType: "PRODUCT",
        access: { storefront: "PUBLIC_READ" },
      },
    });
    const r = d.metafieldDefinitionCreate;
    const err = r.userErrors?.[0];

    if (r.createdDefinition) {
      console.log(`  ✓ créé      manika.${c.key.padEnd(15)} ${c.name}`);
      crees++;
    } else if (err?.code === "TAKEN") {
      console.log(`  · existe    manika.${c.key.padEnd(15)} ${c.name}`);
      existants++;
    } else {
      console.log(`  ✗ ÉCHEC     manika.${c.key.padEnd(15)} ${err?.code ?? ""} ${err?.message ?? JSON.stringify(r)}`);
      echecs++;
    }
  }

  console.log(`\n${crees} créées · ${existants} déjà présentes · ${echecs} en échec\n`);
  if (echecs) process.exitCode = 1;
}

main().catch((e) => { console.error("\n" + e.message); process.exit(1); });
