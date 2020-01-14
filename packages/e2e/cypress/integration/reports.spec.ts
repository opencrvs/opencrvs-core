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

context('Reports Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it.skip('Tests for performance reports birth using minimum input', () => {
    // LOGIN AS LOCAL REGISTRAR
    cy.initializeFakeTimers()
    cy.login('registrar')
    cy.createPin()

    // CLICK PERFORMANCE MENU ITEM
    cy.get('#menu-performance').click()

    // CLICK MONTHLY REPORTS BIRTH CURRENT MONTH ROW FIRST COLUMN
    cy.get('#row_' + new Date().getMonth())
      .first()
      .children()
      .first()
      .children()
      .click()

    cy.tick(20000)

    // INPUT SEARCH LOCATION
    cy.get('#locationSearchInput').type('Narsingdi')
    cy.get('#locationSearchInput')
      .siblings('ul')
      .children()
      .first()
      .click()

    cy.tick(20000)

    //  CHECK GENDER BASIS METRICS TOTAL
    cy.get('#listTable-genderBasisMetrics-footer')
      .children()
      .last()
      .contains(6)

    //  CHECK TIMEFRAMES TOTAL
    cy.get('#listTable-timeFrames-footer')
      .children()
      .last()
      .contains(6)

    //  CHECK PAYMENTS TOTAL
    cy.get('#listTable-payments-footer')
      .children()
      .last()
      .contains(0)
  })
})
