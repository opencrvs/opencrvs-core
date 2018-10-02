/// <reference types="Cypress" />

context('Register', () => {
  beforeEach(() => {
    cy.login('fieldWorker')
  })

  it('fills in all data into the register form', () => {
    cy.visit(`${Cypress.env('REGISTER_URL')}`)
    cy.get('#register').should('be.visible')
  })
})
