/// <reference types="Cypress" />

context('Register', () => {
    beforeEach(() => {
      cy.login('fieldWorker')
    })

    it('fills in all data into the register form', () => {
      cy.visit(`${Cypress.env('REGISTER_URL')}events`)
      // CHILD DETAILS


    cy.get('[class*=rc-menu-submenu-title]').click()

    cy.get('[class*="rc-menu-submenu rc-menu-submenu-inline sc-cvbbAY ddroTi"]').click()


    cy.get('[class*="rc-menu-item sc-jWBwVP hSJvqg"]')
    cy.get('[class*="rc-menu rc-menu-sub rc-menu-inline"]')
    cy.get('[class*="rc-menu-item sc-jWBwVP hSJvqg"]').contains('Bengali').click()

    })
  })
