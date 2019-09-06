import { userDetails, validImageB64String } from '@register/tests/util'
import { userTransformers } from '@register/pdfRenderer/transformer/userTransformer'
import { createIntl } from 'react-intl'
import { omit } from 'lodash'
import { IUserDetails } from '@register/utils/userUtils'

describe("PDF template's logged-in user field related transformer tests", () => {
  const intl = createIntl({
    locale: 'en'
  })

  describe('LocalRegistrarUserName transformer tests', () => {
    it('Returns the name properly', () => {
      const transformedValue = userTransformers.LocalRegistrarUserName(
        userDetails,
        intl
      )
      expect(transformedValue).toEqual('Mohammad Ashraful')
    })
    it('Returns empty name if no name found for given locale', () => {
      const transformedValue = userTransformers.LocalRegistrarUserName(
        omit(userDetails, 'localRegistrar.name') as IUserDetails,
        intl
      )
      expect(transformedValue).toEqual('')
    })
  })
  describe('LoggedInUserOfficeName transformer tests', () => {
    it('Returns the office name properly', () => {
      const transformedValue = userTransformers.LoggedInUserOfficeName(
        userDetails,
        intl
      )
      expect(transformedValue).toEqual('Kaliganj Union Sub Center')
    })
    it('Returns empty office name if no office is found', () => {
      const transformedValue = userTransformers.LoggedInUserOfficeName(
        omit(userDetails, 'primaryOffice'),
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
        userDetails,
        intl
      )
      expect(transformedValue).toEqual('Registrar')
    })
    it('Returns empty role', () => {
      const transformedValue = userTransformers.LocalRegistrarUserRole(
        omit(userDetails, 'localRegistrar.role') as IUserDetails,
        intl
      )
      expect(transformedValue).toEqual('')
    })
  })
  describe('LoggedInUserSignature transformer tests', () => {
    it('Returns the signature data properly', () => {
      const transformedValue = userTransformers.LocalRegistrarUserSignature(
        userDetails,
        intl
      )
      expect(transformedValue).toEqual(
        `data:image/png;base64,${validImageB64String}`
      )
    })
    it('Returns empty signature', () => {
      const transformedValue = userTransformers.LocalRegistrarUserSignature(
        omit(userDetails, 'localRegistrar.signature') as IUserDetails,
        intl
      )
      expect(transformedValue).toEqual('')
    })
  })
})
