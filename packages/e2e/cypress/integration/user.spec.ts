/// <reference types="Cypress" />

context('User Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('create user as SYSTEM ADMIN and to activate account login for the first time as FIELD AGENT', () => {
    // LOG IN AS SYSTEM ADMIN
    cy.login('sysAdmin')
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn', { timeout: 30000 }).click()
    for (let i = 1; i <= 8; i++) {
      cy.get('#pin-keypad-container')
        .click()
        .type(`${i % 2}`)
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
    // PREVIEW
    cy.get('#submit_user_form').click()
    cy.wait(5000) // Wait for application to be sync'd
    // LOG OUT
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
    // LOG IN AS FIELD AGENT
    cy.get('#username').type('n.ahmed')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#user-setup-start-button').click()
    cy.get('#NewPassword').type('Test0000')
    cy.get('#ConfirmPassword').type('Test0000')
    cy.get('#Continue').click()
    // SECURITY QUESTIONS
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
    // PREVIEW
    cy.get('#Confirm').click()
    // WELCOME MESSAGE
    cy.get('#setup-login-button').click()
  })
})
