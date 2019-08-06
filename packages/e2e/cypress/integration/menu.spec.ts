/// <reference types="Cypress" />

context('Menu', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('Opens menu and selects Bengali', () => {
    cy.login('fieldWorker')
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn', { timeout: 30000 }).click()
    for (let i = 1; i <= 8; i++) {
      cy.get('#pin-keypad-container')
        .click()
        .type(`${i % 2}`)
    }

    cy.get('#header_new_event').should('be.visible')
  })
})
