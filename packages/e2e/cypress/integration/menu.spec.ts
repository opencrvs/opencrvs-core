/// <reference types="Cypress" />

context('Menu', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('LOGIN_URL'))
  })

  it('Opens menu and selects Bengali', () => {
    cy.get('#mobile').type('01711111111')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#code1').type('0')
    cy.get('#code2').type('0')
    cy.get('#code3').type('0')
    cy.get('#code4').type('0')
    cy.get('#code5').type('0')
    cy.get('#code6').type('0')

    cy.get('#login-mobile-submit').click()
    cy.location('search').should('match', /\?token=.*/)
    cy.wait(1000)
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
