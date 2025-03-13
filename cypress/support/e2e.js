// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
// import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test when exceptions occur in the application
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