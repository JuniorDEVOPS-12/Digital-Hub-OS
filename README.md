# Digital Hub SN — Admin System

Système interne de gestion modulaire et évolutif pour un centre de formation de 50 étudiants.

## Architecture Propre & Scalable

Le projet a été restructuré pour séparer la logique de persistance (Data Layer), la logique métier (Services), l'exposition API (Backend) et l'interface utilisateur (Frontend) :

```
/
├── index.html                  # Point d'entrée (charge l'application via ES Modules)
│
├── config/
│   └── constants.js            # Configuration globale, règles métier et helpers purs
│
├── data/
│   ├── store.js                # Abstraction de stockage (localStorage)
│   ├── seeds/                  # Générateurs de données de démonstration (Students, Trainers, Modules)
│   └── providers/              # Couche d'accès aux données (Providers étendant BaseProvider)
│
├── services/
│   └── *.service.js            # Logique métier (validation de limites, calculs de présences, etc.)
│
├── backend/
│   └── api.js                  # Façade API centralisée (Point d'accès unique pour l'UI)
│
├── frontend/
│   ├── css/
│   │   └── index.css           # Design System (styles premium dark theme)
│   ├── core/
│   │   └── *.js                # Routeur SPA, gestionnaires de modals, toasts et DOM helpers
│   └── pages/
│       └── *.page.js           # Rendu dynamique de chaque écran du tableau de bord
│
└── README.md                   # Cette documentation
```

## Règles Métier Implémentées
1. **50 étudiants maximum** : Validation dynamique lors de l'ajout d'étudiants actifs.
2. **1 seule cohorte** : Données pré-configurées pour la cohorte actuelle.
3. **Modules séquentiels** : L'ordre d'affichage (M1 → M2 → M3) est respecté, et le planning est régénéré automatiquement si la liste ou l'ordre des modules change.
4. **Formation sur 1 mois** : Les dates de cours couvrent 1 mois ouvré de formation.
5. **Cours du lundi au vendredi** : Le planning filtre automatiquement les week-ends.
6. **Horaires fixes 16h–19h** : Affichage dans la grille hebdomadaire du planning.
7. **Formateur dédié** : Chaque module possède une liaison obligatoire avec un formateur, avec suppression en cascade.

## Prêt pour les Outils IA
Cette structure modulaire et typée ES6 permet de cibler individuellement chaque composant :
- **Claude Code** : Peut manipuler directement la logique de services dans `/services`.
- **Codex** : Peut enrichir ou modifier le look and feel dans `/frontend/pages` ou `/frontend/css`.
- **Kimi** : Peut analyser le code proprement séparé et documenter l'architecture.
- **Devin** : Dispose d'une façade `/backend/api.js` propice au développement autonome de routes HTTP ou de branchements de bases de données réelles (PostgreSQL/Node/Express).
