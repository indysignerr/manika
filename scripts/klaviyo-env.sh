#!/usr/bin/env bash
# Renseigne KLAVIYO_API_KEY (et l'ID de liste) dans .dev.vars ET .env.local.
#
#   bash scripts/klaviyo-env.sh            # clé lue dans le presse-papiers
#   bash scripts/klaviyo-env.sh ABC123     # idem + ID de liste
#
# La clé est reprise du presse-papiers quand elle s'y trouve : coller dans une
# invite masquée n'affiche rien et donne l'impression que rien ne se passe.
# À défaut, la saisie est demandée EN CLAIR — c'est votre terminal, et une
# invite muette est pire qu'une valeur visible une seconde.
set -euo pipefail

[ -f package.json ] || { echo "✗ À lancer depuis la racine du projet (cd ~/Manika)."; exit 1; }

nettoie() { tr -d '[:space:]'; }

CLE=""
if command -v pbpaste >/dev/null 2>&1; then
  CANDIDAT=$(pbpaste 2>/dev/null | nettoie || true)
  case "$CANDIDAT" in
    pk_*) CLE="$CANDIDAT"; echo "Clé trouvée dans le presse-papiers : ${CLE:0:9}… (${#CLE} caractères)";;
  esac
fi

if [ -z "$CLE" ]; then
  printf 'Colle la clé privée Klaviyo (pk_…) puis Entrée : '
  read -r SAISIE
  CLE=$(printf '%s' "$SAISIE" | nettoie)
fi

case "$CLE" in
  pk_*) ;;
  "")   echo "✗ Aucune clé saisie."; exit 1;;
  *)    echo "✗ « ${CLE:0:12}… » ne ressemble pas à une clé privée : elle doit commencer par pk_."
        echo "  L'identifiant public du site (6 caractères) n'est pas une clé privée."
        exit 1;;
esac

LISTE="${1:-}"
if [ -z "$LISTE" ]; then
  printf "ID de liste Klaviyo (Entrée pour passer) : "
  read -r LISTE
  LISTE=$(printf '%s' "$LISTE" | nettoie)
fi

for f in .dev.vars .env.local; do
  touch "$f"
  t=$(mktemp)
  # On purge toutes les lignes KLAVIYO_, y compris celles restées vides.
  grep -vE '^KLAVIYO_' "$f" > "$t" || true
  printf 'KLAVIYO_API_KEY=%s\n' "$CLE" >> "$t"
  [ -n "$LISTE" ] && printf 'KLAVIYO_LIST_ID=%s\n' "$LISTE" >> "$t"
  mv "$t" "$f"
  chmod 600 "$f"
  echo "✓ $f"
done

echo
echo "Contenu écrit :"
echo "  KLAVIYO_API_KEY=${CLE:0:9}… (${#CLE} caractères)"
[ -n "$LISTE" ] && echo "  KLAVIYO_LIST_ID=$LISTE" || echo "  (pas d'ID de liste — le test fonctionnera quand même)"
echo
echo "Étape suivante :"
echo "  source .env.local && npx tsx scripts/test-klaviyo.mts votre@email.com"
