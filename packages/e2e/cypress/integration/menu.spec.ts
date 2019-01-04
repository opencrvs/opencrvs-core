/// <reference types="Cypress" />

context('Login', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('LOGIN_URL'))
  })

  it('takes user to the registration app once correct credentials are given', () => {
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

    cy.get('#new_event_declaration').click()

    //it('fills in all data into the register form', () => {
    //  cy.visit(`${Cypress.env('REGISTER_URL')}events`)
      // CHILD DETAILS

    cy.get('[class*=rc-menu-submenu-title]').click()

    //Click on change Lanuage
    cy.get('[class*="rc-menu-submenu rc-menu-submenu-inline sc-cMljjf eKDCjU"]').click()
    // select Bengali
    cy.get('[class*="rc-menu-item sc-jAaTju filVPB"]').contains('Bengali').click()

    cy.get('#select_vital_event_view').should('be.visible')

    })
  })
