/// <reference types="Cypress" />

context('Birth Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('Tests from application to registration using minimum input', () => {
    // LOGIN
    cy.login('fieldWorker')
    // CREATE PIN
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn').click()
    for (let i = 1; i <= 8; i++) {
      cy.get(`#keypad-${i % 2}`).click()
    }
    // LANDING PAGE
    cy.get('#new_event_declaration', { timeout: 30000 }).should('be.visible')
    cy.get('#new_event_declaration').click()
    // EVENTS
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#continue').click()
    // SELECT INFORMANT
    cy.get('#select_informant_BOTH_PARENTS').click()
    cy.get('#continue').click()
    // SELECT APPLICANT
    cy.get('#select_mother_event').click()
    cy.get('#continue').click()
    // SELECT MAIN CONTACT POINT
    cy.get('#contact_MOTHER').click()
    cy.get('#phone_number_input').type('01526972106')
    cy.get('#continue').click()
    // APPLICATION FORM
    // CHILD DETAILS
    cy.get('#familyName').type('স্পিভক')
    cy.get('#familyNameEng').type('Spivak')
    cy.selectOption('#gender', 'Female', 'Female')
    cy.get('#childBirthDate-dd').type('01')
    cy.get('#childBirthDate-mm').type('08')
    cy.get('#childBirthDate-yyyy').type('2018')
    cy.get('#multipleBirth').type('1')
    cy.wait(1000)
    cy.get('#next_section').click()
    // MOTHER DETAILS
    cy.selectOption('#iDType', 'National ID', 'National ID')
    cy.get('#iD').type('6684176876871')
    cy.get('#familyName').type('বেগম')
    cy.get('#familyNameEng').type('Begum')
    cy.get('#motherBirthDate-dd').type('01')
    cy.get('#motherBirthDate-mm').type('08')
    cy.get('#motherBirthDate-yyyy').type('1971')
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.wait(1000)
    cy.get('#next_section').click()
    // FATHER DETAILS
    cy.get('#fathersDetailsExist_false').click()
    cy.wait(1000)
    cy.get('#next_section').click()
    // DOCUMENTS
    cy.wait(1000)
    cy.get('#next_section').click()
    // PREVIEW
    cy.get('#submit_form').click()
    // MODAL
    cy.get('#submit_confirm').click()
    cy.wait(6000)
    // LOG OUT
    cy.get('#mobile_header_left').click()
    cy.get('#mobile_menu_item_4').click()
    // LOGIN AS LOCAL REGISTRAR
    cy.get('#username').type('mohammad.ashraful')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#code').type('000000')
    cy.get('#login-mobile-submit').click()
    // LANDING PAGE
    cy.wait(3000)
    cy.get('#row_0').then($listItem => {
      if ($listItem.find('#ListItemAction-0-Review').length) {
        cy.log('Birth review found')
        cy.get('#ListItemAction-0-Review')
          .first()
          .click()
        cy.wait(500)
        cy.get('#registerApplicationBtn').click()
        // MODAL
        cy.get('#register_confirm').click()
        cy.wait(6000)
      } else {
        cy.log('Birth review not found')
      }
    })
  })

  it('Tests from application to registration using maximum input', () => {
    // LOGIN AS FIELD WORKER
    cy.login('fieldWorker')
    // CREATE PIN
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn').click()
    for (let i = 1; i <= 8; i++) {
      cy.get(`#keypad-${i % 2}`).click()
    }
    // LANDING PAGE
    cy.get('#new_event_declaration', { timeout: 30000 }).should('be.visible')
    cy.get('#new_event_declaration').click()
    // EVENTS
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#continue').click()
    cy.get('#select_informant_BOTH_PARENTS').click()
    cy.get('#continue').click()
    cy.get('#select_mother_event').click()
    cy.get('#continue').click()
    // SELECT MAIN CONTACT POINT
    cy.get('#contact_MOTHER').click()
    cy.get('#phone_number_input').type('01526972106')
    cy.get('#continue').click()
    // APPLICATION FORM
    // CHILD DETAILS
    cy.get('#firstNames').type('মারুফ')
    cy.get('#familyName').type('হোসাইন')
    cy.get('#firstNamesEng').type('Maruf')
    cy.get('#familyNameEng').type('Hossain')
    cy.selectOption('#gender', 'Male', 'Male')
    cy.get('#childBirthDate-dd').type('22')
    cy.get('#childBirthDate-mm').type('10')
    cy.get('#childBirthDate-yyyy').type('1994')
    cy.selectOption('#attendantAtBirth', 'Physician', 'Physician')
    cy.selectOption('#birthType', 'Single', 'Single')
    cy.get('#multipleBirth').type('1')
    cy.get('#weightAtBirth').type('1.5')
    cy.selectOption('#placeOfBirth', 'Private Home', 'Private Home')
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('40')
    cy.get('#postCode').type('1024')
    cy.wait(1000)
    cy.get('#next_section').click()
    // MOTHER DETAILS
    cy.selectOption('#iDType', 'National ID', 'National ID')
    cy.get('#iD').type('1234567898765')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.get('#firstNames').type('হাবিবা')
    cy.get('#familyName').type('আক্তার')
    cy.get('#firstNamesEng').type('Habiba')
    cy.get('#familyNameEng').type('Aktar')
    cy.get('#motherBirthDate-dd').type('23')
    cy.get('#motherBirthDate-mm').type('10')
    cy.get('#motherBirthDate-yyyy').type('1971')
    cy.selectOption('#maritalStatus', 'Married', 'Married')
    cy.get('#dateOfMarriage-dd').type('05')
    cy.get('#dateOfMarriage-mm').type('05')
    cy.get('#dateOfMarriage-yyyy').type('1990')
    cy.selectOption(
      '#educationalAttainment',
      'Upper secondary',
      'Upper secondary'
    )
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Chittagong', 'Chittagong')
    cy.selectOption('#districtPermanent', 'Chandpur', 'Chandpur')
    cy.selectOption('#addressLine4Permanent', 'Matlab Uttar', 'Matlab Uttar')
    cy.selectOption('#addressLine3Permanent', 'Satnal', 'Satnal')
    cy.get('#addressLine2Permanent').type('Ruhitarpar')
    cy.get('#addressLine1Permanent').type('40')
    cy.get('#postCodePermanent').type('1024')
    cy.get('#currentAddressSameAsPermanent_false').click()
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('40')
    cy.get('#postCode').type('1024')
    cy.wait(1000)
    cy.get('#next_section').click()
    // FATHER DETAILS
    cy.get('#fathersDetailsExist_true').click()
    cy.selectOption('#iDType', 'National ID', 'National ID')
    cy.get('#iD').type('1234567898765')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.get('#firstNames').type('বোরহান')
    cy.get('#familyName').type('উদ্দিন')
    cy.get('#firstNamesEng').type('Borhan')
    cy.get('#familyNameEng').type('Uddin')
    cy.get('#fatherBirthDate-dd').type('01')
    cy.get('#fatherBirthDate-mm').type('08')
    cy.get('#fatherBirthDate-yyyy').type('1966')
    cy.selectOption('#maritalStatus', 'Married', 'Married')
    cy.get('#dateOfMarriage-dd').type('05')
    cy.get('#dateOfMarriage-mm').type('05')
    cy.get('#dateOfMarriage-yyyy').type('1990')
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
    // DOCUMENTS
    cy.wait(1000)
    cy.get('#next_section').click()
    // PREVIEW
    cy.get('#submit_form').click()
    // MODAL
    cy.get('#submit_confirm').click()
    cy.wait(6000)
    // LOG OUT
    cy.get('#mobile_header_left').click()
    cy.get('#mobile_menu_item_4').click()
    // LOGIN AS LOCAL REGISTRAR
    cy.get('#username').type('mohammad.ashraful')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#code').type('000000')
    cy.get('#login-mobile-submit').click()
    // LANDING PAGE
    cy.wait(3000)
    cy.get('#row_0').then($listItem => {
      if ($listItem.find('#ListItemAction-0-Review').length) {
        cy.log('Birth review found')
        cy.get('#ListItemAction-0-Review')
          .first()
          .click()
        cy.wait(500)
        cy.get('#registerApplicationBtn').click()
        // MODAL
        cy.get('#register_confirm').click()
        cy.wait(6000)
      } else {
        cy.log('Birth review not found')
      }
    })
  })

  it('Tests from application to rejection using minimum input', () => {
    // LOGIN
    cy.login('fieldWorker')
    // CREATE PIN
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn').click()
    for (let i = 1; i <= 8; i++) {
      cy.get(`#keypad-${i % 2}`).click()
    }
    // LANDING PAGE
    cy.get('#new_event_declaration', { timeout: 30000 }).should('be.visible')
    cy.get('#new_event_declaration').click()
    // EVENTS
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#continue').click()
    // SELECT INFORMANT
    cy.get('#select_informant_BOTH_PARENTS').click()
    cy.get('#continue').click()
    // SELECT APPLICANT
    cy.get('#select_mother_event').click()
    cy.get('#continue').click()
    // SELECT MAIN CONTACT POINT
    cy.get('#contact_MOTHER').click()
    cy.get('#phone_number_input').type('01526972106')
    cy.get('#continue').click()
    // APPLICATION FORM
    // CHILD DETAILS
    cy.get('#familyName').type('চৌধুরী')
    cy.get('#familyNameEng').type('Chowdhury')
    cy.selectOption('#gender', 'Male', 'Male')
    cy.get('#childBirthDate-dd').type('22')
    cy.get('#childBirthDate-mm').type('10')
    cy.get('#childBirthDate-yyyy').type('1991')
    cy.get('#multipleBirth').type('1')
    cy.wait(1000)
    cy.get('#next_section').click()
    // MOTHER DETAILS
    cy.selectOption('#iDType', 'National ID', 'National ID')
    cy.get('#iD').type('6684176876871')
    cy.get('#familyName').type('আক্তার')
    cy.get('#familyNameEng').type('Aktar')
    cy.get('#motherBirthDate-dd').type('23')
    cy.get('#motherBirthDate-mm').type('10')
    cy.get('#motherBirthDate-yyyy').type('1971')
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.wait(1000)
    cy.get('#next_section').click()
    // FATHER DETAILS
    cy.get('#fathersDetailsExist_false').click()
    cy.wait(1000)
    cy.get('#next_section').click()
    // DOCUMENTS
    cy.wait(1000)
    cy.get('#next_section').click()
    // PREVIEW
    cy.get('#submit_form').click()
    // MODAL
    cy.get('#submit_confirm').click()
    cy.wait(6000)
    // LOG OUT
    cy.get('#mobile_header_left').click()
    cy.get('#mobile_menu_item_4').click()
    // LOGIN AS LOCAL REGISTRAR
    cy.get('#username').type('mohammad.ashraful')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#code').type('000000')
    cy.get('#login-mobile-submit').click()
    // LANDING PAGE
    cy.wait(3000)
    cy.get('#row_0').then($listItem => {
      if ($listItem.find('#ListItemAction-0-Review').length) {
        cy.log('Birth review found')
        cy.get('#ListItemAction-0-Review')
          .first()
          .click()
        cy.wait(500)
        cy.get('#rejectApplicationBtn').click()
        cy.wait(500)
        cy.get('#rejectionReasonOther').click()
        cy.get('#rejectionCommentForHealthWorker').type(
          'Lack of information, please notify informant about it.'
        )
        cy.get('#submit_reject_form').click()
        cy.wait(6000)
      } else {
        cy.log('Birth review not found')
      }
    })
  })

  it('Tests from application to rejection using maximum input', () => {
    // LOGIN AS FIELD WORKER
    cy.login('fieldWorker')
    // CREATE PIN
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn').click()
    for (let i = 1; i <= 8; i++) {
      cy.get(`#keypad-${i % 2}`).click()
    }
    // LANDING PAGE
    cy.get('#new_event_declaration', { timeout: 30000 }).should('be.visible')
    cy.get('#new_event_declaration').click()
    // EVENTS
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#continue').click()
    cy.get('#select_informant_BOTH_PARENTS').click()
    cy.get('#continue').click()
    cy.get('#select_mother_event').click()
    cy.get('#continue').click()
    // SELECT MAIN CONTACT POINT
    cy.get('#contact_MOTHER').click()
    cy.get('#phone_number_input').type('01526972106')
    cy.get('#continue').click()
    // APPLICATION FORM
    // CHILD DETAILS
    cy.get('#firstNames').type('তাহ্মিদ')
    cy.get('#familyName').type('রহমান')
    cy.get('#firstNamesEng').type('Tahmid')
    cy.get('#familyNameEng').type('Rahman')
    cy.selectOption('#gender', 'Male', 'Male')
    cy.get('#childBirthDate-dd').type('01')
    cy.get('#childBirthDate-mm').type('01')
    cy.get('#childBirthDate-yyyy').type('1989')
    cy.selectOption('#attendantAtBirth', 'Physician', 'Physician')
    cy.selectOption('#birthType', 'Single', 'Single')
    cy.get('#multipleBirth').type('1')
    cy.get('#weightAtBirth').type('1')
    cy.selectOption('#placeOfBirth', 'Private Home', 'Private Home')
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('40')
    cy.get('#postCode').type('1024')
    cy.wait(1000)
    cy.get('#next_section').click()
    // MOTHER DETAILS
    cy.selectOption('#iDType', 'National ID', 'National ID')
    cy.get('#iD').type('1234567898765')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.get('#firstNames').type('নমিসা')
    cy.get('#familyName').type('বেগম')
    cy.get('#firstNamesEng').type('Namisa')
    cy.get('#familyNameEng').type('Begum')
    cy.get('#motherBirthDate-dd').type('02')
    cy.get('#motherBirthDate-mm').type('12')
    cy.get('#motherBirthDate-yyyy').type('1961')
    cy.selectOption('#maritalStatus', 'Married', 'Married')
    cy.get('#dateOfMarriage-dd').type('07')
    cy.get('#dateOfMarriage-mm').type('11')
    cy.get('#dateOfMarriage-yyyy').type('1975')
    cy.selectOption(
      '#educationalAttainment',
      'Upper secondary',
      'Upper secondary'
    )
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Chittagong', 'Chittagong')
    cy.selectOption('#districtPermanent', 'Chandpur', 'Chandpur')
    cy.selectOption('#addressLine4Permanent', 'Matlab Uttar', 'Matlab Uttar')
    cy.selectOption('#addressLine3Permanent', 'Satnal', 'Satnal')
    cy.get('#addressLine2Permanent').type('Ruhitarpar')
    cy.get('#addressLine1Permanent').type('40')
    cy.get('#postCodePermanent').type('1024')
    cy.get('#currentAddressSameAsPermanent_false').click()
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('40')
    cy.get('#postCode').type('1024')
    cy.wait(1000)
    cy.get('#next_section').click()
    // FATHER DETAILS
    cy.get('#fathersDetailsExist_true').click()
    cy.selectOption('#iDType', 'National ID', 'National ID')
    cy.get('#iD').type('1234567898765')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.get('#firstNames').type('হামিদুর')
    cy.get('#familyName').type('রহমান')
    cy.get('#firstNamesEng').type('Hamidur')
    cy.get('#familyNameEng').type('Rahman')
    cy.get('#fatherBirthDate-dd').type('01')
    cy.get('#fatherBirthDate-mm').type('05')
    cy.get('#fatherBirthDate-yyyy').type('1959')
    cy.selectOption('#maritalStatus', 'Married', 'Married')
    cy.get('#dateOfMarriage-dd').type('07')
    cy.get('#dateOfMarriage-mm').type('11')
    cy.get('#dateOfMarriage-yyyy').type('1975')
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
    // DOCUMENTS
    cy.wait(1000)
    cy.get('#next_section').click()
    // PREVIEW
    cy.get('#submit_form').click()
    // MODAL
    cy.get('#submit_confirm').click()
    cy.wait(6000)
    // LOG OUT
    cy.get('#mobile_header_left').click()
    cy.get('#mobile_menu_item_4').click()
    // LOGIN AS LOCAL REGISTRAR
    cy.get('#username').type('mohammad.ashraful')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#code').type('000000')
    cy.get('#login-mobile-submit').click()
    // LANDING PAGE
    cy.wait(3000)
    cy.get('#row_0').then($listItem => {
      if ($listItem.find('#ListItemAction-0-Review').length) {
        cy.log('Birth review found')
        cy.get('#ListItemAction-0-Review')
          .first()
          .click()
        cy.wait(500)
        cy.get('#rejectApplicationBtn').click()
        cy.wait(500)
        cy.get('#rejectionReasonOther').click()
        cy.get('#rejectionCommentForHealthWorker').type(
          'Lack of information, please notify informant about it.'
        )
        cy.get('#submit_reject_form').click()
        cy.wait(6000)
      } else {
        cy.log('Birth review not found')
      }
    })
  })
})
