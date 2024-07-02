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

import { Bundle } from '..'
import transformObj, { IFieldBuilders } from './transformer'

const mockContext = { authHeader: { Authorization: '' } }

describe('Object transformation module', () => {
  it('converts an object using a simple set of field builders', async () => {
    const fieldBuilders: any = {
      gender: (accumulatedObj: any, fieldValue: any) => {
        accumulatedObj.gender = fieldValue === 'm' ? 'male' : 'female'
      },
      name: (accumulatedObj: any, fieldValue: any) => {
        if (!accumulatedObj.name) {
          accumulatedObj.name = []
        }

        accumulatedObj.name.push(fieldValue)
      }
    }

    const initialObject = { entry: [] }
    await transformObj(
      { gender: 'm', name: 'John Smith' },
      // transformObj is now strictly typed as a FHIR bundle
      // as in reality, that's what it's solely used for. These tests were
      // written before that change, so we need to cast the initialObject.
      //
      // If these tests start failing one day because new restrictions are added to
      // the transformObject function consider a complete rewrite of these tests.
      initialObject as any as Bundle,
      fieldBuilders,
      mockContext as any
    )

    expect(initialObject).toEqual({
      entry: [],
      gender: 'male',
      name: ['John Smith']
    })
  })

  it('converts an object using async field builders', async () => {
    const fieldBuilders = {
      gender: (accumulatedObj: any, fieldValue: any) => {
        accumulatedObj.gender = fieldValue === 'm' ? 'male' : 'female'
      },
      name: (accumulatedObj: any, fieldValue: any) => {
        if (!accumulatedObj.name) {
          accumulatedObj.name = []
        }

        accumulatedObj.name.push(fieldValue)
      }
    }

    const initialObject = { id: '123' }
    transformObj(
      { gender: 'm', name: 'John Smith' },
      // transformObj is now strictly typed as a FHIR bundle
      // as in reality, that's what it's solely used for. These tests were
      // written before that change, so we need to cast the initialObject.
      //
      // If these tests start failing one day because new restrictions are added to
      // the transformObject function consider a complete rewrite of these tests.
      initialObject as any as Bundle,
      fieldBuilders as any,
      mockContext as any
    )

    expect(initialObject).toEqual({
      id: '123',
      gender: 'male',
      name: ['John Smith']
    })
  })

  it('converts an object when some fields are arrays', async () => {
    const fieldBuilders = {
      gender: (accumulatedObj: any, fieldValue: any) => {
        accumulatedObj.gender = fieldValue === 'm' ? 'male' : 'female'
      },
      name: (accumulatedObj: any, fieldValue: any) => {
        if (!accumulatedObj.name) {
          accumulatedObj.name = []
        }

        accumulatedObj.name.push(fieldValue)
      }
    }

    const initialObject = { id: '123' }
    transformObj(
      { gender: 'm', name: ['John Smith', 'John D Smith'] },
      // transformObj is now strictly typed as a FHIR bundle
      // as in reality, that's what it's solely used for. These tests were
      // written before that change, so we need to cast the initialObject.
      //
      // If these tests start failing one day because new restrictions are added to
      // the transformObject function consider a complete rewrite of these tests.
      initialObject as any as Bundle,
      fieldBuilders as any,
      mockContext as any
    )

    expect(initialObject).toEqual({
      id: '123',
      gender: 'male',
      name: ['John Smith', 'John D Smith']
    })
  })

  it('converts an object with fields that are complex', async () => {
    const fieldBuilders = {
      name: {
        given: (accumulatedObj: any, fieldValue: any) => {
          accumulatedObj.given = fieldValue
        },
        family: (accumulatedObj: any, fieldValue: any) => {
          accumulatedObj.family = fieldValue
        }
      },
      this: {
        is: {
          deep: {
            man: (accumulatedObj: any, fieldValue: any) => {
              accumulatedObj.quote = fieldValue
            }
          }
        }
      }
    }

    const initialObject = { id: '123' }
    transformObj(
      {
        name: { given: 'John', family: 'Smith' },
        this: {
          is: {
            deep: {
              man: 'Every great developer you know got there by solving problems they were unqualified to solve until they actually did it'
            }
          }
        }
      },
      // transformObj is now strictly typed as a FHIR bundle
      // as in reality, that's what it's solely used for. These tests were
      // written before that change, so we need to cast the initialObject.
      //
      // If these tests start failing one day because new restrictions are added to
      // the transformObject function consider a complete rewrite of these tests.
      initialObject as any as Bundle,
      fieldBuilders as any,
      mockContext as any
    )

    expect(initialObject).toEqual({
      id: '123',
      given: 'John',
      family: 'Smith',
      quote:
        'Every great developer you know got there by solving problems they were unqualified to solve until they actually did it'
    })
  })

  it('throws an Error when field builder is an object instead of a function', async () => {
    const fieldBuilders: IFieldBuilders = {
      name: { mistake: {} }
    } as any

    const initialObject = {}
    expect(() =>
      transformObj(
        {
          name: ''
        },
        // transformObj is now strictly typed as a FHIR bundle
        // as in reality, that's what it's solely used for. These tests were
        // written before that change, so we need to cast the initialObject.
        //
        // If these tests start failing one day because new restrictions are added to
        // the transformObject function consider a complete rewrite of these tests.
        initialObject as any as Bundle,
        fieldBuilders,
        mockContext as any
      )
    ).toThrowError(/.*to be a FieldBuilderFunction.*/)
  })

  it('throws an Error when field builder is an function instead of an object', async () => {
    const fieldBuilders: IFieldBuilders = {
      name: () => ''
    } as any

    const initialObject = {}
    expect(() =>
      transformObj(
        {
          name: {
            given: 'John'
          }
        },
        // transformObj is now strictly typed as a FHIR bundle
        // as in reality, that's what it's solely used for. These tests were
        // written before that change, so we need to cast the initialObject.
        //
        // If these tests start failing one day because new restrictions are added to
        // the transformObject function consider a complete rewrite of these tests.
        initialObject as any as Bundle,
        fieldBuilders,
        mockContext as any
      )
    ).toThrowError(/.*to be a FieldBuilder object.*/)
  })

  it("throws an Error when field builder function doesn't exist for a field", async () => {
    const fieldBuilders: IFieldBuilders = {}

    const initialObject = {}
    expect(() =>
      transformObj(
        {
          name: {
            given: 'John'
          }
        },
        // transformObj is now strictly typed as a FHIR bundle
        // as in reality, that's what it's solely used for. These tests were
        // written before that change, so we need to cast the initialObject.
        //
        // If these tests start failing one day because new restrictions are added to
        // the transformObject function consider a complete rewrite of these tests.
        initialObject as any as Bundle,
        fieldBuilders,
        mockContext as any
      )
    ).toThrowError(/.*to be a FieldBuilder object.*/)
  })
})
