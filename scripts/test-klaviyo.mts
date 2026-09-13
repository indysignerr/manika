/**
 * Vérifie la chaîne Klaviyo de bout en bout, étape par étape.
 *
 *   npx tsx scripts/test-klaviyo.mts votre@email.com [--abonner]
 *
 * Chaque étape exerce UN scope : quand elle échoue en 403, le script nomme le
 * scope manquant. C'est le piège connu de Klaviyo — une clé à laquelle il
 * manque `subscriptions:write` fonctionne pour tout le reste et échoue
 * silencieusement au moment de l'abonnement.
 *
 * `--abonner` ajoute réellement l'adresse à la liste de diffusion : à ne
 * lancer qu'avec une adresse à soi.
 */
const REVISION = "2026-07-15";
const CLE = process.env.KLAVIYO_API_KEY;
const LISTE = process.env.KLAVIYO_LIST_ID;
const EMAIL = process.argv[2];
const ABONNER = process.argv.includes("--abonner");

const enTetes = () => ({
  Authorization: `Klaviyo-API-Key ${CLE}`,
  "Content-Type": "application/json",
  accept: "application/json",
  revision: REVISION,
});

const SCOPE_PAR_ETAPE: Record<string, string> = {
  "Lecture des listes": "lists:read",
  "Création / mise à jour du profil": "profiles:write",
  "Envoi de l'évènement": "events:write",
  "Abonnement à la liste": "subscriptions:write",
};

let echecs = 0;

async function etape(nom: string, fn: () => Promise<string>) {
  process.stdout.write(`· ${nom}… `);
  try {
    console.log(`✓ ${await fn()}`);
  } catch (e) {
    echecs++;
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`✗ ${msg}`);
    if (/\b403\b/.test(msg)) {
      console.log(`    → scope manquant sur la clé privée : ${SCOPE_PAR_ETAPE[nom] ?? "?"}`);
    }
    if (/\b401\b/.test(msg)) console.log("    → clé invalide ou révoquée");
  }
}

async function main() {
  if (!CLE) {
    console.error("KLAVIYO_API_KEY absente — `source .env.local` puis relancer.");
    process.exit(1);
  }
  if (!EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(EMAIL)) {
    console.error("Usage : npx tsx scripts/test-klaviyo.mts votre@email.com [--abonner]");
    process.exit(1);
  }

  console.log(`Klaviyo — révision ${REVISION}, adresse de test ${EMAIL}\n`);

  await etape("Lecture des listes", async () => {
    const r = await fetch("https://a.klaviyo.com/api/lists/", { headers: enTetes() });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    const d = await r.json();
    const noms = d.data.map((l: any) => `${l.attributes.name} (${l.id})`);
    return noms.length ? noms.join(", ") : "aucune liste";
  });

  let profilId: string | null = null;
  await etape("Création / mise à jour du profil", async () => {
    const attributs = {
      email: EMAIL,
      properties: { origine: "test", statut_compte: "test", optin_marketing: false },
    };
    const r = await fetch("https://a.klaviyo.com/api/profiles/", {
      method: "POST",
      headers: enTetes(),
      body: JSON.stringify({ data: { type: "profile", attributes: attributs } }),
    });
    if (r.ok) {
      profilId = (await r.json())?.data?.id;
      return `profil créé (${profilId})`;
    }
    if (r.status === 409) {
      const d = await r.json();
      profilId = d?.errors?.[0]?.meta?.duplicate_profile_id ?? null;
      if (!profilId) throw new Error("409 sans duplicate_profile_id");
      const maj = await fetch(`https://a.klaviyo.com/api/profiles/${profilId}/`, {
        method: "PATCH",
        headers: enTetes(),
        body: JSON.stringify({ data: { type: "profile", id: profilId, attributes: attributs } }),
      });
      if (!maj.ok) throw new Error(`PATCH ${maj.status} ${await maj.text()}`);
      return `profil existant mis à jour (${profilId})`;
    }
    throw new Error(`${r.status} ${await r.text()}`);
  });

  await etape("Envoi de l'évènement", async () => {
    const r = await fetch("https://a.klaviyo.com/api/events/", {
      method: "POST",
      headers: enTetes(),
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            properties: { origine: "test" },
            metric: { data: { type: "metric", attributes: { name: "Test intégration site" } } },
            profile: { data: { type: "profile", attributes: { email: EMAIL } } },
          },
        },
      }),
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    return "évènement « Test intégration site » enregistré";
  });

  if (ABONNER) {
    if (!LISTE) {
      console.log("· Abonnement à la liste… ✗ KLAVIYO_LIST_ID absente");
      echecs++;
    } else {
      await etape("Abonnement à la liste", async () => {
        const r = await fetch(
          "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/",
          {
            method: "POST",
            headers: enTetes(),
            body: JSON.stringify({
              data: {
                type: "profile-subscription-bulk-create-job",
                attributes: {
                  custom_source: "Test intégration site",
                  profiles: {
                    data: [
                      {
                        type: "profile",
                        attributes: {
                          email: EMAIL,
                          subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
                        },
                      },
                    ],
                  },
                },
                relationships: { list: { data: { type: "list", id: LISTE } } },
              },
            }),
          }
        );
        if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
        return `ajouté à la liste ${LISTE}`;
      });
    }
  } else {
    console.log("· Abonnement à la liste… (ignoré — ajouter --abonner pour le tester)");
  }

  console.log(
    echecs === 0
      ? "\nTout est en place."
      : `\n${echecs} étape(s) en échec — corriger avant la mise en service.`
  );
  process.exit(echecs === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
