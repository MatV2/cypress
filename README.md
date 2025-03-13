# Guide de mise en place de Cypress avec GitHub Actions

Ce dépôt est un exemple pratique d'intégration de Cypress avec GitHub Actions pour l'automatisation des tests d'interface utilisateur, avec la fonctionnalité de capture d'écran et la création automatique d'issues en cas d'échec des tests.

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
const fs = require('fs')
const path = require('path')

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
      
      // Créer un dossier pour les logs s'il n'existe pas
      const logsFolder = path.join(__dirname, 'cypress', 'logs')
      if (!fs.existsSync(logsFolder)) {
        fs.mkdirSync(logsFolder, { recursive: true })
      }

      // Configurer les logs pour chaque test
      on('before:spec', (spec) => {
        const specName = path.basename(spec.name, path.extname(spec.name))
        const logFilePath = path.join(logsFolder, `${specName}_${new Date().toISOString().replace(/:/g, '-')}.log`)
        
        // Créer un fichier de log pour ce test
        fs.writeFileSync(logFilePath, `Test démarré: ${spec.name}\n`)
        
        // Ajouter le chemin du fichier de log à la configuration
        config.env = config.env || {}
        config.env.logFilePath = logFilePath
        
        return config
      })

      // Enregistrer les erreurs de test
      on('test:after:run', (results, runnable) => {
        if (results.state === 'failed' && config.env.logFilePath) {
          fs.appendFileSync(
            config.env.logFilePath,
            `\nTest échoué: ${runnable.title}\nErreur: ${results.error}\n`
          )
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

### Test de validation des attributs data-cy

Nous avons également un test spécifique pour valider la présence des attributs data-cy dans le HTML:

```javascript
// cypress/e2e/data_cy_validation.cy.js

describe('Validation des attributs data-cy', () => {
  beforeEach(() => {
    // Visite la page d'accueil avant chaque test
    cy.visit('/')
    // Attente que la page soit chargée
    cy.wait(1000)
  })

  it('Vérifie les éléments du header', () => {
    cy.checkDataCy('header').should('exist')
    cy.checkDataCy('app-title').should('exist').and('contain', 'CypressDemo')
    // ... autres vérifications
  })

  // ... autres tests pour différentes sections
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

// Amélioration des logs pour les attributs data-cy manquants
Cypress.on('fail', (error, runnable) => {
  // Vérifier si l'erreur concerne un attribut data-cy manquant
  if (error.message.includes('[data-cy=') || error.message.includes('[data-cy="')) {
    // Extraire le nom de l'attribut data-cy
    const dataCyMatch = error.message.match(/\[data-cy="?([^"\]]+)"?\]/);
    const dataCyName = dataCyMatch ? dataCyMatch[1] : 'inconnu';
    
    // Créer un message d'erreur plus détaillé
    const enhancedMessage = `Attribut data-cy manquant: "${dataCyName}". ${error.message}`;
    
    // Enregistrer l'erreur dans le fichier de log si disponible
    if (Cypress.env('logFilePath')) {
      const fs = require('fs');
      fs.appendFileSync(
        Cypress.env('logFilePath'),
        `\nErreur d'attribut data-cy: ${enhancedMessage}\n`
      );
    }
    
    // Afficher l'erreur dans la console
    console.error(`ERREUR DATA-CY: ${enhancedMessage}`);
    
    // Remplacer le message d'erreur original
    error.message = enhancedMessage;
  }
  
  // Laisser Cypress gérer l'erreur normalement
  throw error;
})

// Commande personnalisée pour vérifier les attributs data-cy
Cypress.Commands.add('checkDataCy', (selector, options = {}) => {
  return cy.get(`[data-cy="${selector}"]`, options);
})
```

## 🔄 Intégration avec GitHub Actions

Pour automatiser vos tests Cypress avec GitHub Actions et créer des issues en cas d'échec, créez un fichier `.github/workflows/cypress.yml` :

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
        id: cypress
        uses: cypress-io/github-action@v6
        with:
          build: npm run build
          start: npm start
          wait-on: 'http://localhost:3000'
          wait-on-timeout: 120
        continue-on-error: true
      
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
      
      - name: Create Issue on Test Failure
        if: steps.cypress.outcome == 'failure'
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const fs = require('fs');
            const path = require('path');
            
            // Fonction pour extraire les erreurs des logs Cypress
            function extractCypressErrors() {
              let errors = [];
              
              try {
                // Chercher les fichiers de logs Cypress
                const logsDir = path.join(process.env.GITHUB_WORKSPACE, 'cypress', 'logs');
                if (fs.existsSync(logsDir)) {
                  const logFiles = fs.readdirSync(logsDir).filter(file => file.endsWith('.log'));
                  
                  for (const logFile of logFiles) {
                    const logContent = fs.readFileSync(path.join(logsDir, logFile), 'utf8');
                    
                    // Extraire les erreurs liées aux attributs data-cy manquants
                    const dataCyErrors = logContent.match(/Expected to find element: \'\[data-cy="[^"]+"\]\'[^\n]*/g) || [];
                    errors = errors.concat(dataCyErrors);
                  }
                }
              } catch (error) {
                console.error('Erreur lors de l\'extraction des erreurs Cypress:', error);
              }
              
              return errors.length > 0 ? errors : ['Des tests Cypress ont échoué, mais les détails spécifiques ne sont pas disponibles.'];
            }
            
            // Créer un titre pour l'issue
            const title = `🐞 Échec des tests Cypress - Attributs data-cy manquants`;
            
            // Extraire les erreurs des logs Cypress
            const errors = extractCypressErrors();
            
            // Créer le corps de l'issue
            const body = `## Échec des tests Cypress
            
            Des attributs data-cy requis sont manquants dans le code HTML. Ces attributs sont nécessaires pour les tests automatisés.
            
            ### Erreurs détectées:
            
            ${errors.map(error => `- ${error}`).join('\n')}
            
            ### Informations sur l'exécution:
            
            - **Workflow:** ${process.env.GITHUB_WORKFLOW}
            - **Commit:** ${process.env.GITHUB_SHA}
            - **Branche:** ${process.env.GITHUB_REF}
            - **Exécuté par:** ${process.env.GITHUB_ACTOR}
            - **Date:** ${new Date().toISOString()}
            
            ### Comment résoudre ce problème:
            
            1. Vérifiez que tous les éléments HTML requis ont les attributs data-cy appropriés
            2. Consultez le fichier de test \`cypress/e2e/data_cy_validation.cy.js\` pour voir la liste complète des attributs data-cy attendus
            3. Corrigez les attributs manquants et poussez les modifications
            
            [Voir les détails de l'exécution du workflow](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID})
            `;
            
            // Créer l'issue
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: title,
              body: body,
              labels: ['bug', 'cypress', 'data-cy', 'automated']
            });
      
      - name: Check Cypress Test Results
        if: always()
        run: |
          if [ "${{ steps.cypress.outcome }}" == "failure" ]; then
            echo "❌ Les tests Cypress ont échoué. Une issue a été créée."
            exit 1
          else
            echo "✅ Tous les tests Cypress ont réussi!"
          fi
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
4. Si des tests ont échoué, une issue sera automatiquement créée avec les détails des erreurs

## 🔍 Attributs data-cy

Les attributs `data-cy` sont utilisés comme sélecteurs stables pour les tests Cypress. Ils permettent de cibler précisément les éléments HTML sans dépendre de classes CSS ou d'autres attributs qui pourraient changer.

### Liste des attributs data-cy requis

Voici les attributs data-cy qui doivent être présents dans votre HTML :

#### Header
- `data-cy="header"`
- `data-cy="app-title"`
- `data-cy="main-nav"`
- `data-cy="nav-home"`
- `data-cy="nav-features"`
- `data-cy="nav-docs"`
- `data-cy="login-button"`

#### Section Hero
- `data-cy="hero-section"`
- `data-cy="hero-title"`
- `data-cy="hero-description"`
- `data-cy="start-button"`
- `data-cy="demo-button"`
- `data-cy="stats-card"`
- `data-cy="tests-count"`
- `data-cy="screenshots-count"`
- `data-cy="duration-info"`
- `data-cy="terminal-display"`
- `data-cy="test-status"`

#### Section Fonctionnalités
- `data-cy="features-section"`
- `data-cy="features-title"`
- `data-cy="feature-card-1"`, `data-cy="feature-card-2"`, `data-cy="feature-card-3"`
- `data-cy="feature-title-1"`, `data-cy="feature-title-2"`, `data-cy="feature-title-3"`
- `data-cy="feature-desc-1"`, `data-cy="feature-desc-2"`, `data-cy="feature-desc-3"`

#### Section Documentation
- `data-cy="documentation-section"`
- `data-cy="documentation-title"`
- `data-cy="documentation-content"`
- `data-cy="installation-block"`
- `data-cy="installation-code"`
- `data-cy="execution-block"`
- `data-cy="execution-code"`
- `data-cy="github-actions-block"`
- `data-cy="github-actions-code"`

#### Footer
- `data-cy="footer"`
- `data-cy="footer-title"`
- `data-cy="footer-description"`
- `data-cy="social-links"`
- `data-cy="github-link"`
- `data-cy="twitter-link"`
- `data-cy="linkedin-link"`
- `data-cy="copyright"`

### Exemple d'utilisation dans le HTML

```html
<header data-cy="header">
  <h1 data-cy="app-title">CypressDemo</h1>
  <nav data-cy="main-nav">
    <a href="#" data-cy="nav-home">Accueil</a>
  </nav>
</header>
```

## 🔧 Personnalisation

- **Adapter le baseUrl** : Modifiez `baseUrl` dans `cypress.config.js` pour correspondre à l'URL de votre environnement de développement.
- **Commandes personnalisées** : Ajoutez des commandes personnalisées dans `cypress/support/commands.js`
- **Configuration CI/CD** : Ajustez `.github/workflows/cypress.yml` selon vos besoins de déploiement.
- **Attributs data-cy** : Ajoutez ou modifiez les attributs data-cy selon la structure de votre HTML.

## 📝 Bonnes pratiques

- Utilisez systématiquement des attributs `data-cy` pour les éléments que vous souhaitez tester
- Organisez les tests par fonctionnalités
- Utilisez les captures d'écran stratégiquement pour documenter l'état de l'application
- Intégrez les tests Cypress dans votre workflow de développement quotidien
- Consultez les issues créées automatiquement pour identifier rapidement les problèmes

## 🚨 Dépannage

- **Problèmes de timeout** : Augmentez la valeur de `wait-on-timeout` dans le workflow GitHub Actions
- **Tests inconsistants** : Utilisez `cy.wait()` pour attendre le chargement des éléments complexes
- **Captures d'écran manquantes** : Vérifiez que `screenshotOnRunFailure` est activé dans la configuration
- **Attributs data-cy manquants** : Consultez les issues créées automatiquement pour identifier les attributs manquants

---
