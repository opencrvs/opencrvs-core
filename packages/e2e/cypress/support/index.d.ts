declare namespace Cypress {
  interface Chainable {
    login: (userType: string) => void
    logout: () => void
    selectOption: (selector: string, text: string, option: string) => void
  }
}
