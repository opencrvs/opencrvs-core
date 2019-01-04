/// <reference types="Cypress" />

context('Register', () => {
    beforeEach(() => {
      cy.login('fieldWorker')
    })

    it('fills in all data into the register form', () => {
      cy.visit(`${Cypress.env('REGISTER_URL')}events`)
      // CHILD DETAILS

    cy.get('[class*=rc-menu-submenu-title]').click()

    //Click on change Lanuage
    cy.get('[class*="rc-menu-submenu rc-menu-submenu-inline sc-cMljjf eKDCjU"]').click()
    // select Bengali
    cy.get('[class*="rc-menu-item sc-jAaTju filVPB"]').contains('Bengali').click()

    cy.get('#select_vital_event_view').should('be.visible')

    })
  })
