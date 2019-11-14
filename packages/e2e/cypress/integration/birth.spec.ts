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

context('Birth Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('Tests from application to registration using minimum input', () => {
    // Fix time to 2019-11-12
    cy.clock(1573557567230)

    // LOGIN
    cy.login('fieldWorker')
    cy.createPin()

    // LANDING PAGE
    cy.get('#header_new_event', { timeout: 30000 }).should('be.visible')
    cy.get('#header_new_event').click()

    // EVENTS
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#continue').click()

    // SELECT INFORMANT
    cy.get('#select_informant_BOTH_PARENTS').click()
    cy.get('#continue').click()

    // SELECT APPLICANT
    cy.get('#applicant_MOTHER').click()
    cy.goToNextFormSection()

    // SELECT MAIN CONTACT POINT
    cy.get('#contactPoint_MOTHER').click()
    cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
      '01526972106'
    )
    cy.goToNextFormSection()

    // APPLICATION FORM
    // CHILD DETAILS
    cy.get('#familyName').type('স্পিভক')
    cy.get('#familyNameEng').type('Spivak')
    cy.selectOption('#gender', 'Female', 'Female')
    cy.get('#childBirthDate-dd').type('01')
    cy.get('#childBirthDate-mm').type('08')
    cy.get('#childBirthDate-yyyy').type('2018')
    cy.get('#multipleBirth').type('1')
    cy.selectOption('#placeOfBirth', 'Private_Home', 'Private Home')
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.goToNextFormSection()

    // MOTHER DETAILS
    cy.selectOption('#iDType', 'National_ID', 'National ID')
    cy.get('#iD').type('6684176876871')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
    cy.get('#familyName').type('বেগম')
    cy.get('#familyNameEng').type('Begum')
    cy.get('#motherBirthDate-dd').type('01')
    cy.get('#motherBirthDate-mm').type('08')
    cy.get('#motherBirthDate-yyyy').type('1971')
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.goToNextFormSection()

    // FATHER DETAILS
    cy.get('#fathersDetailsExist_false').click()
    cy.goToNextFormSection()

    // DOCUMENTS
    cy.goToNextFormSection()

    // PREVIEW
    cy.get('#submit_form').click()

    // MODAL
    cy.get('#submit_confirm').click()
    cy.waitUntilApplicationSynced()
    cy.get('#row_0 #submitted0').should('exist')

    // LOG OUT
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()

    // LOGIN AS LOCAL REGISTRAR
    cy.get('#username').type('mohammad.ashraful')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#code').type('000000')
    cy.get('#login-mobile-submit').click()
    cy.createPin()

    // LANDING PAGE
    cy.get('#ListItemAction-0-Review', { timeout: 30000 }).should('exist')
    cy.get('#ListItemAction-0-Review')
      .first()
      .click()
    cy.get('#registerApplicationBtn').click()

    // MODAL
    cy.get('#submit_confirm').click()
    cy.waitUntilApplicationSynced()
    cy.get('#Spinner').should('not.exist')
  })

  it('Tests from application to registration using maximum input', () => {
    // LOGIN AS FIELD WORKER
    cy.login('fieldWorker')
    // CREATE PIN
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn', { timeout: 30000 }).click()
    for (let i = 1; i <= 8; i++) {
      cy.get('#pin-keypad-container')
        .click()
        .type(`${i % 2}`)
    }
    // LANDING PAGE
    cy.get('#header_new_event', { timeout: 30000 }).should('be.visible')
    cy.get('#header_new_event').click()
    // EVENTS
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#continue').click()
    cy.get('#select_informant_BOTH_PARENTS').click()
    cy.get('#continue').click()
    cy.get('#applicant_MOTHER').click()
    cy.wait(1000)
    cy.get('#next_section').click()
    // SELECT MAIN CONTACT POINT
    cy.get('#contactPoint_FATHER').click()
    cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
      '01526972106'
    )
    cy.wait(1000)
    cy.get('#next_section').click()
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
    cy.selectOption('#placeOfBirth', 'Private_Home', 'Private Home')
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
    cy.selectOption('#iDType', 'National_ID', 'National ID')
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
    cy.selectOption('#educationalAttainment', 'PRIMARY_ISCED_1', 'Primary')
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Chittagong', 'Chittagong')
    cy.selectOption('#districtPermanent', 'Chandpur', 'Chandpur')
    cy.selectOption('#addressLine4Permanent', 'Kachua', 'Kachua')
    cy.selectOption('#addressLine3Permanent', 'Bitara', 'Bitara')
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
    // cy.get('#fathersDetailsExist_true').click()
    cy.selectOption('#iDType', 'National_ID', 'National ID')
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
    cy.selectOption('#educationalAttainment', 'PRIMARY_ISCED_1', 'Primary')
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
    cy.log('Waiting for application to sync...')
    cy.wait(6000) // Wait for application to be sync'd
    // LOG OUT
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
    // LOGIN AS LOCAL REGISTRAR
    cy.get('#username').type('mohammad.ashraful')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#code').type('000000')
    cy.get('#login-mobile-submit').click()
    // CREATE PIN
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn', { timeout: 30000 }).click()
    for (let i = 1; i <= 8; i++) {
      cy.get('#pin-keypad-container')
        .click()
        .type(`${i % 2}`)
    }
    // LANDING PAGE
    cy.wait(3000)
    cy.get('#ListItemAction-0-Review').should('exist')
    cy.get('#ListItemAction-0-Review')
      .first()
      .click()
    cy.get('#registerApplicationBtn').click()
    // MODAL
    cy.get('#submit_confirm').click()
    cy.log('Waiting for application to sync...')
    cy.wait(5000)
  })

  it('Tests from application to rejection using minimum input', () => {
    // LOGIN
    cy.login('fieldWorker')
    // CREATE PIN
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn').click()
    for (let i = 1; i <= 8; i++) {
      cy.get('#pin-keypad-container')
        .click()
        .type(`${i % 2}`)
    }
    // LANDING PAGE
    cy.get('#header_new_event', { timeout: 30000 }).should('be.visible')
    cy.get('#header_new_event').click()
    // EVENTS
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#continue').click()
    // SELECT INFORMANT
    cy.get('#select_informant_BOTH_PARENTS').click()
    cy.get('#continue').click()
    // SELECT APPLICANT
    cy.get('#applicant_MOTHER').click()
    cy.wait(1000)
    cy.get('#next_section').click()
    // SELECT MAIN CONTACT POINT
    cy.get('#contactPoint_MOTHER').click()
    cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
      '01526972106'
    )
    cy.wait(1000)
    cy.get('#next_section').click()
    // APPLICATION FORM
    // CHILD DETAILS
    cy.get('#familyName').type('চৌধুরী')
    cy.get('#familyNameEng').type('Chowdhury')
    cy.selectOption('#gender', 'Male', 'Male')
    cy.get('#childBirthDate-dd').type('22')
    cy.get('#childBirthDate-mm').type('10')
    cy.get('#childBirthDate-yyyy').type('1991')
    cy.get('#multipleBirth').type('1')
    cy.selectOption('#placeOfBirth', 'Private_Home', 'Private Home')
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.wait(1000)
    cy.get('#next_section').click()
    // MOTHER DETAILS
    cy.selectOption('#iDType', 'National_ID', 'National ID')
    cy.get('#iD').type('6684176876871')
    cy.selectOption('#nationality', 'Bangladesh', 'Bangladesh')
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
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
    // LOGIN AS LOCAL REGISTRAR
    cy.get('#username').type('mohammad.ashraful')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#code').type('000000')
    cy.get('#login-mobile-submit').click()
    // CREATE PIN
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn', { timeout: 30000 }).click()
    for (let i = 1; i <= 8; i++) {
      cy.get('#pin-keypad-container')
        .click()
        .type(`${i % 2}`)
    }
    // LANDING PAGE
    cy.wait(3000)
    cy.get('#ListItemAction-0-Review').should('exist')
    cy.get('#ListItemAction-0-Review')
      .first()
      .click()
    cy.get('#rejectApplicationBtn').click()
    // REJECT MODAL
    cy.get('#rejectionReasonother').click()
    cy.get('#rejectionCommentForHealthWorker').type(
      'Lack of information, please notify informant about it.'
    )
    cy.get('#submit_reject_form').click()
    cy.log('Waiting for application to sync...')
    cy.wait(5000)
  })

  it('Tests from application to rejection using maximum input', () => {
    // LOGIN AS FIELD WORKER
    cy.login('fieldWorker')
    // CREATE PIN
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn').click()
    for (let i = 1; i <= 8; i++) {
      cy.get('#pin-keypad-container')
        .click()
        .type(`${i % 2}`)
    }
    // LANDING PAGE
    cy.get('#header_new_event', { timeout: 30000 }).should('be.visible')
    cy.get('#header_new_event').click()
    // EVENTS
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#continue').click()
    cy.get('#select_informant_BOTH_PARENTS').click()
    cy.get('#continue').click()
    cy.get('#applicant_MOTHER').click()
    cy.wait(1000)
    cy.get('#next_section').click()
    // SELECT MAIN CONTACT POINT
    cy.get('#contactPoint_MOTHER').click()
    cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
      '01526972106'
    )
    cy.wait(1000)
    cy.get('#next_section').click()
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
    cy.selectOption('#placeOfBirth', 'Private_Home', 'Private Home')
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
    cy.selectOption('#iDType', 'National_ID', 'National ID')
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
    cy.selectOption('#educationalAttainment', 'PRIMARY_ISCED_1', 'Primary')
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Chittagong', 'Chittagong')
    cy.selectOption('#districtPermanent', 'Chandpur', 'Chandpur')
    cy.selectOption('#addressLine4Permanent', 'Kachua', 'Kachua')
    cy.selectOption('#addressLine3Permanent', 'Bitara', 'Bitara')
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
    cy.selectOption('#iDType', 'National_ID', 'National ID')
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
    cy.selectOption('#educationalAttainment', 'PRIMARY_ISCED_1', 'Primary')
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
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
    // LOGIN AS LOCAL REGISTRAR
    cy.get('#username').type('mohammad.ashraful')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#code').type('000000')
    cy.get('#login-mobile-submit').click()
    // CREATE PIN
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn', { timeout: 30000 }).click()
    for (let i = 1; i <= 8; i++) {
      cy.get('#pin-keypad-container')
        .click()
        .type(`${i % 2}`)
    }
    // LANDING PAGE
    cy.wait(3000)
    cy.get('#ListItemAction-0-Review').should('exist')
    cy.get('#ListItemAction-0-Review')
      .first()
      .click()
    cy.get('#rejectApplicationBtn').click()
    // REJECT MODAL
    cy.get('#rejectionReasonother').click()
    cy.get('#rejectionCommentForHealthWorker').type(
      'Lack of information, please notify informant about it.'
    )
    cy.get('#submit_reject_form').click()
    cy.log('Waiting for application to sync...')
    cy.wait(5000)
  })

  it('Tests registration by registrar using maximum input', () => {
    // LOGIN AS FIELD WORKER
    cy.login('registrar')
    // CREATE PIN
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn', { timeout: 30000 }).click()
    for (let i = 1; i <= 8; i++) {
      cy.get('#pin-keypad-container')
        .click()
        .type(`${i % 2}`)
    }
    // LANDING PAGE
    cy.get('#header_new_event', { timeout: 30000 }).should('be.visible')
    cy.get('#header_new_event').click()
    // EVENTS
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#continue').click()
    cy.get('#select_informant_BOTH_PARENTS').click()
    cy.get('#continue').click()
    cy.get('#applicant_MOTHER').click()
    cy.get('#next_section').click()
    // SELECT MAIN CONTACT POINT
    cy.get('#contactPoint_FATHER').click()
    cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
      '01526972106'
    )
    cy.wait(1000)
    cy.get('#next_section').click()
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
    cy.selectOption('#placeOfBirth', 'Private_Home', 'Private Home')
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
    cy.selectOption('#iDType', 'National_ID', 'National ID')
    cy.get('#iD').type('1994789456123')
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
    cy.selectOption('#educationalAttainment', 'PRIMARY_ISCED_1', 'Primary')
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Chittagong', 'Chittagong')
    cy.selectOption('#districtPermanent', 'Chandpur', 'Chandpur')
    cy.selectOption('#addressLine4Permanent', 'Kachua', 'Kachua')
    cy.selectOption('#addressLine3Permanent', 'Bitara', 'Bitara')
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
    // cy.get('#fathersDetailsExist_true').click()
    cy.selectOption('#iDType', 'National_ID', 'National ID')
    cy.get('#iD').type('1994789456123')
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
    cy.selectOption('#educationalAttainment', 'PRIMARY_ISCED_1', 'Primary')
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
    cy.get('#registerApplicationBtn').click()
    // MODAL
    cy.get('#submit_confirm').click()
    cy.log('Waiting for application to sync...')
    cy.wait(5000) // Wait for application to be sync'd
  })

  it('Test Someone else journey using minimum input', () => {
    // LOGIN
    cy.login('fieldWorker')
    // CREATE PIN
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn', { timeout: 30000 }).click()
    for (let i = 1; i <= 8; i++) {
      cy.get('#pin-keypad-container')
        .click()
        .type(`${i % 2}`)
    }
    // LANDING PAGE
    cy.get('#header_new_event', { timeout: 30000 }).should('be.visible')
    cy.get('#header_new_event').click()
    // EVENTS
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#continue').click()
    // SELECT INFORMANT
    cy.get('#select_informant_OTHER').click()
    cy.get('#continue').click()
    // SELECT APPLICANT
    cy.get('#applicant_OTHER').click()
    cy.wait(1000)
    cy.get('#applicant\\.nestedFields\\.otherRelationShip').type(
      'Unnamed relation'
    )
    cy.wait(1000)
    cy.get('#next_section').click()
    // SELECT MAIN CONTACT POINT
    cy.get('#contactPoint_MOTHER').click()
    cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
      '01526972106'
    )
    cy.wait(1000)
    cy.get('#next_section').click()
    // APPLICATION FORM
    // CHILD DETAILS
    cy.get('#familyName').type('ববিতা')
    cy.get('#familyNameEng').type('Bobita')
    cy.selectOption('#gender', 'Female', 'Female')
    cy.get('#childBirthDate-dd').type('01')
    cy.get('#childBirthDate-mm').type('08')
    cy.get('#childBirthDate-yyyy').type('2018')
    cy.get('#multipleBirth').type('1')
    cy.selectOption('#placeOfBirth', 'Private_Home', 'Private Home')
    cy.selectOption('#country', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#state', 'Dhaka', 'Dhaka')
    cy.selectOption('#district', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4', 'Kaliganj', 'Kaliganj')
    cy.wait(1000)
    cy.get('#next_section').click()
    // APPLICANT'S DETAILS
    cy.selectOption('#iDType', 'National_ID', 'National ID')
    cy.get('#applicantID').type('6684176876871')
    cy.get('#applicantFamilyName').type('বেগম')
    cy.get('#applicantFamilyNameEng').type('Begum')
    cy.get('#applicantBirthDate-dd').type('01')
    cy.get('#applicantBirthDate-mm').type('08')
    cy.get('#applicantBirthDate-yyyy').type('1971')
    cy.selectOption('#countryPermanent', 'Bangladesh', 'Bangladesh')
    cy.selectOption('#statePermanent', 'Dhaka', 'Dhaka')
    cy.selectOption('#districtPermanent', 'Gazipur', 'Gazipur')
    cy.selectOption('#addressLine4Permanent', 'Kaliganj', 'Kaliganj')
    cy.wait(1000)
    cy.get('#next_section').click()
    //  PRIMARY CARE GIVER DETAILS
    cy.get('#parentDetailsType_NONE').click()
    cy.wait(1000)
    cy.get('#next_section').click()
    //  Why are the mother and father not applying?
    cy.get('#motherIsDeceaseddeceased').click()
    cy.wait(1000)
    cy.get('#fatherIsDeceaseddeceased').click()
    cy.wait(1000)
    cy.get('#next_section').click()
    //  Who is looking after the child?
    cy.get('#primaryCaregiverType_INFORMANT').click()
    cy.wait(1500)
    cy.get('#next_section').click()
    // MOTHER DETAILS
    cy.selectOption('#iDType', 'National_ID', 'National ID')
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
    cy.log('Waiting for application to sync...')
    cy.wait(6000) // Wait for application to be sync'd
    // LOG OUT
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
    // LOGIN AS LOCAL REGISTRAR
    cy.get('#username').type('mohammad.ashraful')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#code').type('000000')
    cy.get('#login-mobile-submit').click()
    // CREATE PIN
    cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
    cy.get('#createPinBtn', { timeout: 30000 }).click()
    for (let i = 1; i <= 8; i++) {
      cy.get('#pin-keypad-container')
        .click()
        .type(`${i % 2}`)
    }
    // LANDING PAGE
    cy.wait(3000)
    cy.get('#ListItemAction-0-Review').should('exist')
    cy.get('#ListItemAction-0-Review')
      .first()
      .click()
    cy.get('#registerApplicationBtn').click()
    // MODAL
    cy.get('#submit_confirm').click()
    cy.log('Waiting for application to sync...')
    cy.wait(5000)
  })
})
