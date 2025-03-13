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
    cy.checkDataCy('main-nav').should('exist')
    cy.checkDataCy('nav-home').should('exist').and('contain', 'Accueil')
    cy.checkDataCy('nav-features').should('exist').and('contain', 'Fonctionnalités')
    cy.checkDataCy('nav-docs').should('exist').and('contain', 'Documentation')
    cy.checkDataCy('login-button').should('exist').and('contain', 'Connexion')
  })

  it('Vérifie les éléments de la section hero', () => {
    cy.checkDataCy('hero-section').should('exist')
    cy.checkDataCy('hero-title').should('exist').and('contain', 'Tests automatisés avec Cypress')
    cy.checkDataCy('hero-description').should('exist')
    cy.checkDataCy('start-button').should('exist').and('contain', 'Commencer')
    cy.checkDataCy('demo-button').should('exist').and('contain', 'Voir la démo')
    cy.checkDataCy('stats-card').should('exist')
    cy.checkDataCy('tests-count').should('exist')
    cy.checkDataCy('screenshots-count').should('exist')
    cy.checkDataCy('duration-info').should('exist')
    cy.checkDataCy('terminal-display').should('exist')
    cy.checkDataCy('test-status').should('exist')
  })

  it('Vérifie les éléments de la section fonctionnalités', () => {
    cy.checkDataCy('features-section').should('exist')
    cy.checkDataCy('features-title').should('exist').and('contain', 'Fonctionnalités principales')
    
    // Vérification des cartes de fonctionnalités
    for (let i = 1; i <= 3; i++) {
      cy.checkDataCy(`feature-card-${i}`).should('exist')
      cy.checkDataCy(`feature-title-${i}`).should('exist')
      cy.checkDataCy(`feature-desc-${i}`).should('exist')
    }
  })

  it('Vérifie les éléments de la section documentation', () => {
    cy.checkDataCy('documentation-section').should('exist')
    cy.checkDataCy('documentation-title').should('exist').and('contain', 'Documentation rapide')
    cy.checkDataCy('documentation-content').should('exist')
    cy.checkDataCy('installation-block').should('exist')
    cy.checkDataCy('installation-code').should('exist')
    cy.checkDataCy('execution-block').should('exist')
    cy.checkDataCy('execution-code').should('exist')
    cy.checkDataCy('github-actions-block').should('exist')
    cy.checkDataCy('github-actions-code').should('exist')
  })

  it('Vérifie les éléments du footer', () => {
    cy.checkDataCy('footer').should('exist')
    cy.checkDataCy('footer-title').should('exist').and('contain', 'CypressDemo')
    cy.checkDataCy('footer-description').should('exist')
    cy.checkDataCy('social-links').should('exist')
    cy.checkDataCy('github-link').should('exist')
    cy.checkDataCy('twitter-link').should('exist')
    cy.checkDataCy('linkedin-link').should('exist')
    cy.checkDataCy('copyright').should('exist').and('contain', '© 2025')
  })

  it('Vérifie les interactions de base', () => {
    // Test du bouton Commencer qui doit faire défiler jusqu'à la section documentation
    cy.checkDataCy('start-button').click()
    // Vérifier que la section documentation est visible
    cy.checkDataCy('documentation-section').should('be.visible')
    
    // Test du bouton démo qui doit afficher une alerte
    cy.checkDataCy('demo-button').click()
    // Cypress gère automatiquement les alertes, donc pas besoin de les confirmer
  })
}) 