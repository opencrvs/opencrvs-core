/// <reference types="Cypress" />

context('Register', () => {
  beforeEach(() => {
    cy.login('registrar')
  })

  it('fills in all data into the register form', () => {
    cy.visit(`${Cypress.env('REGISTER_URL')}events`)
    // CHILD DETAILS
    cy.get('#select_birth_event')
      .should('be.visible')
      .click()
    cy.get('#select_parent_informant').click()
    cy.get('#firstNames').type('আজাদ হুমায়ুন')
    cy.get('#familyName').type('মোহাম্মদ')
    cy.get('#firstNamesEng').type('Azad Humayun')
    cy.get('#familyNameEng').type('Mohemmed')
    cy.selectOption('#gender', 'Male', 'Male')
    cy.get('#childBirthDate-dd').type('06')
    cy.get('#childBirthDate-mm').type('01')
    cy.get('#childBirthDate-yyyy').type('2019')
    cy.selectOption('#attendantAtBirth', 'Nurse', 'Nurse')
    cy.selectOption('#birthType', 'Twin', 'Twin')
    cy.get('#multipleBirth').type('1')
    cy.get('#weightAtBirth').type('3.78')
    cy.selectOption('#placeOfBirth', 'Hospital', 'Hospital')
    //cy.pause()
    // cy.selectOption(
    //   '#birthLocation',
    //   'Kaliganj Upazila Health Complex',
    //   'Kaliganj Upazila Health Complex'
    // )
    cy.get('#next_section').click()
    // MOTHER DETAILS
    cy.selectOption('#iDType', 'Passport', 'Passport')
    cy.get('#iD').type('AG8148412')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.get('#firstNames').type('তাসলিমা একটার')
    cy.get('#familyName').type('মোহাম্মদ')
    cy.get('#firstNamesEng').type('Taslima Akter')
    cy.get('#familyNameEng').type('Mohemmed')
    //Mother Birth Date ************START************************
    cy.get('#motherBirthDate-dd').type('25')
    cy.get('#motherBirthDate-mm').type('12')
    cy.get('#motherBirthDate-yyyy').type('1981')
    //Mother Birth Date ************END**************************
    cy.selectOption('#maritalStatus', 'Married', 'Married')
    cy.get('#dateOfMarriage-dd').type('05')
    cy.get('#dateOfMarriage-mm').type('11')
    cy.get('#dateOfMarriage-yyyy').type('2012')
    cy.selectOption(
      '#educationalAttainment',
      'Upper secondary',
      'Upper secondary'
    )
    //cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3Permanent', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2Permanent').type('1-5 No. Ward')
    cy.get('#addressLine1Permanent').type('Harirampur Union')
    cy.get('#postCodePermanent').type('1230')
    cy.get('#next_section').click()

    //Skipping Father Details
    cy.get('#fathersDetailsExist_false').click()
    //FATHER DETAILS*******Start************************
    cy.get('#fathersDetailsExist_true').click()
    cy.selectOption('#iDType', 'National ID', 'National ID')
    cy.get('#iD').type('1020607910288')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.get('#firstNames').type('রাকিবুল ইসলাম')
    cy.get('#familyName').type('মোহাম্মদ')
    cy.get('#firstNamesEng').type('Rakibul Islam')
    cy.get('#familyNameEng').type('Mohemmed')
    cy.get('#fatherBirthDate-dd').type('17')
    cy.get('#fatherBirthDate-mm').type('10')
    cy.get('#fatherBirthDate-yyyy').type('1986')
    cy.selectOption('#maritalStatus', 'Married', 'Married')
    cy.get('#dateOfMarriage-dd').type('05')
    cy.get('#dateOfMarriage-mm').type('11')
    cy.get('#dateOfMarriage-yyyy').type('2012')
    cy.selectOption(
      '#educationalAttainment',
      'Upper secondary',
      'Upper secondary'
    )
    cy.get('#addressSameAsMother_false').click()
    //cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('40')
    cy.get('#postCode').type('10024')
    cy.get('#permanentAddressSameAsMother_false').click()
    //cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3Permanent', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2Permanent').type('1-5 No. Ward')
    cy.get('#addressLine1Permanent').type('Harirampur Union')
    cy.get('#postCodePermanent').type('1230')
    cy.get('#next_section').click()
    //Father Details*********END***********
    // REGISTRATION
    cy.selectOption('#presentAtBirthRegistration', 'Other', 'Other')
    cy.selectOption('#whoseContactDetails', 'Both Parents', 'Both Parents')
    cy.get('#registrationPhone').type('01712345678')
    cy.get('#commentsOrNotes').type(
      'Submitted certified copies of originals are not submitted - Phone number added'
    )
    cy.get('#next_section').click()
    // DOCUMENTS
    //cy.pause()
    cy.get('#next_section').click()
    // PREVIEW
    cy.get('#next_button_child').click()
    cy.get('#next_button_mother').click()
    cy.get('#next_button_father').click()
    //cy.pause()
    cy.get('#submit_form').click()
    cy.get('#submit_confirm').click()
    cy.wait(5000)
    //cy.get('#trackingIdViewer').readFile('#trackingIdViewer')

    cy.get('#tracking_id_viewer').then($track => {
      let trackid = $track.text()
      // 2019333494BTM0X205

      const trackid2 = trackid.substr(10, 7)

      cy.get('#go_to_homepage_button').click()

      cy.contains(`${trackid2}`).click()

      //PRINT
      cy.wait(1000)
      cy.get(`#printCertificate_${trackid2}`).click()
    })

    cy.selectOption('#personCollectingCertificate', 'Other', 'Other')
    cy.selectOption('#otherPersonIDType', 'National ID', 'National ID')

    cy.get('#documentNumber').type('1020607910288')
    cy.get('#otherPersonGivenNames').type('Md. Rakibul Islam')
    cy.get('#otherPersonFamilyName').type('Mohemmad')
    cy.get('#otherPersonSignedAffidavit_true').click()
    cy.get('#print-confirm-button').click()

    //payment method

    cy.get('#payment-confirm-button').click()
    cy.wait(5000)

    //Certificate Preview
    //Confirm details button
    cy.get('#registerApplicationBtn').click()
    // Finish Print
    cy.get('#finish-printing-certificate').click()
  })
})
