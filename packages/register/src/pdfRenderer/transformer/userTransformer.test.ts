import { userDetails, validImageB64String } from '@register/tests/util'
import { userTransformers } from '@register/pdfRenderer/transformer/userTransformer'
import { createIntl } from 'react-intl'
import { omit } from 'lodash'

describe("PDF template's logged-in user field related transformer tests", () => {
  const intl = createIntl({
    locale: 'en'
  })

  describe('LoggedInUserName transformer tests', () => {
    it('Returns the name properly', () => {
      const transformedValue = userTransformers.LoggedInUserName(
        userDetails,
        intl
      )
      expect(transformedValue).toEqual('Shakib Al Hasan')
    })
    it('Returns empty name if no name found for given locale', () => {
      const transformedValue = userTransformers.LoggedInUserName(
        omit(userDetails, 'name'),
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
  describe('LoggedInUserRole transformer tests', () => {
    it('Returns the role properly', () => {
      const intl = createIntl({
        locale: 'en',
        messages: {
          FIELD_AGENT: 'Field Agent'
        }
      })

      const transformedValue = userTransformers.LoggedInUserRole(
        userDetails,
        intl
      )
      expect(transformedValue).toEqual('Field Agent')
    })
    it('Returns empty role', () => {
      const transformedValue = userTransformers.LoggedInUserRole(
        omit(userDetails, 'role'),
        intl
      )
      expect(transformedValue).toEqual('')
    })
  })
  describe('LoggedInUserSignature transformer tests', () => {
    it('Returns the signature data properly', () => {
      const transformedValue = userTransformers.LoggedInUserSignature(
        userDetails,
        intl
      )
      expect(transformedValue).toEqual(
        `data:image/png;base64,${validImageB64String}`
      )
    })
    it('Returns empty signature', () => {
      const transformedValue = userTransformers.LoggedInUserSignature(
        omit(userDetails, 'signature'),
        intl
      )
      expect(transformedValue).toEqual('')
    })
  })
})
