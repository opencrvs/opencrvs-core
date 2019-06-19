/// <reference types="Cypress" />

context('Birth Registration Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })
  it('Tests from application to registration', () => {
    cy.login('fieldWorker')
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn').click()
    for (let i = 1; i <= 8; i++) {
      cy.get(`#keypad-${i % 2}`).click()
    }
    cy.get('#new_event_declaration', { timeout: 30000 }).should('be.visible')
    cy.get('#new_event_declaration').click()
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#continue').click()
    cy.get('#select_parent_informant').click()
    // APPLICATION FORM
    // CHILD DETAILS
    cy.get('#firstNames').type('গায়ত্রী')
    cy.get('#familyName').type('স্পিভক')
    cy.get('#firstNamesEng').type('Gayatri')
    cy.get('#familyNameEng').type('Spivak')
    cy.selectOption('#gender', 'Female', 'Female')
    cy.get('#childBirthDate-dd').type('01')
    cy.get('#childBirthDate-mm').type('08')
    cy.get('#childBirthDate-yyyy').type('2018')
    cy.selectOption('#attendantAtBirth', 'Midwife', 'Midwife')
    cy.selectOption('#birthType', 'Single', 'Single')
    cy.get('#multipleBirth').type('1')
    cy.get('#weightAtBirth').type('1')
    cy.selectOption('#placeOfBirth', 'Hospital', 'Hospital')
    cy.wait(1000)
    cy.get('#next_section').click()
    // MOTHER DETAILS
    cy.selectOption('#iDType', 'National ID', 'National ID')
    cy.get('#iD').type('1234567898765')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.get('#firstNames').type('গায়ত্রী')
    cy.get('#familyName').type('স্পিভক')
    cy.get('#firstNamesEng').type('Gayatri')
    cy.get('#familyNameEng').type('Spivak')
    cy.get('#motherBirthDate-dd').type('01')
    cy.get('#motherBirthDate-mm').type('08')
    cy.get('#motherBirthDate-yyyy').type('2010')
    cy.selectOption('#maritalStatus', 'Married', 'Married')
    cy.get('#dateOfMarriage-dd').type('01')
    cy.get('#dateOfMarriage-mm').type('08')
    cy.get('#dateOfMarriage-yyyy').type('2018')
    cy.selectOption(
      '#educationalAttainment',
      'Upper secondary',
      'Upper secondary'
    )
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3Permanent', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2Permanent').type('My street')
    cy.get('#addressLine1Permanent').type('40')
    cy.get('#postCodePermanent').type('1024')
    cy.wait(1000)
    cy.get('#next_section').click()
    // FATHER DETAILS
    cy.get('#fathersDetailsExist_true').click()
    cy.selectOption('#iDType', 'National ID', 'National ID')
    cy.get('#iD').type('1234567898765')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.get('#firstNames').type('গায়ত্রী')
    cy.get('#familyName').type('স্পিভক')
    cy.get('#firstNamesEng').type('Gayatri')
    cy.get('#familyNameEng').type('Spivak')
    cy.get('#fatherBirthDate-dd').type('01')
    cy.get('#fatherBirthDate-mm').type('08')
    cy.get('#fatherBirthDate-yyyy').type('2010')
    cy.selectOption('#maritalStatus', 'Married', 'Married')
    cy.get('#dateOfMarriage-dd').type('01')
    cy.get('#dateOfMarriage-mm').type('08')
    cy.get('#dateOfMarriage-yyyy').type('2018')
    cy.selectOption(
      '#educationalAttainment',
      'Upper secondary',
      'Upper secondary'
    )
    cy.get('#addressSameAsMother_false').click()
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('40')
    cy.get('#postCode').type('1024')
    cy.get('#permanentAddressSameAsMother_false').click()
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3Permanent', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2Permanent').type('My street')
    cy.get('#addressLine1Permanent').type('40')
    cy.get('#postCodePermanent').type('1024')
    cy.wait(1000)
    cy.get('#next_section').click()
    // REGISTRATION
    cy.selectOption(
      '#presentAtBirthRegistration',
      'Both Parents',
      'Both Parents'
    )
    cy.selectOption('#whoseContactDetails', 'Father', 'Father')
    cy.get('#registrationPhone').type('01711111111')
    cy.get('#commentsOrNotes').type('note')
    cy.wait(1000)
    cy.get('#next_section').click()
    // DOCUMENTS
    cy.wait(1000)
    cy.get('#next_section').click()
    // PREVIEW
    cy.get('#next_button_child').click()
    cy.get('#next_button_mother').click()
    cy.get('#next_button_father').click()
    cy.get('#submit_form').click()
    // MODAL
    cy.get('#submit_confirm').click()
  })
})
