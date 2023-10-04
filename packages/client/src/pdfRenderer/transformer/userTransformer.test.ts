/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  userDetails,
  validImageB64String,
  mockDeclarationData,
  mockOfflineData
} from '@client/tests/util'
import { userTransformers } from '@client/pdfRenderer/transformer/userTransformer'
import { createIntl } from 'react-intl'
import { omit } from 'lodash'
import { Event } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'
import { TemplateTransformerData } from './types'

describe("PDF template's logged-in user field related transformer tests", () => {
  const intl = createIntl({
    locale: 'en'
  })
  const data: TemplateTransformerData = {
    declaration: { id: '123', event: Event.Birth, data: mockDeclarationData },
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
      data.userDetails = omit(userDetails, 'localRegistrar.name') as UserDetails
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
      data.userDetails = omit(userDetails, 'localRegistrar.role') as UserDetails
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
      ) as UserDetails
      const transformedValue = userTransformers.LocalRegistrarUserSignature(
        data,
        intl
      )
      expect(transformedValue).toEqual('')
    })
  })
  describe('CRVSOfficeName transformer tests', () => {
    it('Returns the office name properly', () => {
      const transformedValue = userTransformers.CRVSOfficeName(data, intl)
      expect(transformedValue).toEqual('Kaliganj Union Sub Center')
    })
    it('Returns the office alias properly', () => {
      const transformedValue = userTransformers.CRVSOfficeName(data, intl, {
        language: 'bn'
      })
      expect(transformedValue).toEqual('কালিগাঞ্জ ইউনিয়ন পরিষদ')
    })
    it('Returns empty name if no name found for given locale', () => {
      data.userDetails = omit(userDetails, 'primaryOffice.name') as UserDetails
      const transformedValue = userTransformers.CRVSOfficeName(data, intl)
      expect(transformedValue).toEqual('')
    })
    it('Returns empty alias if no name found for given locale', () => {
      data.userDetails = omit(userDetails, 'primaryOffice.alias') as UserDetails
      const transformedValue = userTransformers.CRVSOfficeName(data, intl, {
        language: 'bn'
      })
      expect(transformedValue).toEqual('')
    })
  })
  describe('CRVSLocationName transformer tests', () => {
    it('Returns the location name properly', () => {
      const transformedValue = userTransformers.CRVSLocationName(data, intl, {
        jurisdictionType: 'UNION'
      })
      expect(transformedValue).toEqual('BAKTARPUR')
    })
    it('Returns the location alias properly', () => {
      const transformedValue = userTransformers.CRVSLocationName(data, intl, {
        jurisdictionType: 'UNION',
        language: 'bn'
      })
      expect(transformedValue).toEqual('বক্তারপুর')
    })
    it('Returns empty name if no location found for given jurisdiction type', () => {
      const transformedValue = userTransformers.CRVSLocationName(data, intl, {
        jurisdictionType: 'INVALID'
      })
      expect(transformedValue).toEqual('')
    })
    it('Returns empty alias if no location found for given jurisdiction type', () => {
      const transformedValue = userTransformers.CRVSLocationName(data, intl, {
        jurisdictionType: 'INVALID',
        language: 'bn'
      })
      expect(transformedValue).toEqual('')
    })
    it('Returns empty if no catchmentArea found', () => {
      data.userDetails = omit(userDetails, 'catchmentArea') as UserDetails
      const transformedValue = userTransformers.CRVSLocationName(data, intl, {
        jurisdictionType: 'UNION',
        language: 'bn'
      })
      expect(transformedValue).toEqual('')
    })
    it('Throws exception if payload is not provided', () => {
      expect(() => userTransformers.CRVSLocationName(data, intl)).toThrowError(
        'No payload found for this transformer'
      )
    })
  })
})
