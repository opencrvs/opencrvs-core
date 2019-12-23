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

  it('Tests search application by contact number using minimum input', () => {
    cy.initializeFakeTimers()

    // DECLARE APPLICATION AS FIELD AGENT
    cy.declareApplicationWithMinimumInput()

    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    cy.createPin()

    // SEARCH APPLICATION
    cy.get('#searchType').click()
    cy.get('#name').click()
    cy.get('#searchText').type('Spivak')
    cy.get('#searchText').type('{enter}')

    // CLICK DOWNLOAD AND REGISTER APPLICATION
    cy.downloadFirstApplication()
    cy.get('#ListItemAction-0-Review').should('exist')
    cy.get('#ListItemAction-0-Review')
      .first()
      .click()
    cy.registerApplication()
  })
})
