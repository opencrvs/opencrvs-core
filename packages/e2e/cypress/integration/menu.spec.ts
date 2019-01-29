/// <reference types="Cypress" />

context('Menu', () => {
  beforeEach(() => {
    cy.login('fieldWorker')
  })

  it('Opens menu and selects Bengali', () => {
    cy.wait(60000)
    cy.get('#sub-menu').click()
    //Click on change Language
    cy.get('#ChangeLanguage-nested-menu').click()
    // select Bengali
    cy.get('#Bengali-nested-menu-item')
      .contains('Bengali')
      .click()

    cy.get('#new_event_declaration').should('be.visible')
  })
})
