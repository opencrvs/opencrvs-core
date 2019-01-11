/// <reference types="Cypress" />

context('Register', () => {
  beforeEach(() => {
    cy.login('fieldWorker')
  })

  it('fills in all data into the register form', () => {
    cy.visit(`${Cypress.env('REGISTER_URL')}events`)
    // CHILD DETAILS

    cy.get('#sub-menu').click()
    //Click on change Lanuage
    cy.get('#ChangeLanguage-nested-menu').click();
    // select Bengali
    cy.get('#Bengali-nested-menu-item').contains('Bengali').click()

    cy.get('#select_vital_event_view').should('be.visible')

    })
  })
