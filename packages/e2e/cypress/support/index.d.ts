declare namespace Cypress {
  interface Chainable {
    login: (userType: string) => void
    selectOption: (selector: string, text: string, option: string) => void
  }
}
