// cypress.config.js
const { defineConfig } = require('cypress')
const fs = require('fs')
const path = require('path')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
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
    // Activation des captures d'écran
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
  // Configuration des captures d'écran
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  downloadsFolder: 'cypress/downloads',
  fixturesFolder: 'cypress/fixtures',
})