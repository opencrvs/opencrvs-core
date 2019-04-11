/// <reference types="Cypress" />

context('Menu', () => {
  beforeEach(() => {
    cy.login('fieldWorker')
  })

  it('Opens menu and selects Bengali', () => {
    if (!cy.get('#createPinBtn').should('not.exist')) {
      cy.get('#createPinBtn').click()
      for (let i = 0; i < 8; i++) {
        cy.get('#keypad-1').click()
      }
    }
    cy.get('#sub-menu', { timeout: 30000 }).click()
    cy.get('#ChangeLanguage-nested-menu').click()
    cy.get('#English-nested-menu-item')
      .contains('English')
      .click()

    cy.get('#new_event_declaration').should('be.visible')
  })
})
