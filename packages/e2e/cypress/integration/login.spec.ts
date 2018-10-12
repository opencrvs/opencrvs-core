/// <reference types="Cypress" />

context('Login', () => {
  before(function() {
    // remove all resources cached by the service worker for a fresh run
    return window.caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return window.caches.delete(cacheName)
        })
      )
    })
  })

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
    cy.location('search').should('match', /\?token=.*/)
  })
})
