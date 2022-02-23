import { IAuthHeader } from '@gateway/common-types'
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
export type IFieldBuilderFunction = (
  accumulatedObj: any,
  fieldValue: string | number | boolean,
  context: any
) => void

export interface IFieldBuilders {
  [key: string]: IFieldBuilderFunction | IFieldBuilders
}

function isFieldBuilder(
  x: IFieldBuilderFunction | IFieldBuilders
): x is IFieldBuilders {
  return typeof x === 'object'
}

function isBuilderFunction(
  x: IFieldBuilderFunction | IFieldBuilders
): x is IFieldBuilderFunction {
  return typeof x === 'function'
}

async function transformField(
  sourceVal: any,
  targetObj: any,
  fieldBuilderForVal: IFieldBuilderFunction | IFieldBuilders,
  context: { authHeader: IAuthHeader },
  currentPropNamePath: string[]
) {
  if (!(sourceVal instanceof Date) && typeof sourceVal === 'object') {
    if (isFieldBuilder(fieldBuilderForVal)) {
      await transformObj(
        sourceVal,
        targetObj,
        fieldBuilderForVal,
        context,
        currentPropNamePath
      )
      return targetObj
    }

    throw new Error(
      `Expected ${JSON.stringify(
        fieldBuilderForVal
      )} to be a FieldBuilder object for field name ${currentPropNamePath.join(
        '.'
      )}. The current field value is ${JSON.stringify(sourceVal)}.`
    )
  }

  if (isBuilderFunction(fieldBuilderForVal)) {
    // tslint:disable-next-line
    await fieldBuilderForVal(targetObj, sourceVal, context)
    return targetObj
  }

  throw new Error(
    `Expected ${JSON.stringify(
      fieldBuilderForVal
    )} to be a FieldBuilderFunction for field name ${currentPropNamePath.join(
      '.'
    )}. The current field value is ${JSON.stringify(sourceVal)}.`
  )
}

export default async function transformObj(
  sourceObj: object,
  targetObj: object,
  fieldBuilders: IFieldBuilders,
  context: { _index?: any; authHeader: IAuthHeader },
  currentPropNamePath: string[] = []
) {
  // ensure the sourceObj has Object in its prototype chain
  // graphql-js creates objects with Object.create(null)
  // tslint:disable-next-line
  sourceObj = Object.assign({}, sourceObj)
  for (const currentPropName in sourceObj) {
    if (sourceObj.hasOwnProperty(currentPropName)) {
      if (Array.isArray(sourceObj[currentPropName])) {
        for (const [index, arrayVal] of sourceObj[currentPropName].entries()) {
          context._index = { ...context._index, [currentPropName]: index }

          /* context._index = {
            [currentPropName]: index
          } */

          await transformField(
            arrayVal,
            targetObj,
            fieldBuilders[currentPropName],
            context,
            currentPropNamePath.concat(currentPropName)
          )
        }

        continue
      }

      await transformField(
        sourceObj[currentPropName],
        targetObj,
        fieldBuilders[currentPropName],
        context,
        currentPropNamePath.concat(currentPropName)
      )
    }
  }

  return targetObj
}
