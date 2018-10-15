/// <reference types="Cypress" />

context('Register', () => {
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
    cy.login('fieldWorker')
  })

  it('fills in all data into the register form', () => {
    cy.visit(`${Cypress.env('REGISTER_URL')}events`)
    // CHILD DETAILS
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#select_parent_informant').click()
    cy.get('#childFirstNames').type('গায়ত্রী')
    cy.get('#childFamilyName').type('স্পিভক')
    cy.get('#childFirstNamesEng').type('Gayatri')
    cy.get('#childFamilyNameEng').type('Spivak')
    cy.selectOption('#childSex', 'Female', 'Female')
    cy.get('#dateOfBirth-dd').type('01')
    cy.get('#dateOfBirth-mm').type('08')
    cy.get('#dateOfBirth-yyyy').type('2018')
    cy.selectOption('#attendantAtBirth', 'Midwife', 'Midwife')
    cy.selectOption('#typeOfBirth', 'Single', 'Single')
    cy.get('#orderOfBirth').type('1')
    cy.get('#weightAtBirth').type('1')
    cy.selectOption('#placeOfDelivery', 'Hospital', 'Hospital')
    cy.get('#next_section').click()
    // MOTHER DETAILS
    cy.selectOption('#motherIDType', 'National ID', 'National ID')
    cy.get('#motherID').type('1')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.get('#motherFirstNames').type('গায়ত্রী')
    cy.get('#motherFamilyName').type('স্পিভক')
    cy.get('#motherFirstNamesEng').type('Gayatri')
    cy.get('#motherFamilyNameEng').type('Spivak')
    cy.get('#motherDateOfBirth-dd').type('01')
    cy.get('#motherDateOfBirth-mm').type('08')
    cy.get('#motherDateOfBirth-yyyy').type('2018')
    cy.selectOption('#maritalStatus', 'Married', 'Married')
    cy.get('#motherDateOfMarriage-dd').type('01')
    cy.get('#motherDateOfMarriage-mm').type('08')
    cy.get('#motherDateOfMarriage-yyyy').type('2018')
    cy.selectOption(
      '#motherEducationAttainment',
      'Upper secondary',
      'Upper secondary'
    )
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka Division', 'Dhaka Division')
    cy.selectOption('#district', 'Gazipur District', 'Gazipur District')

    // Depends on fix for bug & better approach for administrative structure:  https://jembiprojects.jira.com/browse/OCRVS-588

    /* cy.selectOption('#addressLine4', 'Kaliganj Upazila', 'Kaliganj Upazila')
    cy.selectOption('#addressLine3Options1', 'Jamalpur', 'Jamalpur')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('40')
    cy.get('#postcode').type('10024')*/
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka Division', 'Dhaka Division')
    cy.selectOption(
      '#districtPermanent',
      'Gazipur District',
      'Gazipur District'
    )
    /*cy.selectOption(
      '#addressLine4Permanent',
      'Kaliganj Upazila',
      'Kaliganj Upazila'
    )
    cy.selectOption('#addressLine3Options1Permanent', 'Jamalpur', 'Jamalpur')
    cy.get('#addressLine2Permanent').type('My street')
    cy.get('#addressLine1Permanent').type('40')
    cy.get('#postcodePermanent').type('10024')*/
    cy.get('#next_section').click()
    // FATHER DETAILS
    cy.get('#fathersDetailsExist_true').click()
    cy.selectOption('#fatherIDType', 'National ID', 'National ID')
    cy.get('#fatherID').type('1')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.get('#fatherFirstNames').type('গায়ত্রী')
    cy.get('#fatherFamilyName').type('স্পিভক')
    cy.get('#fatherFirstNamesEng').type('Gayatri')
    cy.get('#fatherFamilyNameEng').type('Spivak')
    cy.get('#fatherDateOfBirth-dd').type('01')
    cy.get('#fatherDateOfBirth-mm').type('08')
    cy.get('#fatherDateOfBirth-yyyy').type('2018')
    cy.selectOption('#maritalStatus', 'Married', 'Married')
    cy.get('#fatherDateOfMarriage-dd').type('01')
    cy.get('#fatherDateOfMarriage-mm').type('08')
    cy.get('#fatherDateOfMarriage-yyyy').type('2018')
    cy.selectOption(
      '#fatherEducationAttainment',
      'Upper secondary',
      'Upper secondary'
    )
    cy.get('#addressSameAsMother_false').click()
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka Division', 'Dhaka Division')
    cy.selectOption('#district', 'Gazipur District', 'Gazipur District')
    // Depends on fix for bug & better approach for administrative structure:  https://jembiprojects.jira.com/browse/OCRVS-588

    /* cy.selectOption('#addressLine4', 'Kaliganj Upazila', 'Kaliganj Upazila')
    cy.selectOption('#addressLine3Options1', 'Jamalpur', 'Jamalpur')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('40')
    cy.get('#postcode').type('10024')*/
    cy.get('#permanentAddressSameAsMother_false').click()
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka Division', 'Dhaka Division')
    cy.selectOption(
      '#districtPermanent',
      'Gazipur District',
      'Gazipur District'
    )
    /*cy.selectOption(
      '#addressLine4Permanent',
      'Kaliganj Upazila',
      'Kaliganj Upazila'
    )
    cy.selectOption('#addressLine3Options1Permanent', 'Jamalpur', 'Jamalpur')
    cy.get('#addressLine2Permanent').type('My street')
    cy.get('#addressLine1Permanent').type('40')
    cy.get('#postcodePermanent').type('10024')*/
    cy.get('#next_section').click()
    // REGISTRATION
    cy.selectOption('#whoIsPresent', 'Both Parents', 'Both Parents')
    cy.selectOption('#whoseContactDetails', 'Both Parents', 'Both Parents')
    cy.get('#registrationEmail').type('test@test.com')
    cy.get('#registrationPhone').type('07111111111')
    cy.get('#registrationCertificateLanguageBangla').click()
    cy.get('#registrationCertificateLanguageEnglish').click()
    cy.get('#paperFormNumber').type('1')
    cy.get('#commentsOrNotes').type('note')
    cy.get('#next_section').click()
    // DOCUMENTS
    cy.get('#next_section').click()
    // PREVIEW
    cy.get('#submit_form').click()
    // MODAL
    cy.get('#submit_confirm').click()
    // SUCCESS
    cy.get('#saved_registration_view').contains('Declaration submitted')
  })
})
