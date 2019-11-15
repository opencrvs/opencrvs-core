/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
/// <reference types="Cypress" />

context('Death Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('Tests from application to registration using minimum input', () => {
    // Fix time to 2019-11-12
    cy.clock(1573557567230)
    // LOGIN
    cy.login('fieldWorker')
    cy.createPin()
    cy.verifyLandingPageVisible()
    // APPLICATION FORM
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_death_event').click()
    cy.get('#continue').click()
    // SELECT INFORMANT
    cy.get('#select_informant_SON').click()
    cy.get('#continue').click()
    // SELECT MAIN CONTACT POINT
    cy.get('#contactPoint_APPLICANT').click()
    cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
      '01526972106'
    )
    cy.goToNextFormSection()
    // DECEASED DETAILS
    cy.selectOption('#iDType', 'No_ID', 'No ID available')
    cy.get('#familyName').type('খান')
    cy.get('#familyNameEng').type('Khan')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#gender', 'Male', 'Male')
    cy.get('#birthDate-dd').type('16')
    cy.get('#birthDate-mm').type('06')
    cy.get('#birthDate-yyyy').type('1988')
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.get('#currentAddressSameAsPermanent_true').click()
    cy.goToNextFormSection()
    // EVENT DETAILS
    cy.get('#deathDate-dd').type('18')
    cy.get('#deathDate-mm').type('01')
    cy.get('#deathDate-yyyy').type('2019')
    cy.goToNextFormSection()
    // MANNER OF DEATH
    cy.get('#manner_NATURAL_CAUSES').click()
    cy.goToNextFormSection()
    // DEATH OCCURRING PLACE
    cy.get('#deathPlaceAddress_PERMANENT').click()
    cy.goToNextFormSection()
    // CAUSE OF DEATH DETAILS
    cy.get('#causeOfDeathEstablished_false').click()
    cy.goToNextFormSection()
    // APPLICANT DETAILS
    cy.selectOption('#iDType', 'No ID available', 'No ID available')
    cy.get('#applicantFamilyName').type('উদ্দিন')
    cy.get('#applicantFamilyNameEng').type('Uddin')
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.get('#applicantPermanentAddressSameAsCurrent_true').click()
    cy.goToNextFormSection()
    // DOCUMENT DETAILS
    cy.goToNextFormSection()
    // PREVIEW
    cy.submitApplication()
    cy.get('#row_0 #submitted0').should('exist')
    // LOG OUT
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    // LANDING PAGE

    cy.downloadFirstApplication()

    cy.get('#ListItemAction-0-Review').should('exist')
    cy.get('#ListItemAction-0-Review')
      .first()
      .click()
    cy.registerApplication()
  })

  it('Tests from application to registration using maximum input', () => {
    // Fix time to 2019-11-12
    cy.clock(1573557567230)
    // LOGIN
    cy.login('fieldWorker')
    cy.createPin()
    cy.verifyLandingPageVisible()
    // APPLICATION FORM
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_death_event').click()
    cy.get('#continue').click()
    // SELECT INFORMANT
    cy.get('#select_informant_OTHER').click()
    cy.get('#continue').click()
    // SELECT ADDITIONAL INFORMANT
    cy.get('#relationship_OTHER').click()
    cy.get('#relationship\\.nestedFields\\.otherRelationship').type('Friend')
    cy.goToNextFormSection()
    // SELECT MAIN CONTACT POINT
    cy.get('#contactPoint_OTHER').click()
    cy.get('#contactPoint\\.nestedFields\\.contactRelationship').type(
      'Colleague'
    )
    cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
      '01678945638'
    )
    cy.goToNextFormSection()
    // DECEASED DETAILS
    cy.selectOption('#iDType', 'National_ID', 'National ID')
    cy.get('#iD').type('1020607910288')
    cy.get('#firstNames').type('ক ম আব্দুল্লাহ আল আমিন ')
    cy.get('#familyName').type('খান')
    cy.get('#firstNamesEng').type('K M Abdullah al amin')
    cy.get('#familyNameEng').type('Khan')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#gender', 'Male', 'Male')
    cy.selectOption('#maritalStatus', 'Married', 'Married')
    cy.get('#birthDate-dd').type('16')
    cy.get('#birthDate-mm').type('06')
    cy.get('#birthDate-yyyy').type('1988')
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3Permanent', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2Permanent').type('Bahadur street')
    cy.get('#addressLine1Permanent').type('40 Ward')
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
    cy.goToNextFormSection()
    // EVENT DETAILS
    cy.get('#deathDate-dd').type('18')
    cy.get('#deathDate-mm').type('01')
    cy.get('#deathDate-yyyy').type('2019')
    cy.goToNextFormSection()
    cy.get('#manner_HOMICIDE').click()
    cy.goToNextFormSection()
    cy.get('#deathPlaceAddress_PRIVATE_HOME').click()
    cy.goToNextFormSection()
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('40')
    cy.get('#postCode').type('1024')
    cy.goToNextFormSection()
    // CAUSE OF DEATH DETAILS
    cy.get('#causeOfDeathEstablished_true').click()
    cy.goToNextFormSection()
    cy.get('#causeOfDeathCode').type('Chronic Obstructive Pulmonary Disease')
    cy.goToNextFormSection()
    // APPLICANT DETAILS
    cy.selectOption('#iDType', 'Drivers_License', 'Drivers License')
    cy.get('#applicantID').type('JS0013011C00001')
    cy.get('#applicantFirstNames').type('জামাল উদ্দিন খান')
    cy.get('#applicantFamilyName').type('খান')
    cy.get('#applicantFirstNamesEng').type('Jamal Uddin Khan')
    cy.get('#applicantFamilyNameEng').type('Khan')
    cy.get('#applicantBirthDate-dd').type('17')
    cy.get('#applicantBirthDate-mm').type('10')
    cy.get('#applicantBirthDate-yyyy').type('1956')
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('48')
    cy.get('#postCode').type('1024')
    cy.get('#applicantPermanentAddressSameAsCurrent_false').click()
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3Permanent', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2Permanent').type('Bahadur street')
    cy.get('#addressLine1Permanent').type('40 Ward')
    cy.get('#postCodePermanent').type('1024')
    cy.goToNextFormSection()
    // DOCUMENT DETAILS
    cy.goToNextFormSection()
    // PREVIEW
    cy.submitApplication()
    cy.get('#row_0 #submitted0').should('exist')

    // LOG OUT
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    // LANDING PAGE
    cy.downloadFirstApplication()
    cy.get('#ListItemAction-0-Review').should('exist')
    cy.get('#ListItemAction-0-Review')
      .first()
      .click()
    cy.registerApplication()
  })

  it('Tests from application to rejection using minimum input', () => {
    // Fix time to 2019-11-12
    cy.clock(1573557567230)
    cy.login('fieldWorker')
    // CREATE PIN
    cy.createPin()
    cy.verifyLandingPageVisible()
    // APPLICATION FORM
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_death_event').click()
    cy.get('#continue').click()
    // SELECT INFORMANT
    cy.get('#select_informant_SON').click()
    cy.get('#continue').click()
    // SELECT MAIN CONTACT POINT
    cy.get('#contactPoint_APPLICANT').click()

    cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
      '01741123963'
    )

    cy.goToNextFormSection()
    // DECEASED DETAILS
    cy.selectOption('#iDType', 'No_ID', 'No ID available')
    cy.get('#familyName').type('খান')
    cy.get('#familyNameEng').type('Khan')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#gender', 'Male', 'Male')
    cy.get('#birthDate-dd').type('16')
    cy.get('#birthDate-mm').type('06')
    cy.get('#birthDate-yyyy').type('1988')
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.get('#currentAddressSameAsPermanent_true').click()

    cy.goToNextFormSection()
    // EVENT DETAILS
    cy.get('#deathDate-dd').type('18')
    cy.get('#deathDate-mm').type('01')
    cy.get('#deathDate-yyyy').type('2019')

    cy.goToNextFormSection()
    // MANNER OF DEATH
    cy.get('#manner_NATURAL_CAUSES').click()
    cy.goToNextFormSection()
    // DEATH OCCURRING PLACE
    cy.get('#deathPlaceAddress_PERMANENT').click()

    cy.goToNextFormSection()
    // CAUSE OF DEATH DETAILS
    cy.get('#causeOfDeathEstablished_false').click()
    cy.goToNextFormSection()
    // APPLICANT DETAILS
    cy.selectOption('#iDType', 'No_ID', 'No ID available')
    cy.get('#applicantFamilyName').type('উদ্দিন')
    cy.get('#applicantFamilyNameEng').type('Uddin')
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.get('#applicantPermanentAddressSameAsCurrent_true').click()

    cy.goToNextFormSection()
    // DOCUMENT DETAILS
    cy.goToNextFormSection()
    // PREVIEW
    cy.submitApplication()

    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    // LANDING PAGE
    cy.downloadFirstApplication()
    cy.get('#ListItemAction-0-Review').should('exist')
    cy.get('#ListItemAction-0-Review')
      .first()
      .click()

    cy.rejectApplication()
  })

  it('Tests from application to rejection using maximum input', () => {
    // Fix time to 2019-11-12
    cy.clock(1573557567230)
    cy.login('fieldWorker')
    // CREATE PIN
    cy.createPin()
    cy.verifyLandingPageVisible()
    // APPLICATION FORM
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_death_event').click()
    cy.get('#continue').click()
    // SELECT INFORMANT
    cy.get('#select_informant_OTHER').click()
    cy.get('#continue').click()
    // SELECT ADDITIONAL INFORMANT
    cy.get('#relationship_OTHER').click()
    cy.get('#relationship\\.nestedFields\\.otherRelationship').type('Colleague')
    cy.goToNextFormSection()
    // SELECT MAIN CONTACT POINT
    cy.get('#contactPoint_OTHER').click()

    cy.get('#contactPoint\\.nestedFields\\.contactRelationship').type('Friend')

    cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
      '01753741963'
    )

    cy.goToNextFormSection()
    // DECEASED DETAILS
    cy.selectOption('#iDType', 'National_ID', 'National ID')
    cy.get('#iD').type('1020607910288')
    cy.get('#firstNames').type('ক ম আব্দুল্লাহ আল আমিন ')
    cy.get('#familyName').type('খান')
    cy.get('#firstNamesEng').type('K M Abdullah al amin')
    cy.get('#familyNameEng').type('Khan')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#gender', 'Male', 'Male')
    cy.selectOption('#maritalStatus', 'Married', 'Married')
    cy.get('#birthDate-dd').type('16')
    cy.get('#birthDate-mm').type('06')
    cy.get('#birthDate-yyyy').type('1988')
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3Permanent', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2Permanent').type('Bahadur street')
    cy.get('#addressLine1Permanent').type('40 Ward')
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

    cy.goToNextFormSection()
    // EVENT DETAILS
    cy.get('#deathDate-dd').type('18')
    cy.get('#deathDate-mm').type('01')
    cy.get('#deathDate-yyyy').type('2019')

    cy.goToNextFormSection()
    cy.get('#manner_HOMICIDE').click()
    cy.goToNextFormSection()
    cy.get('#deathPlaceAddress_PRIVATE_HOME').click()

    cy.goToNextFormSection()
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('40')
    cy.get('#postCode').type('1024')

    cy.goToNextFormSection()
    // CAUSE OF DEATH DETAILS
    cy.get('#causeOfDeathEstablished_true').click()

    cy.goToNextFormSection()
    cy.get('#causeOfDeathCode').type('Coronary artery disease')
    cy.goToNextFormSection()
    // APPLICANT DETAILS
    cy.selectOption('#iDType', 'Drivers_License', 'Drivers License')
    cy.get('#applicantID').type('JS0013011C00001')
    cy.get('#applicantFirstNames').type('জামাল উদ্দিন খান')
    cy.get('#applicantFamilyName').type('খান')
    cy.get('#applicantFirstNamesEng').type('Jamal Uddin Khan')
    cy.get('#applicantFamilyNameEng').type('Khan')
    cy.get('#applicantBirthDate-dd').type('17')
    cy.get('#applicantBirthDate-mm').type('10')
    cy.get('#applicantBirthDate-yyyy').type('1956')
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('48')
    cy.get('#postCode').type('1024')
    cy.get('#applicantPermanentAddressSameAsCurrent_false').click()
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3Permanent', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2Permanent').type('Bahadur street')
    cy.get('#addressLine1Permanent').type('40 Ward')
    cy.get('#postCodePermanent').type('1024')

    cy.goToNextFormSection()
    // DOCUMENT DETAILS
    cy.goToNextFormSection()
    // PREVIEW
    cy.submitApplication()

    // LOG OUT
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    // LANDING PAGE
    cy.downloadFirstApplication()
    cy.get('#ListItemAction-0-Review').should('exist')
    cy.get('#ListItemAction-0-Review')
      .first()
      .click()

    cy.rejectApplication()
  })

  it('Tests registration by registrar using maximum input', () => {
    // Fix time to 2019-11-12
    cy.clock(1573557567230)
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    cy.verifyLandingPageVisible()
    // APPLICATION FORM
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_death_event').click()
    cy.get('#continue').click()
    // SELECT INFORMANT
    cy.get('#select_informant_OTHER').click()
    cy.get('#continue').click()
    // SELECT ADDITIONAL INFORMANT
    cy.get('#relationship_HEAD_OF_THE_INSTITUTE').click()

    cy.goToNextFormSection()
    // SELECT MAIN CONTACT POINT
    cy.get('#contactPoint_OTHER').click()
    cy.get('#contactPoint\\.nestedFields\\.contactRelationship').type(
      'Colleague'
    )

    cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
      '01852741963'
    )

    cy.goToNextFormSection()
    // DECEASED DETAILS
    cy.selectOption('#iDType', 'National_ID', 'National ID')
    cy.get('#iD').type('1020607910288')
    cy.get('#firstNames').type('ক ম আব্দুল্লাহ আল আমিন ')
    cy.get('#familyName').type('খান')
    cy.get('#firstNamesEng').type('K M Abdullah al amin')
    cy.get('#familyNameEng').type('Khan')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#gender', 'Male', 'Male')
    cy.selectOption('#maritalStatus', 'Married', 'Married')
    cy.get('#birthDate-dd').type('16')
    cy.get('#birthDate-mm').type('06')
    cy.get('#birthDate-yyyy').type('1988')
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3Permanent', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2Permanent').type('Bahadur street')
    cy.get('#addressLine1Permanent').type('40 Ward')
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

    cy.goToNextFormSection()
    // EVENT DETAILS
    cy.get('#deathDate-dd').type('18')
    cy.get('#deathDate-mm').type('01')
    cy.get('#deathDate-yyyy').type('2019')

    cy.goToNextFormSection()
    cy.get('#manner_HOMICIDE').click()
    cy.goToNextFormSection()
    cy.get('#deathPlaceAddress_PRIVATE_HOME').click()

    cy.goToNextFormSection()
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('40')
    cy.get('#postCode').type('1024')

    cy.goToNextFormSection()
    // CAUSE OF DEATH DETAILS
    cy.get('#causeOfDeathEstablished_true').click()

    cy.goToNextFormSection()
    cy.get('#causeOfDeathCode').type('Brain stroke')
    cy.goToNextFormSection()
    // APPLICANT DETAILS
    cy.selectOption('#iDType', 'Drivers_License', 'Drivers License')
    cy.get('#applicantID').type('JS0013011C00001')
    cy.get('#applicantFirstNames').type('জামাল উদ্দিন খান')
    cy.get('#applicantFamilyName').type('খান')
    cy.get('#applicantFirstNamesEng').type('Jamal Uddin Khan')
    cy.get('#applicantFamilyNameEng').type('Khan')
    cy.get('#applicantBirthDate-dd').type('17')
    cy.get('#applicantBirthDate-mm').type('10')
    cy.get('#applicantBirthDate-yyyy').type('1956')
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2').type('My street')
    cy.get('#addressLine1').type('48')
    cy.get('#postCode').type('1024')
    cy.get('#applicantPermanentAddressSameAsCurrent_false').click()
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.selectOption('#addressLine3Permanent', 'Bahadursadi', 'Bahadursadi')
    cy.get('#addressLine2Permanent').type('Bahadur street')
    cy.get('#addressLine1Permanent').type('40 Ward')
    cy.get('#postCodePermanent').type('1024')

    cy.goToNextFormSection()
    // DOCUMENT DETAILS
    cy.goToNextFormSection()

    cy.registerApplication()
  })
})
