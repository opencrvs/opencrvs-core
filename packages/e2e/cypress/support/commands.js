// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (userType, options = {}) => {
  const users = {
    fieldWorker: {
      mobile: '+8801711111111',
      password: 'test'
    },
    registrar: {
      mobile: '+8801733333333',
      password: 'test'
    }
  }
  const user = users[userType]
  cy.request({
    url: `${Cypress.env('AUTH_URL')}authenticate`,
    method: 'POST',
    body: {
      mobile: user.mobile,
      password: user.password
    }
  })
    .its('body')
    .then(body => {
      cy.request({
        url: `${Cypress.env('AUTH_URL')}verifyCode`,
        method: 'POST',
        body: {
          nonce: body.nonce,
          code: '000000'
        }
      })
        .its('body')
        .then(body => {
          cy.visit(`${Cypress.env('REGISTER_URL')}?token=${body.token}`)
        })
    })

  // Wait for app to load so token can be stored
  cy.wait(3000)
})

Cypress.Commands.add('selectOption', (selector, text, option) => {
  cy.get(`${selector} input`)
    .first()
    .click({ force: true })
    .type(text, { force: true })
    .get(`${selector} .react-select__menu`)
    .contains(option)
    .click()
})
