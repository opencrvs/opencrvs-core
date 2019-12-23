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

context('Certificate Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('Tests from application to certification using minimum input', () => {
    // REGISTER APPLICATION
    cy.initializeFakeTimers()
    cy.registerApplicationWithMinimumInput()

    // GO TO PRINT TAB
    cy.get('#tab_print').click()
    cy.tick(20000)

    // DOWNLOAD AND GO FOR PRINT
    cy.downloadFirstApplication()
    cy.get('#ListItemAction-0-Print').click()

    // GO FOR CERTFICATE COLLECTION
    cy.get('#type_MOTHER').click()
    cy.get('#confirm_form').click()
    cy.get('#verifyPositive').click()
    cy.get('#Continue').click()
    cy.tick(2000)

    // CHECK IF CERTIFICATE APPEARS IN PDF VIEWER
    cy.get('.react-pdf__message react-pdf__message--no-data').should(
      'not.exist'
    )
    cy.get('.react-pdf__Page').should('exist')

    // TODO: UNCOMMENT THESE LINES WHILE WE SUPPORT CHROME HEADLESS AS DEFAULT BROWSER FOR CYPRESS
    // cy.get('#confirm-print').click()
    // cy.tick(20000)
    // cy.get('#print-certificate').click()
    // cy.tick(20000)
    // cy.get('#print-cert-notification').should('exist')
  })
})
