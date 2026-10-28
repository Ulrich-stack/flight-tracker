# Design

Règles visuelles de CLOUDtrack. Les valeurs viennent de `src/styles.css` (variables
`:root`) : modifiez les variables, pas les couleurs en dur dans les composants.

## Principes

1. **La carte est le produit.** Elle occupe tout l'écran ; l'interface l'encadre sans
   la recouvrir (barre du haut fine, tableau repliable, panneaux ancrés sur les bords).
2. **Une seule couleur.** Le vert CLOUDtrack sert aux actions, à la sélection et à
   l'état « en direct ». Tout le reste est en gris neutres.
3. **Des surfaces opaques.** Pas de verre flouté, pas de dégradés décoratifs, pas
   d'ombres décalées : des fonds pleins séparés par des filets de 1 px.
4. **Des vraies structures.** Un tableau pour une liste de vols, pas des cartes empilées ;
   un panneau de détail plutôt qu'une bulle flottante.
5. **Les données en police à chasse fixe.** Codes, heures, altitudes et vitesses sont en
   IBM Plex Mono, en chiffres tabulaires, pour s'aligner et se comparer d'un coup d'œil.

## Couleurs

Thème sombre unique (`color-scheme: dark`).

| Rôle | Variable | Valeur |
|---|---|---|
| Fond de page | `--bg` | `#121314` |
| Surface (barre, panneaux) | `--surface` | `#1b1d1f` |
| Surface secondaire (menus) | `--surface-2` | `#232628` |
| Survol | `--surface-hover` | `#2a2d30` |
| Filet | `--border` | `#2c2f32` |
| Filet marqué | `--border-strong` | `#3d4145` |
| Texte | `--text` | `#ececec` |
| Texte secondaire | `--text-muted` | `#8b8f93` |
| Accent | `--accent` | `#3fa58f` |
| Accent au survol | `--accent-hover` | `#4db69f` |
| Texte sur accent | `--accent-ink` | `#08201a` |
| Halo de focus | `--accent-soft` | `rgba(63, 165, 143, 0.14)` |
| Retard, données d'exemple | `--warning` | `#e0a548` |
| Erreur, annulation, urgence | `--danger` | `#ec5f5f` |

- L'ambre et le rouge sont **réservés aux états** (retard, annulation, code transpondeur
  d'urgence) et toujours accompagnés d'un texte : jamais la couleur seule.
- Le texte reste en `--text` ou `--text-muted`, jamais dans la couleur d'une série.

### Carte

| Élément | Valeur |
|---|---|
| Avion | `#d9dcdf` (contour `#121314`) |
| Avion sélectionné | `#3fa58f`, 1,6 × plus grand |
| Avion au sol (mode altitude) | `#8b8f93` |
| Trajectoire | `#3fa58f`, 2,5 px |
| Aéroport favori | cercle vert + étiquette `CDG` sur fond vert |

**Couleur selon l'altitude** (option des filtres) : rampe séquentielle d'**une seule
teinte** bleue, du plus sombre (bas) au plus clair (haut), validée pour la lisibilité et
les daltonismes sur le fond de carte :

| Tranche | Couleur |
|---|---|
| < 3 000 m | `#2a78d6` |
| 3 000 – 7 000 m | `#5598e7` |
| 7 000 – 10 000 m | `#86b6ef` |
| > 10 000 m | `#cde2fb` |

Le bleu est volontairement distinct du vert d'accent pour que la sélection reste visible.

## Typographie

| Usage | Police | Détails |
|---|---|---|
| Interface | Archivo | 400–750 ; corps 15 px, petits libellés 12–13 px |
| Données | IBM Plex Mono | 400–600 ; `font-variant-numeric: tabular-nums` |

| Élément | Taille | Graisse |
|---|---|---|
| Titre de page | 28 px | 650 |
| Titre de formulaire | 24 px | 650 |
| Titre de section | 16 px | 600 |
| Valeur de tuile statistique | 26 px (22 px mobile) | 500, mono |
| Indicatif dans le panneau | 20 px | 600, mono |

Pas de capitales espacées décoratives ; les libellés sont en casse normale.

## Formes et espacements

| Élément | Rayon |
|---|---|
| Petits contrôles, boutons d'outil (`--radius`) | 6 px |
| Champs, boutons principaux, menus | 8 px |
| Panneaux, sections, tuiles | 10 px |
| Carte du formulaire de connexion | 14 px |

- Hauteurs : champ et bouton 44 px ; recherche 36 px ; barre du haut 52 px.
- Ombres réservées aux éléments flottants (menus, panneau de détail, notifications) :
  `0 12px 32px rgba(0, 0, 0, 0.4)` environ.

## Composants

**Champs** (`.input`) : remplis, sans bordure visible au repos (`--field`). Au survol, le
fond s'éclaircit (`--field-hover`). Au focus : fond `--field-focus`, contour 1 px
`--accent` et halo `--accent-soft`. En erreur : contour `--danger`. Les listes déroulantes
utilisent la même classe, avec une flèche dessinée en SVG. Libellé toujours visible
au-dessus du champ (13 px, `--text-muted`).

**Boutons** : `.btn-primary` (fond vert, texte `--accent-ink`) pour l'action principale,
une seule par écran ; `.btn-secondary` (fond `--surface-2`, filet) pour le reste.

**Recherche** : champ rempli avec icône, raccourci `Ctrl K` affiché, bouton d'effacement ;
résultats groupés (Aéroports / Vols en cours / Recherches récentes), partie correspondante
surlignée en vert, aide clavier en pied de liste.

**Tableaux** : en-têtes 12 px `--text-muted` collants, lignes séparées par `--border`,
survol `--surface-2`, codes et heures en mono.

**Tuiles statistiques** (`.tiles`) : grille séparée par des filets de 1 px, libellé
13 px au-dessus d'une grande valeur en mono.

**Diagrammes** (`app-bar-chart`) : une seule série, barres fines (10 px) à bout arrondi
de 4 px côté valeur, 2 px d'écart entre colonnes verticales, infobulle au survol et vue tableau « Voir les données ».

**Notifications** : en bas à droite, fond `--surface-2`, titre et texte, lien vers le vol.

## Mise en page

- **Dashboard** : barre du haut / carte plein écran / tableau des arrivées repliable
  (38 % de la hauteur au maximum). Filtres en haut à gauche, détail d'un avion à droite.
- **Pages de contenu** (aéroports, statistiques, profil) : colonne centrée de 1 120 px
  maximum, sections en grille de deux colonnes qui passent en une seule sous 420 px.
- **Authentification** : carte des vols en plein écran (non interactive), formulaire dans
  une carte de 400 px centrée, assombrissement radial autour.

## Mouvement

Transitions courtes (150–200 ms) sur les couleurs et le chevron du tableau ; apparition
du panneau de détail et des notifications par glissement de 6–8 px. Toutes les animations
sont désactivées avec `prefers-reduced-motion: reduce`.

## Responsive

| Largeur | Changements |
|---|---|
| ≤ 1 100 px | l'horloge et le nombre d'avions disparaissent de la barre du haut |
| ≤ 860 px | la barre du haut passe sur deux lignes (navigation en dessous) |
| ≤ 760 px | tableau des arrivées replié au démarrage, colonnes réduites, panneau de détail en bas |
| ≤ 480 px | formulaire de connexion en haut de l'écran, champs nom et prénom empilés |

## À éviter

Ces choix ont été essayés puis abandonnés :

- verre flouté et accent turquoise (aspect « dashboard générique ») ;
- fond crème façon carte papier, quadrillages, routes dessinées (trop de mise en scène) ;
- polices Inter et Fraunces (trop répandues) ;
- barres colorées sur le côté des cartes ou des notifications ;
- écran de connexion coupé en deux avec un slogan.
