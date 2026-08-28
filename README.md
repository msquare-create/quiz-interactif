# 🏆 STEM & ROBOTICS FINAL QUIZ 2026

Application web de quiz premium pour la cérémonie de clôture du **Camp STEM & Robotique**. Mobile-first, sombre, technologique — pensée pour être utilisée directement sur smartphone via un QR Code pendant l'événement.

---

## Présentation

Chaque participant scanne un QR Code, s'identifie, puis passe les 50 questions (QCM et Vrai/Faux) à son propre rythme, avec un chronomètre individuel qui démarre dès qu'il clique sur **COMMENCER**. Les questions et les options sont mélangées pour chaque participant. Le score, la catégorie de résultat ("STEM MASTER", "STEM EXPERT"...) et la révision détaillée des réponses sont affichés uniquement après soumission.

## Fonctionnalités

- Landing page, identification (prénom/nom/équipe), écran de confirmation avant lancement du chronomètre.
- Moteur de quiz : une question à la fois, barre de progression, indicateur de questions répondues, navigation précédent/suivant.
- Chronomètre robuste basé sur un **timestamp de deadline** (pas un simple `setInterval`) — reste cohérent même si l'onglet est mis en arrière-plan ou le navigateur ralenti.
- Récupération automatique après un refresh accidentel (session sauvegardée en local).
- Mélange fiable (Fisher–Yates) de l'ordre des questions et des options, avec identification robuste de la bonne réponse même après mélange.
- Écran de soumission avec récapitulatif et confirmation explicite ; soumission automatique sans confirmation si le temps expire.
- Écran de résultat avec animation de révélation, catégorisation configurable, partage via l'API Web Share (avec fallback presse-papiers).
- Révision des réponses **uniquement après soumission**, jamais pendant le quiz.
- Architecture de classement prête à être branchée sur un backend (voir [Backend](#backend--classement)).
- 27 tests automatisés (Vitest + Testing Library) couvrant le parcours complet et les cas limites.

## Technologies

- **React 19 + Vite** (JavaScript)
- CSS moderne (custom properties, pas de framework CSS lourd)
- Aucune dépendance runtime superflue — bundle de production ≈ 70 Ko gzippés
- Vitest + Testing Library pour les tests

## Installation

Prérequis : Node.js 20+.

```bash
npm install
```

## Développement local

```bash
npm run dev
```
Ouvre l'application sur `http://localhost:5173`.

## Tests

```bash
npm test
```
27 tests couvrant : intégrité des 50 questions, calcul du score (aucune réponse, toutes les réponses, tentative de score falsifié), fiabilité du mélange, parcours complet, dernière question, double soumission, navigation, révision post-soumission, expiration du chronomètre (y compris "1 seconde restante"), récupération après refresh.

## Build

```bash
npm run build
```
Génère le dossier `dist/` prêt à être déployé. Le build a été vérifié : `npm install && npm run build` fonctionne sans erreur.

## Déploiement GitHub Pages

Le projet est préconfiguré pour GitHub Pages via GitHub Actions.

1. Poussez le projet sur un dépôt GitHub (ex. `github.com/USERNAME/stem-robotics-final-quiz`).
2. Dans **Settings → Pages**, réglez la source sur **GitHub Actions**.
3. Chaque push sur `main` déclenche `.github/workflows/deploy.yml`, qui build et publie automatiquement.
4. L'URL finale sera de la forme `https://USERNAME.github.io/REPOSITORY/`.

Le chemin de base (`base` dans `vite.config.js`) est **déduit automatiquement du nom du dépôt** par le workflow (`VITE_BASE_PATH: /${{ github.event.repository.name }}/`) — aucune modification manuelle n'est nécessaire pour un déploiement standard. Si vous préférez un déploiement manuel (`npm run build` + push du dossier `dist/` sur une branche `gh-pages`), définissez `VITE_BASE_PATH=/VOTRE-DEPOT/` avant le build.

### Génération du QR Code

Une fois l'URL GitHub Pages connue, générez le QR Code avec n'importe quel générateur (ex. `https://www.qr-code-generator.com`) pointant vers cette URL. Aucun générateur n'est intégré à l'application elle-même — ce n'est pas nécessaire pour l'usage prévu (un QR Code affiché en salle).

## Configuration

Tout se règle dans **`src/config/quizConfig.js`**, sans toucher au reste du code :

| Paramètre | Rôle |
|---|---|
| `QUIZ_DURATION` | Durée globale du quiz, en secondes |
| `lowTimeThresholdSeconds` / `criticalTimeThresholdSeconds` | Seuils d'alerte visuelle du chronomètre |
| `shuffle.shuffleQuestions` / `shuffle.shuffleOptions` | Active/désactive le mélange |
| `resultCategories` | Seuils et libellés des catégories de résultat (STEM MASTER, etc.) |
| `leaderboard.mode` | `"static"` (par défaut) ou `"backend"` — voir [Backend](#backend--classement) |
| `scoring` | Barème (points standard / points "difficile") |

### Modification du temps

Changez uniquement `QUIZ_CONFIG.QUIZ_DURATION` dans `src/config/quizConfig.js` (en secondes). Cette valeur est l'unique source de vérité pour le chronomètre — elle n'est dupliquée nulle part ailleurs dans le code.

## Ajout / modification des questions

Les 50 questions vivent dans **`src/data/questions.js`**, sous forme d'un tableau d'objets :

```js
{
  id: 1,
  category: "Algorithmique",
  type: "mcq",           // ou "true_false"
  question: "...",
  options: ["...", "...", "...", "..."],
  answer: "...",          // doit correspondre exactement à une entrée de `options`
  points: 1,
}
```

Le type (`mcq` / `true_false`) est explicite dans les données ; l'architecture reste compatible avec l'ajout d'autres types de questions à l'avenir sans réécrire le moteur (le composant d'affichage des options n'a besoin que de `displayOptions`, généré automatiquement par `src/utils/shuffle.js`).

**⚠️ Important — contenu figé** : le contenu des 50 questions fournies n'a volontairement pas été reformulé. Une seule correction a été appliquée, explicitement autorisée : la réponse de la question 50 (« Un projet STEM combine principalement... ») a été corrigée de A vers B (erreur de saisie confirmée).

## Backend / Classement

Deux scénarios sont pris en charge par l'architecture (`src/services/leaderboard.js`), sélectionnés via `QUIZ_CONFIG.leaderboard.mode` :

### Scénario A — Statique (par défaut, `mode: "static"`)

L'application est hébergée uniquement sur GitHub Pages. **GitHub Pages seul ne permet pas de maintenir une base de données globale sécurisée** : il n'y a pas de serveur pour recevoir, valider et stocker les scores de tous les participants de façon fiable et infalsifiable. Dans ce mode, l'application **n'affiche donc pas de classement global** et ne simule aucune fausse donnée. Chaque participant voit uniquement son propre résultat.

### Scénario B — Backend gratuit (`mode: "backend"`)

Pour un classement global réel, branchez un backend gratuit (Firebase ou Supabase recommandés). L'architecture est conçue pour que ce changement reste isolé :

1. Choisissez un fournisseur et créez un projet (Firebase ou Supabase, offres gratuites suffisantes pour quelques centaines de participants).
2. Renseignez `QUIZ_CONFIG.backend.provider` et `QUIZ_CONFIG.backend.config` dans `src/config/quizConfig.js` (utilisez des variables d'environnement Vite — `import.meta.env.VITE_...` — pour toute clé, **jamais en dur dans le code**).
3. Implémentez les méthodes `submitScore` / `fetchLeaderboard` de `BackendLeaderboardAdapter` dans `src/services/leaderboard.js` avec le SDK choisi.
4. Passez `QUIZ_CONFIG.leaderboard.mode` à `"backend"`.

Le frontend continue d'être hébergé sur GitHub Pages ; seul le backend change. Aucune clé, identifiant ou logique de backend n'a été inventé dans ce livrable — l'emplacement d'intégration est clairement marqué dans le code. Le tri de référence (score décroissant, puis temps croissant en cas d'égalité) est déjà implémenté dans `sortLeaderboardEntries`.

## Sécurité

Une application frontend statique **ne peut jamais réellement cacher** une donnée envoyée au navigateur : les réponses correctes font nécessairement partie du bundle chargé par le participant. Ce livrable ne prétend donc pas à une sécurité parfaite, et met en place les protections raisonnables pour un quiz d'événement :

- Les bonnes réponses ne sont jamais affichées avant la fin du quiz (aucun indice visuel, aucune classe CSS "correct/incorrect" appliquée pendant le déroulement).
- Une seule tentative par défaut (`QUIZ_CONFIG.attempts.maxAttempts`).
- Le score est **toujours recalculé côté client à partir de la donnée de vérité** (`question.answer`), jamais accepté tel quel depuis un état potentiellement modifié — voir `src/services/scoring.js`.
- Si un backend est branché (scénario B), la correction et la validation doivent être **également** effectuées côté serveur avant d'accepter un score dans un classement global — ne faites jamais confiance à un score envoyé par le navigateur pour un classement public. L'architecture prévoit cet emplacement mais ne l'implémente pas (aucun backend n'a été fourni).
- Entrées utilisateur (prénom/nom/équipe) validées côté client avant soumission ; aucune donnée personnelle sensible n'est demandée ou stockée.

## Limites

- **Sans backend**, il n'y a pas de classement global, pas de limite de tentative infalsifiable côté serveur, et un participant techniquement averti pourrait inspecter le bundle JS pour retrouver les réponses — ceci est inhérent à toute application 100 % statique et est documenté plutôt que dissimulé.
- Le mélange des questions/options est généré côté client à chaque lancement ; il n'est pas déterministe ni reproductible d'une session à l'autre (voulu).
- La récupération après refresh utilise le `localStorage` du navigateur : un changement d'appareil ou un nettoyage du cache navigateur perd la session en cours.

## Personnalisation du design

- Palette et typographie : `src/styles/tokens.css` (variables CSS `--bg-*`, `--accent-*`, `--font-*`).
- Composants partagés (boutons, cartes, timer, options) : `src/styles/components.css`.
- Logo : aucun logo officiel n'a été fourni. Un traitement typographique (`STEM × ROBOTICS`) est utilisé à sa place dans `src/components/BrandMark.jsx`. Pour utiliser un vrai logo, renseignez `QUIZ_CONFIG.event.logoUrl` (image placée dans `public/assets/`).

## Structure du projet

```
stem-robotics-final-quiz/
├── .github/workflows/deploy.yml   # Déploiement GitHub Pages automatique
├── public/
│   ├── favicon.svg
│   └── assets/                    # Emplacement pour le logo officiel
├── src/
│   ├── components/                 # BrandMark, Timer, ProgressBar, QuestionDots, ErrorBoundary
│   ├── pages/                      # Landing, Identification, Confirmation, QuizRunning,
│   │                                # Submission, Result, Review, RecoveryPrompt
│   ├── data/questions.js           # Les 50 questions (contenu figé)
│   ├── hooks/                      # useQuizEngine (machine d'état), useQuizTimer
│   ├── services/                   # scoring, storage, leaderboard
│   ├── utils/shuffle.js            # Mélange fiable Fisher–Yates
│   ├── config/quizConfig.js        # Configuration centrale
│   ├── styles/                     # Design system (tokens + composants)
│   ├── tests/                      # Suite de tests Vitest
│   └── App.jsx
├── vite.config.js
├── vitest.config.js
└── package.json
```

## Licence

Projet livré pour un usage interne au Camp STEM & Robotique. Adaptez cette section selon vos besoins (ex. MIT) avant publication publique du dépôt.
