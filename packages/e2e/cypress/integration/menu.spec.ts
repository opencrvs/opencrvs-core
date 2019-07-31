/// <reference types="Cypress" />

context('Menu', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it.skip('Opens menu and selects Bengali', () => {
    cy.login('fieldWorker')
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn', { timeout: 30000 }).click()
    for (let i = 1; i <= 8; i++) {
      cy.get(`#keypad-${i % 2}`).click()
    }

    cy.get('#new_event_declaration').should('be.visible')
  })
})
