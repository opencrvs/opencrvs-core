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

import { IConfigField, IConfigFieldMap } from './utils'
import { shiftCurrentFieldUp, shiftCurrentFieldDown } from './motionUtils'
import { FieldPosition } from '@client/forms/configuration'

const mockConfigFieldOne: IConfigField = {
  fieldId: 'one',
  enabled: '',
  preceedingFieldId: FieldPosition.TOP,
  foregoingFieldId: 'two'
}

const mockConfigFieldTwo: IConfigField = {
  fieldId: 'two',
  enabled: '',
  preceedingFieldId: 'one',
  foregoingFieldId: 'three'
}

const mockConfigFieldThree: IConfigField = {
  fieldId: 'three',
  enabled: '',
  preceedingFieldId: 'two',
  foregoingFieldId: FieldPosition.BOTTOM
}

const fieldMap: IConfigFieldMap = {
  one: mockConfigFieldOne,
  two: mockConfigFieldTwo,
  three: mockConfigFieldThree
}

describe('moveConfigFieldUp', () => {
  it('should do nothing if field is already at the top', () => {
    const newSection = shiftCurrentFieldUp(
      fieldMap,
      mockConfigFieldOne,
      undefined,
      mockConfigFieldTwo
    )
    expect(newSection).toBe(fieldMap)
  })

  it('should move the current field up', () => {
    const newSection = shiftCurrentFieldUp(
      fieldMap,
      mockConfigFieldTwo,
      mockConfigFieldOne,
      mockConfigFieldThree
    )
    expect(newSection.one.preceedingFieldId).toBe('two')
    expect(newSection.two.preceedingFieldId).toBe(FieldPosition.TOP)
    expect(newSection.three.preceedingFieldId).toBe('one')

    expect(newSection.one.foregoingFieldId).toBe('three')
    expect(newSection.two.foregoingFieldId).toBe('one')
    expect(newSection.three.foregoingFieldId).toBe(FieldPosition.BOTTOM)
  })

  it('should move the move the bottom most field up properly', () => {
    const newSection = shiftCurrentFieldUp(
      fieldMap,
      mockConfigFieldThree,
      mockConfigFieldTwo,
      undefined
    )
    expect(newSection.one.preceedingFieldId).toBe(FieldPosition.TOP)
    expect(newSection.two.preceedingFieldId).toBe('three')
    expect(newSection.three.preceedingFieldId).toBe('one')

    expect(newSection.one.foregoingFieldId).toBe('three')
    expect(newSection.two.foregoingFieldId).toBe(FieldPosition.BOTTOM)
    expect(newSection.three.foregoingFieldId).toBe('two')
  })
})

describe('moveConfigFieldDown', () => {
  it('should do nothing if field is already at the bottom', () => {
    const newSection = shiftCurrentFieldDown(
      fieldMap,
      mockConfigFieldThree,
      mockConfigFieldTwo,
      undefined
    )
    expect(newSection).toBe(fieldMap)
  })

  it('should move the current field down', () => {
    const newSection = shiftCurrentFieldDown(
      fieldMap,
      mockConfigFieldTwo,
      mockConfigFieldOne,
      mockConfigFieldThree
    )
    expect(newSection.one.preceedingFieldId).toBe(FieldPosition.TOP)
    expect(newSection.two.preceedingFieldId).toBe('three')
    expect(newSection.three.preceedingFieldId).toBe('one')

    expect(newSection.one.foregoingFieldId).toBe('three')
    expect(newSection.two.foregoingFieldId).toBe(FieldPosition.BOTTOM)
    expect(newSection.three.foregoingFieldId).toBe('two')
  })

  it('should move the move the top most field down properly', () => {
    const newSection = shiftCurrentFieldDown(
      fieldMap,
      mockConfigFieldOne,
      undefined,
      mockConfigFieldTwo
    )
    expect(newSection.one.preceedingFieldId).toBe('two')
    expect(newSection.two.preceedingFieldId).toBe(FieldPosition.TOP)
    expect(newSection.three.preceedingFieldId).toBe('one')

    expect(newSection.one.foregoingFieldId).toBe('three')
    expect(newSection.two.foregoingFieldId).toBe('one')
    expect(newSection.three.foregoingFieldId).toBe(FieldPosition.BOTTOM)
  })
})
