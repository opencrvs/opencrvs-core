/// <reference types="Cypress" />

context('Register', () => {
  beforeEach(() => {
    cy.login('fieldWorker')
  })

  it('fills in all data into the register form', () => {
    cy.visit(`${Cypress.env('REGISTER_URL')}events`)
    // CHILD DETAILS
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#select_parent_informant').click()
    cy.get('#firstNames').type('গায়ত্রী')
    cy.get('#familyName').type('স্পিভক')
    cy.get('#firstNamesEng').type('Gayatri')
    cy.get('#familyNameEng').type('Spivak')
    cy.selectOption('#gender', 'Female', 'Female')
    cy.get('#childBirthDate-dd').type('01')
    cy.get('#childBirthDate-mm').type('08')
    cy.get('#childBirthDate-yyyy').type('2018')
    cy.selectOption('#attendantAtBirth', 'Midwife', 'Midwife')
    cy.selectOption('#typeOfBirth', 'Single', 'Single')
    cy.get('#orderOfBirth').type('1')
    cy.get('#weightAtBirth').type('1')
    cy.selectOption('#placeOfDelivery', 'Hospital', 'Hospital')
    cy.get('#next_section').click()
    // MOTHER DETAILS
    cy.selectOption('#iDType', 'National ID', 'National ID')
    cy.get('#iD').type('1')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.get('#firstNames').type('গায়ত্রী')
    cy.get('#familyName').type('স্পিভক')
    cy.get('#firstNamesEng').type('Gayatri')
    cy.get('#familyNameEng').type('Spivak')
    cy.get('#motherBirthDate-dd').type('01')
    cy.get('#motherBirthDate-mm').type('08')
    cy.get('#motherBirthDate-yyyy').type('2018')
    cy.selectOption('#maritalStatus', 'Married', 'Married')
    cy.get('#dateOfMarriage-dd').type('01')
    cy.get('#dateOfMarriage-mm').type('08')
    cy.get('#dateOfMarriage-yyyy').type('2018')
    cy.selectOption(
      '#educationalAttainment',
      'Upper secondary',
      'Upper secondary'
    )
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Mymensingh Division', 'Mymensingh Division')
    cy.selectOption('#district', 'Mymensingh District', 'Mymensingh District')

    // Depends on fix for bug & better approach for administrative structure:  https://jembiprojects.jira.com/browse/OCRVS-588

    cy.selectOption(
      '#addressLine4',
      'Mymensingh Sadar Upazila',
      'Mymensingh Sadar Upazila'
    )
    cy.selectOption('#addressLine3Options1', 'Akua', 'Akua')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('40')
    cy.get('#postCode').type('10024')
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption(
      '#statePermanent',
      'Mymensingh Division',
      'Mymensingh Division'
    )
    cy.selectOption(
      '#districtPermanent',
      'Mymensingh District',
      'Mymensingh District'
    )
    cy.selectOption(
      '#addressLine4Permanent',
      'Mymensingh Sadar Upazila',
      'Mymensingh Sadar Upazila'
    )
    cy.selectOption('#addressLine3Options1Permanent', 'Akua', 'Akua')
    cy.get('#addressLine2Permanent').type('My street')
    cy.get('#addressLine1Permanent').type('40')
    cy.get('#postCodePermanent').type('10024')
    cy.get('#next_section').click()
    // FATHER DETAILS
    cy.get('#fathersDetailsExist_true').click()
    cy.selectOption('#iDType', 'National ID', 'National ID')
    cy.get('#iD').type('1')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.get('#firstNames').type('গায়ত্রী')
    cy.get('#familyName').type('স্পিভক')
    cy.get('#firstNamesEng').type('Gayatri')
    cy.get('#familyNameEng').type('Spivak')
    cy.get('#fatherBirthDate-dd').type('01')
    cy.get('#fatherBirthDate-mm').type('08')
    cy.get('#fatherBirthDate-yyyy').type('2018')
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
    cy.selectOption('#state', 'Mymensingh Division', 'Mymensingh Division')
    cy.selectOption('#district', 'Mymensingh District', 'Mymensingh District')
    // Depends on fix for bug & better approach for administrative structure:  https://jembiprojects.jira.com/browse/OCRVS-588

    cy.selectOption(
      '#addressLine4',
      'Mymensingh Sadar Upazila',
      'Mymensingh Sadar Upazila'
    )
    cy.selectOption('#addressLine3Options1', 'Akua', 'Akua')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('40')
    cy.get('#postCode').type('10024')
    cy.get('#permanentAddressSameAsMother_false').click()
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption(
      '#statePermanent',
      'Mymensingh Division',
      'Mymensingh Division'
    )
    cy.selectOption(
      '#districtPermanent',
      'Mymensingh District',
      'Mymensingh District'
    )
    cy.selectOption(
      '#addressLine4Permanent',
      'Mymensingh Sadar Upazila',
      'Mymensingh Sadar Upazila'
    )
    cy.selectOption('#addressLine3Options1Permanent', 'Akua', 'Akua')
    cy.get('#addressLine2Permanent').type('My street')
    cy.get('#addressLine1Permanent').type('40')
    cy.get('#postCodePermanent').type('10024')
    cy.get('#next_section').click()
    // REGISTRATION
    cy.selectOption(
      '#presentAtBirthRegistration',
      'Both Parents',
      'Both Parents'
    )
    cy.selectOption('#whoseContactDetails', 'Father', 'Father')
    cy.get('#registrationEmail').type('test@test.com')
    cy.get('#registrationPhone').type('01711111111')
    cy.get('#registrationCertificateLanguageBangla').click()
    cy.get('#registrationCertificateLanguageEnglish').click()
    cy.get('#paperFormNumber').type('1')
    cy.get('#commentsOrNotes').type('note')
    cy.get('#next_section').click()
    // DOCUMENTS
    cy.get('#next_section').click()
    // PREVIEW
    cy.get('#next_button_child').click()
    cy.get('#next_button_mother').click()
    cy.get('#next_button_father').click()
    cy.get('#submit_form').click()
    // MODAL
    // cy.get('#submit_confirm').click()
    // SUCCESS
    // cy.get('#saved_registration_view').contains('Declaration submitted')
  })
})
