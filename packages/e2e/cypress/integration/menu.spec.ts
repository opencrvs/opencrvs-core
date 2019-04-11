/// <reference types="Cypress" />

context('Menu', () => {
  beforeEach(() => {
    cy.login('fieldWorker')
  })

  it('Opens menu and selects Bengali', () => {
    cy.get('#sub-menu', { timeout: 30000 }).click()
    cy.get('#ChangeLanguage-nested-menu').click()
    cy.get('#English-nested-menu-item')
      .contains('English')
      .click()

    cy.get('#new_event_declaration').should('be.visible')
  })
})
