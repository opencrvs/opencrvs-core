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

context('Login', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('LOGIN_URL'))
  })

  it('takes user to the registration app once correct credentials are given', () => {
    cy.get('#username').type('sakibal.hasan')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#code').type('000000')

    cy.get('#login-mobile-submit').click()
  })
})
