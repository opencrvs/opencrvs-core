/// <reference types="Cypress" />

context('Register', () => {
  beforeEach(() => {
    cy.login('fieldWorker')
  })

  it('fills in all data into the register form', () => {
    // CHILD DETAILS
    cy.get('#new_event_declaration', { timeout: 30000 }).should('be.visible')
    cy.get('#new_event_declaration').click()
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#select_parent_informant').click()
  })
})
