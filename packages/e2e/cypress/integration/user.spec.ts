/// <reference types="Cypress" />

context('User Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('Create user as SYSTEM ADMIN', () => {
    cy.login('sysAdmin')
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn', { timeout: 30000 }).click()
    for (let i = 1; i <= 8; i++) {
      cy.get(`#keypad-${i % 2}`).click()
    }
    cy.get('#add-user').click()
    cy.get('#firstNames').type('নাইম')
    cy.get('#familyName').type('আহমেদ')
    cy.get('#firstNamesEng').type('Naeem')
    cy.get('#familyNameEng').type('Ahmed')
    cy.get('#phoneNumber').type('01756987123')
    cy.get('#nid').type('1994756324786')
    cy.get('#role')
    cy.selectOption('#role', 'Field Agent', 'Field Agent')
    cy.selectOption('#type', 'Hospital', 'Hospital')
    cy.get('#device').type('Xiamoi MI 8')
    cy.get('#searchInputText').type('Moktarpur')
    cy.get('#searchInputIcon').click()
    cy.get('#location-0').click()
    cy.get('#modal_select').click()
    cy.get('#confirm_form').click()
    cy.get('#submit_user_form').click()
    cy.log('Waiting for application to sync...')
    cy.wait(5000) // Wait for application to be sync'd
    // LOG OUT
    cy.get('#mobile_header_left').click()
    cy.get('#mobile_menu_item_3').click()
  })

  it('To activate account login for the first time as FIELD AGENT', () => {
    cy.visit(Cypress.env('LOGIN_URL'))
    cy.get('#username').type('n.ahmed')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#user-setup-start-button').click()
    cy.get('#NewPassword').type('Test0000')
    cy.get('#ConfirmPassword').type('Test0000')
    cy.get('#Continue').click()
    cy.get('#question-0').should('exist')
    cy.selectOption(
      '#question-0',
      'What city were you born in?',
      'What city were you born in?'
    )
    cy.get('#answer-0').type('Dhaka')
    cy.get('#question-1').should('exist')
    cy.selectOption(
      '#question-1',
      'What is your favorite movie?',
      'What is your favorite movie?'
    )
    cy.get('#answer-1').type('Dilwale Dulhania Le Jayenge')
    cy.get('#question-2').should('exist')
    cy.selectOption(
      '#question-2',
      'What is your favorite food?',
      'What is your favorite food?'
    )
    cy.get('#answer-2').type('Burger')
    cy.get('#submit-security-question').click()
    cy.get('#Confirm').click()
    cy.get('#setup-login-button').click()
  })
})
