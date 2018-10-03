declare namespace Cypress {
  interface Chainable {
    login: (userType: string) => void
  }
}
