/// <reference types="Cypress" />

context('Menu', () => {
  beforeEach(() => {
    cy.login('fieldWorker')
  })

  it('Opens menu and selects Bengali', () => {
    cy.get('#sub-menu').click()
    cy.get('#ChangeLanguage-nested-menu').click()
    cy.get('#Bengali-nested-menu-item')
      .contains('Bengali')
      .click()

    cy.get('#new_event_declaration').should('be.visible')
  })
})
