/// <reference types="Cypress" />

context('Register', () => {
  beforeEach(() => {
    cy.login('fieldWorker')
  })

  it('fills in all data into the register form', () => {
    cy.visit(`${Cypress.env('REGISTER_URL')}events`)
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#select_parent_informant').click()
    cy.get('#childGivenName').type('গায়ত্রী')
    cy.get('#childMiddleNames').type('চক্রবর্তী')
    cy.get('#childFamilyName').type('স্পিভক')
    cy.get('#childGivenNameEng').type('Gayatri')
    cy.get('#childMiddleNamesEng').type('Chakravorty')
    cy.get('#childFamilyNameEng').type('Spivak')
    cy.selectOption('#childSex', 'Female', 'Female')
  })
})
