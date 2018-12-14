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
    cy.get('#firstNames').type('মহেশ')
    cy.get('#familyName').type('ঋষি')
    cy.get('#firstNamesEng').type('Mahesh')
    cy.get('#familyNameEng').type('Rishi')
    cy.selectOption('#gender','Male','Male')
    cy.get('#childBirthDate-dd').type('16')
    cy.get('#childBirthDate-mm').type('06')
    cy.get('#childBirthDate-yyyy').type('2018')
    cy.selectOption('#attendantAtBirth', 'Physician','Physician')
    cy.selectOption('#typeOfBirth', 'Single','Single')
    cy.get('#orderOfBirth').type('1')
    cy.get('#weightAtBirth').type('3.5')
    cy.selectOption('#placeOfDelivery', 'Hospital', 'Hospital')

    cy.get('#next_section').click()
    cy.selectOption('#iDType', 'Passport', 'Passport')
    cy.get('#iD').type('H9819444')
    cy.selectOption('#nationality', 'Bangladesh','Bangladesh')
    cy.get('#firstNames').type('গরিমা')
    cy.get('#familyName').type('ঋষি')
    cy.get('#firstNamesEng').type('Shobha')
    cy.get('#familyNameEng').type('Rishi')
    cy.get('#motherBirthDate-dd').type('16')
    cy.get('#motherBirthDate-mm').type('08')
    cy.get('#motherBirthDate-yyyy').type('1988')
    cy.selectOption('#maritalStatus', 'Unmarried', 'Unmarried')
    cy.get('#dateOfMarriage-dd').type('31')
    cy.get('#dateOfMarriage-mm').type('12')
    cy.get('#dateOfMarriage-yyyy').type('2010')
    cy.selectOption('#educationalAttainment', 'Primary', 'Primary')

    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Mymensingh Division', 'Mymensingh Division')
    cy.selectOption('#district', 'Mymensingh District', 'Mymensingh District')
    cy.selectOption('#addressLine4', 'Mymensingh Sadar Upazila', 'Mymensingh Sadar Upazila')
    cy.selectOption('#addressLine3Options1', 'Akua','Akua')
    cy.get('#addressLine2').type('Morning side, Sandton')
    cy.get('#addressLine1').type('34 polo fields, Cullinan close')
    cy.get('#postCode').type('2196')

    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Mymensingh Division', 'Mymensingh Division')
    cy.selectOption('#districtPermanent', 'Mymensingh District', 'Mymensingh District')
    cy.selectOption('#addressLine4Permanent', 'Mymensingh Sadar Upazila', 'Mymensingh Sadar Upazila')
    cy.selectOption('#addressLine3Options1Permanent', 'Akua', 'Akua')
    cy.get('#addressLine2Permanent').type('34 polo fields, Cullinan close')
    cy.get('#addressLine1Permanent').type('34 polo fields, Cullinan close, Morning side, Sandton')
    cy.get('#postCodePermanent').type('2196')
    cy.get('#next_section').click()

    cy.get('#fathersDetailsExist_true').click()
    cy.selectOption('#iDType', 'National ID', 'National ID')
    cy.get('#iD').type('1592824588424')
    cy.selectOption('#nationality','Bangladesh', 'Bangladesh')
    cy.get('#firstNames').type('সত্য')
    cy.get('#familyName').type('ঋষি')
    cy.get('#firstNamesEng').type('Satya')
    cy.get('#familyNameEng').type('Rishi')
    cy.get('#fatherBirthDate-dd').type('23')
    cy.get('#fatherBirthDate-mm').type('03')
    cy.get('#fatherBirthDate-yyyy').type('1985')
    cy.selectOption('#maritalStatus', 'Widowed', 'Widowed')
    cy.get('#dateOfMarriage-dd').type('10')
    cy.get('#dateOfMarriage-mm').type('10')
    cy.get('#dateOfMarriage-yyyy').type('2010')
    cy.selectOption('#educationalAttainment', 'Lower secondary', 'Lower secondary')
    cy.get('#addressSameAsMother_true').click();
    cy.get('#permanentAddressSameAsMother_true').click();
    cy.get('#next_section').click();

    cy.selectOption('#presentAtBirthRegistration', 'Both Parents','Both Parents')
    cy.selectOption('#whoseContactDetails', 'Both Parents', 'Both Parents')
    cy.get('#registrationEmail').type('maheshkandagatla@zoho.com')
    cy.get('#registrationPhone').type('01741234567')
    cy.get('#registrationCertificateLanguageBangla').click()
    cy.get('#registrationCertificateLanguageEnglish').click()
    cy.get('#paperFormNumber').type('1223')
    cy.get('#commentsOrNotes').type('Both parents submitted all the documents needed')
    cy.get('#next_section').click();
    //cy.pause()
     cy.get('#image_uploader').click()
     cy.get('#uploadDocForWhom_Child').click()
     cy.get('#whatDocToUpload_NID').click()
     //cy.get('#upload_document').click()





      // then((picture) => {
      //   return Cypress.Blob.base64StringToBlob(picture, 'image/jpg').then((blob) => {
      //       dropEvent.dataTransfer.files.push(blob);
      //   });
      //  });

  //  cy.fixture('images/cert.jpg').then((picture) => {
  //      return Cypress.Blob.base64StringToBlob(picture, 'image/jpg').then((blob) => {
  //          dropEvent.dataTransfer.files.push(blob);
  //      });
  //     });

   // cy.get('#upload_document').trigger('drop', dropEvent);
   // cy.get('#upload_document').click()

    cy.get('#next_section').click()
    cy.get('#next_button_child').click()
    cy.get('#next_button_mother').click()
    cy.get('#next_button_father').click()
    cy.get('#submit_form').click()
    cy.get('#submit_confirm').click();

  })
})
