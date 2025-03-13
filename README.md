# Guide de mise en place de Cypress avec GitHub Actions

Ce dépôt est un exemple pratique d'intégration de Cypress avec GitHub Actions pour l'automatisation des tests d'interface utilisateur, avec la fonctionnalité de capture d'écran. Suivez ce guide pour mettre en place Cypress sur votre propre projet front-end.

## 📋 Prérequis

- Node.js version 14 ou supérieure
- npm ou yarn
- Un projet front-end existant 
- Un dépôt GitHub (pour l'intégration CI/CD)

## 🚀 Installation de Cypress

1. **Installez Cypress en tant que dépendance de développement :**

```bash
npm install cypress --save-dev
# ou avec yarn
yarn add cypress --dev
```

2. **Ajoutez les scripts nécessaires à votre `package.json` :**

```json
"scripts": {
  "cypress:open": "cypress open",
  "cypress:run": "cypress run",
  "test": "cypress run"
}
```

3. **Initialisez Cypress pour créer les dossiers et fichiers de configuration :**

```bash
npx cypress open
```

Cette commande va générer la structure de base de Cypress dans votre projet.

## ⚙️ Configuration de Cypress

Créez ou modifiez le fichier `cypress.config.js` à la racine de votre projet:

```javascript
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Adaptez à l'URL de votre application
    setupNodeEvents(on, config) {
      // Implémentez les événements node ici si nécessaire
      on('task', {
        log(message) {
          console.log(message)
          return null
        }
      })
    },
    // Configuration des captures d'écran
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
  // Configuration des dossiers
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  downloadsFolder: 'cypress/downloads',
  fixturesFolder: 'cypress/fixtures',
})
```

## 📁 Structure des fichiers de test

Organisez vos tests dans le dossier `cypress/e2e`. Voici un exemple de test avec capture d'écran:

```javascript
// cypress/e2e/capture_screenshots.cy.js

describe('Capture d\'écran CI/CD', () => {
    it('Prend une capture d\'écran de la page d\'accueil', () => {
      // Visite une page
      cy.visit('/')
      
      // Attente que la page soit chargée
      cy.wait(1000)
      
      // Prise de capture d'écran
      cy.screenshot('page-accueil')
      
      // Interaction avec un élément
      cy.get('body').then($body => {
        // Vérification conditionnelle
        if ($body.find('#login-button').length > 0) {
          cy.get('#login-button').click()
          cy.screenshot('apres-clic-connexion')
        } else {
          cy.log('Élément #login-button non trouvé, mais le test continue')
          cy.screenshot('page-sans-bouton-connexion')
        }
      })
    })
    
    it('Simule un processus de CI/CD', () => {
      // Autres étapes avec captures d'écran
      cy.log('Simulation: Étape de déploiement')
      cy.screenshot('etape-deploiement')
      
      cy.log('Simulation: Étape de tests')
      cy.screenshot('etape-tests')
      
      cy.log('Simulation: Étape finale')
      cy.screenshot('etape-finale')
    })
})
```

## 🛠️ Configuration des fichiers de support

Dans le dossier `cypress/support`, créez ou modifiez le fichier `e2e.js` :

```javascript
// cypress/support/e2e.js

// Configuration globale
Cypress.on('uncaught:exception', (err, runnable) => {
  // Empêche Cypress d'échouer lorsque des exceptions 
  // se produisent dans l'application
  return false
})

// Importez d'autres commandes personnalisées au besoin
// import './commands'
```

## 🔄 Intégration avec GitHub Actions

Pour automatiser vos tests Cypress avec GitHub Actions, créez un fichier `.github/workflows/cypress.yml` :

```yaml
name: Cypress Screenshots CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:
    # Permet de déclencher manuellement le workflow

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
      
      - name: Install Dependencies
        run: npm install
      
      - name: Cypress run
        uses: cypress-io/github-action@v6
        with:
          build: npm run build
          start: npm start
          wait-on: 'http://localhost:3000'
          wait-on-timeout: 120
      
      - name: Upload Screenshots
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
          retention-days: 30
      
      - name: Generate Screenshot Report
        if: always()
        run: |
          echo "## Cypress Screenshots Report" > screenshot-report.md
          echo "Screenshots générées pendant les tests Cypress" >> screenshot-report.md
          find cypress/screenshots -type f -name "*.png" | while read -r file; do
            echo "- $(basename "$file")" >> screenshot-report.md
          done
      
      - name: Upload Screenshot Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: screenshot-report
          path: screenshot-report.md
          retention-days: 30
```

## 🧪 Exécution des tests

### Localement

Pour exécuter les tests en mode interactif :
```bash
npm run cypress:open
```

Pour exécuter les tests en mode headless :
```bash
npm run cypress:run
```

### Via GitHub Actions

Les tests s'exécuteront automatiquement lors des pushes ou pull requests sur la branche main, ou manuellement via l'interface GitHub Actions.

## 📊 Exploitation des résultats

Après l'exécution des tests via GitHub Actions :

1. Accédez à l'onglet "Actions" de votre dépôt GitHub
2. Cliquez sur l'exécution de workflow correspondante
3. Téléchargez les artefacts générés :
   - `cypress-screenshots` : contient toutes les captures d'écran
   - `screenshot-report` : contient un rapport markdown listant les captures d'écran

## 🔧 Personnalisation

- **Adapter le baseUrl** : Modifiez `baseUrl` dans `cypress.config.js` pour correspondre à l'URL de votre environnement de développement.
- **Commandes personnalisées** : Ajoutez des commandes personnalisées dans `cypress/support/commands.js`
- **Configuration CI/CD** : Ajustez `.github/workflows/cypress.yml` selon vos besoins de déploiement.

## 📝 Bonnes pratiques

- Écrivez des sélecteurs CSS solides en utilisant des attributs data-* dédiés aux tests
- Organisez les tests par fonctionnalités
- Utilisez les captures d'écran stratégiquement pour documenter l'état de l'application
- Intégrez les tests Cypress dans votre workflow de développement quotidien

## 🚨 Dépannage

- **Problèmes de timeout** : Augmentez la valeur de `wait-on-timeout` dans le workflow GitHub Actions
- **Tests inconsistants** : Utilisez `cy.wait()` pour attendre le chargement des éléments complexes
- **Captures d'écran manquantes** : Vérifiez que `screenshotOnRunFailure` est activé dans la configuration

---
