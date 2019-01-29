/// <reference types="Cypress" />

context('Menu', () => {
  beforeEach(() => {
    cy.login('fieldWorker')
  })

  it('Opens menu and selects Bengali', () => {
    cy.visit(`${Cypress.env('REGISTER_URL')}events`)

    cy.wait(5000)
    // CHILD DETAILS

    cy.get('#sub-menu').click()
    //Click on change Lanuage
    cy.get('#ChangeLanguage-nested-menu').click()
    // select Bengali
    cy.get('#Bengali-nested-menu-item')
      .contains('Bengali')
      .click()

    cy.get('#select_vital_event_view').should('be.visible')
  })
})
