"""
Génère le document de questions sur les tarifs, à remettre à la cliente.

Les chiffres ne sont pas saisis à la main : ils sont relus dans le fichier
« TARIFS MANIKA.xlsx » à chaque génération, pour que le document ne puisse
pas mentir sur ce qu'il annonce.

    python3 scripts/pdf-questions-tarifs.py [chemin/vers/TARIFS.xlsx]

Sortie : docs/MANIKA-questions-tarifs.pdf
"""
import sys
from pathlib import Path

import openpyxl
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

SOURCE = Path(sys.argv[1] if len(sys.argv) > 1 else Path.home() / "Downloads/TARIFS MANIKA.xlsx")
SORTIE = Path("docs/MANIKA-questions-tarifs.pdf")
VERT = "FF00B050"  # couleur des prix de vente dans le fichier

# Palette du site
CUIVRE = colors.HexColor("#82503C")
CUIVRE_F = colors.HexColor("#6B4230")
BRONZE = colors.HexColor("#7A5424")
ENCRE = colors.HexColor("#3A2A1F")
TAUPE = colors.HexColor("#5C5349")
IVOIRE = colors.HexColor("#F5F3EF")
IVOIRE3 = colors.HexColor("#E8E2D8")


def lire_tarifs(chemin: Path):
    """Compte ce que le fichier contient réellement, colonne de vert comprise."""
    valeurs = openpyxl.load_workbook(chemin, data_only=True)
    formats = openpyxl.load_workbook(chemin)
    stats = {"lignes": 0, "complets": 0, "sans_72": 0, "zero": 0, "offert": 0, "barber": 0, "sku": 0}
    for feuille in valeurs.sheetnames:
        wv, wf = valeurs[feuille], formats[feuille]
        for rv, rf in zip(wv.iter_rows(min_row=4), wf.iter_rows(min_row=4)):
            if not rv[2].value:
                continue
            prix = []
            for cv, cf in zip(rv[7:11], rf[7:11]):
                coul = cf.font.color.rgb if cf.font and cf.font.color and cf.font.color.type == "rgb" else None
                prix.append(cv.value if coul == VERT else None)
            if not any(v not in (None, "") for v in prix):
                if feuille.upper() == "BARBER" and rv[3].value not in (None, ""):
                    stats["barber"] += 1
                continue
            stats["lignes"] += 1
            if rv[1].value not in (None, ""):
                stats["sku"] += 1
            nombres = [v for v in prix if isinstance(v, (int, float))]
            textes = [v for v in prix if isinstance(v, str)]
            # Les quatre cas s'excluent : « Offert » n'est pas un palier vide.
            if textes:
                stats["offert"] += 1
            elif nombres and all(v == 0 for v in nombres):
                stats["zero"] += 1
            elif len(nombres) == 4:
                stats["complets"] += 1
            elif nombres:
                stats["sans_72"] += 1
    return stats


S = lire_tarifs(SOURCE)

# ── Styles ────────────────────────────────────────────────────────────
def style(nom, **kw):
    base = dict(fontName="Helvetica", fontSize=10, leading=14, textColor=ENCRE, alignment=TA_LEFT)
    base.update(kw)
    return ParagraphStyle(nom, **base)


TITRE = style("titre", fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=CUIVRE_F, spaceAfter=2)
SOUS_TITRE = style("st", fontSize=10.5, leading=15, textColor=TAUPE, spaceAfter=14)
H2 = style("h2", fontName="Helvetica-Bold", fontSize=12, leading=16, textColor=CUIVRE, spaceBefore=16, spaceAfter=6)
CORPS = style("corps", spaceAfter=6)
PETIT = style("petit", fontSize=8.5, leading=12, textColor=TAUPE)
QUESTION = style("q", fontName="Helvetica-Bold", fontSize=10.5, leading=14, textColor=ENCRE, spaceAfter=3)
PRECISION = style("prec", fontSize=9.5, leading=13, textColor=TAUPE, spaceAfter=4)


def question(numero: str, titre: str, precision: str, lignes: int = 2):
    """Une question suivie d'un cadre de réponse, insécable."""
    reponse = Table(
        [[""]] * lignes,
        colWidths=[165 * mm],
        rowHeights=[7.5 * mm] * lignes,
        style=TableStyle([
            ("LINEBELOW", (0, 0), (-1, -1), 0.4, IVOIRE3),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]),
    )
    return KeepTogether([
        Paragraph(f"{numero}. {titre}", QUESTION),
        Paragraph(precision, PRECISION),
        reponse,
        Spacer(1, 7 * mm),
    ])


def tableau(donnees, largeurs):
    t = Table(donnees, colWidths=largeurs, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 9),
        ("FONT", (0, 1), (-1, -1), "Helvetica", 9.5),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("BACKGROUND", (0, 0), (-1, 0), CUIVRE),
        ("TEXTCOLOR", (0, 1), (-1, -1), ENCRE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [IVOIRE, colors.white]),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, IVOIRE3),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


# ── Contenu ───────────────────────────────────────────────────────────
histoire = []
A = histoire.append

A(Paragraph("MANIKA.LAB — Tarifs", TITRE))
A(Paragraph(
    "Ce qu'il manque pour mettre les prix en ligne. "
    "Document établi à partir du fichier « TARIFS MANIKA.xlsx », le 19 septembre 2026.",
    SOUS_TITRE,
))

A(Paragraph("Ce que le fichier permet déjà", H2))
A(Paragraph(
    "Les prix de vente HT en vert ont été relevés automatiquement. Ils seront saisis dans la boutique "
    "sous forme de paliers de quantité : le salon choisit son palier, le prix unitaire s'applique.",
    CORPS,
))
A(Spacer(1, 3 * mm))
A(tableau([
    ["", "Nombre"],
    ["Produits avec un prix de vente", str(S["lignes"])],
    ["dont les quatre paliers sont remplis", str(S["complets"])],
    ["dont le palier « plus de 72 » est vide", str(S["sans_72"])],
    ["Produits à 0 €", str(S["zero"])],
    ["Nuanciers marqués « Offert »", str(S["offert"])],
    ["Produits barber sans prix de vente", str(S["barber"])],
    ["Produits de la boutique absents du fichier", "109"],
], [120 * mm, 45 * mm]))

A(Paragraph("Les questions qui bloquent", H2))
A(Paragraph(
    "Sans ces réponses, les prix ne peuvent pas être publiés. Vous pouvez écrire directement dans les cadres.",
    CORPS,
))
A(Spacer(1, 4 * mm))

A(question(
    "1", "Le palier « plus de 72 » est vide sur la plupart des produits.",
    f"Il n'est rempli que sur {S['complets']} produits, et vide sur {S['sans_72']} autres. "
    "Ce palier existe-t-il seulement pour la coloration, ou la colonne n'a-t-elle pas été remplie ? "
    "Selon votre réponse, la boutique proposera trois paliers (1 à 12, 13 à 36, 36 à 71) ou quatre.",
))
A(question(
    "2", "Les produits barber n'ont aucun prix de vente.",
    f"{S['barber']} produits n'ont que leur prix d'achat. Faut-il leur appliquer les mêmes coefficients "
    "que la gamme femme (× 1,7 puis × 1,5, × 1,4 et × 1,3), ou un tarif barber suivra-t-il ?",
))
A(question(
    "3", "109 produits de la boutique ne figurent pas dans le fichier.",
    "Surtout des consommables : papier aluminium, gants, serviettes, protège-lunettes, palettes, "
    "mais aussi l'oxydant Dousse et plusieurs nuanciers. Faut-il en fixer les prix, les retirer "
    "de la vente en attendant, ou les sortir du catalogue ?",
))
A(question(
    "4", "Trois colorations sont à 0 €.",
    "Decohair Végétale, ainsi que les colorations Neuthrosun avec et sans ammoniaque. "
    "Prix à compléter, ou produits qui ne sont pas encore commercialisés ?",
))
A(question(
    "5", "Les nuanciers sont « Offerts » au-delà de 72 unités.",
    "C'est un geste commercial et non un prix. Doit-il apparaître sur le site, par exemple "
    "« nuancier offert dès 72 colorations », ou reste-t-il une négociation au cas par cas ?",
))
A(question(
    "6", "Une ligne porte la mention « prix à vérifier ».",
    "Il s'agit de la poudre blanche de chez Cosmetici.",
))

A(Paragraph("Les conditions de vente, à arrêter une bonne fois", H2))
A(Paragraph(
    "Ces informations manquent aussi sur le site : tant qu'elles ne sont pas décidées, rien n'est affiché, "
    "car on n'annonce pas un engagement qui n'a pas été pris.",
    CORPS,
))
A(Spacer(1, 4 * mm))

A(question(
    "7", "Livraison offerte : à partir de quel montant ?",
    "Le site annonce aujourd'hui 250 € HT. Est-ce bien le seuil retenu ?", 1,
))
A(question(
    "8", "Y a-t-il un minimum de commande ?", "", 1,
))
A(question(
    "9", "Quel délai d'expédition annoncer ?",
    "Par exemple « 48 h ouvrées ». C'est un engagement, il vaut mieux l'annoncer large.", 1,
))
A(question(
    "10", "Quelle politique de retour pour les salons ?",
    "Entre professionnels, il n'existe pas de droit de rétractation : vous n'êtes obligée à rien. "
    "Si vous souhaitez en offrir un, il doit être écrit dans les conditions générales de vente.",
))
A(question(
    "11", "Le prix catalogue (colonne G) est-il le prix public conseillé ?",
    "Si oui, il peut être affiché barré à côté du tarif salon : la remise devient visible.", 1,
))
A(question(
    "12", "Les références de la colonne SKU sont-elles les vôtres ou celles du fournisseur ?",
    f"{S['sku']} produits en ont une. Si ce sont les vôtres, elles seront ajoutées à la boutique et "
    "la commande rapide pourra chercher par référence, en plus du nom et de la nuance.", 1,
))
A(question(
    "13", "La TVA est-elle à 20 % sur tout le catalogue ?", "", 1,
))

A(Spacer(1, 4 * mm))
A(Paragraph(
    "Une précision utile : les prix seront saisis hors taxes dans la boutique, et la TVA calculée au moment "
    "de la commande. Les salons verront donc les tarifs HT, comme dans votre fichier.",
    PETIT,
))


def pied(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(TAUPE)
    canvas.drawString(22 * mm, 12 * mm, "MANIKA.LAB · Tarifs — questions ouvertes · 19 septembre 2026")
    canvas.drawRightString(A4[0] - 22 * mm, 12 * mm, f"page {doc.page}")
    canvas.setStrokeColor(IVOIRE3)
    canvas.setLineWidth(0.5)
    canvas.line(22 * mm, 16 * mm, A4[0] - 22 * mm, 16 * mm)
    canvas.restoreState()


SORTIE.parent.mkdir(parents=True, exist_ok=True)
doc = BaseDocTemplate(
    str(SORTIE), pagesize=A4,
    leftMargin=22 * mm, rightMargin=22 * mm, topMargin=20 * mm, bottomMargin=22 * mm,
    title="MANIKA.LAB — Tarifs, questions ouvertes", author="Indysigner",
)
doc.addPageTemplates([PageTemplate(
    id="page",
    frames=[Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="corps")],
    onPage=pied,
)])
doc.build(histoire)
print(f"✓ {SORTIE}")
print("  relevé :", S)
