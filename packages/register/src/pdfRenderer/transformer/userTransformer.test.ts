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
import {
  userDetails,
  validImageB64String,
  mockApplicationData,
  mockOfflineData
} from '@register/tests/util'
import { userTransformers } from '@register/pdfRenderer/transformer/userTransformer'
import { createIntl } from 'react-intl'
import { omit } from 'lodash'
import { IUserDetails } from '@register/utils/userUtils'
import { TemplateTransformerData } from './types'
import { Event } from '@register/forms'

describe("PDF template's logged-in user field related transformer tests", () => {
  const intl = createIntl({
    locale: 'en'
  })
  const data: TemplateTransformerData = {
    application: { id: '123', event: Event.BIRTH, data: mockApplicationData },
    userDetails,
    resource: mockOfflineData
  }

  describe('LocalRegistrarUserName transformer tests', () => {
    it('Returns the name properly', () => {
      const transformedValue = userTransformers.LocalRegistrarUserName(
        data,
        intl
      )
      expect(transformedValue).toEqual('Mohammad Ashraful')
    })
    it('Returns empty name if no name found for given locale', () => {
      data.userDetails = omit(
        userDetails,
        'localRegistrar.name'
      ) as IUserDetails
      const transformedValue = userTransformers.LocalRegistrarUserName(
        data,
        intl
      )
      expect(transformedValue).toEqual('')
    })
  })
  describe('LoggedInUserName transformer tests', () => {
    it('Returns the name properly', () => {
      const transformedValue = userTransformers.LoggedInUserName(data, intl)
      expect(transformedValue).toEqual('Shakib Al Hasan')
    })
  })
  describe('LoggedInUserOfficeName transformer tests', () => {
    it('Returns the office name properly', () => {
      const transformedValue = userTransformers.LoggedInUserOfficeName(
        data,
        intl
      )
      expect(transformedValue).toEqual('Kaliganj Union Sub Center')
    })
    it('Returns empty office name if no office is found', () => {
      data.userDetails = omit(userDetails, 'primaryOffice')
      const transformedValue = userTransformers.LoggedInUserOfficeName(
        data,
        intl
      )
      expect(transformedValue).toEqual('')
    })
  })
  describe('LocalRegistrarUserRole transformer tests', () => {
    it('Returns the role properly', () => {
      const intl = createIntl({
        locale: 'en',
        messages: {
          REGISTRAR: 'Registrar'
        }
      })

      const transformedValue = userTransformers.LocalRegistrarUserRole(
        data,
        intl
      )
      expect(transformedValue).toEqual('Registrar')
    })
    it('Returns empty role', () => {
      data.userDetails = omit(
        userDetails,
        'localRegistrar.role'
      ) as IUserDetails
      const transformedValue = userTransformers.LocalRegistrarUserRole(
        data,
        intl
      )
      expect(transformedValue).toEqual('')
    })
  })
  describe('LoggedInUserRole transformer tests', () => {
    it('Returns the role properly', () => {
      const intl = createIntl({
        locale: 'en',
        messages: {
          FIELD_AGENT: 'Field Agent'
        }
      })

      const transformedValue = userTransformers.LoggedInUserRole(data, intl)
      expect(transformedValue).toEqual('Field Agent')
    })
  })
  describe('LoggedInUserSignature transformer tests', () => {
    it('Returns the signature data properly', () => {
      const transformedValue = userTransformers.LocalRegistrarUserSignature(
        data,
        intl
      )
      expect(transformedValue).toEqual(
        `data:image/png;base64,${validImageB64String}`
      )
    })
    it('Returns empty signature', () => {
      data.userDetails = omit(
        userDetails,
        'localRegistrar.signature'
      ) as IUserDetails
      const transformedValue = userTransformers.LocalRegistrarUserSignature(
        data,
        intl
      )
      expect(transformedValue).toEqual('')
    })
  })
})
