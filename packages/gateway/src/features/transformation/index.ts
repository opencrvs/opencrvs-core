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
import fetch from 'node-fetch'
import uuid from 'uuid'
import {
  createObservationEntryTemplate,
  createPersonEntryTemplate
} from '@gateway/features/fhir/templates'
import { set } from 'lodash'
import { logger } from '@gateway/logger'

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
  context: any,
  currentPropName: string
) {
  if (!(sourceVal instanceof Date) && typeof sourceVal === 'object') {
    if (isFieldBuilder(fieldBuilderForVal)) {
      await transformObj(sourceVal, targetObj, fieldBuilderForVal, context)
      return targetObj
    }

    throw new Error(
      `Expected ${JSON.stringify(
        fieldBuilderForVal
      )} to be a FieldBuilder object for field name ${currentPropName}. The current field value is ${JSON.stringify(
        sourceVal
      )}.`
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
    )} to be a FieldBuilderFunction for field name ${currentPropName}. The current field value is ${JSON.stringify(
      sourceVal
    )}.`
  )
}

export default async function transformObj(
  sourceObj: object,
  targetObj: object,
  fieldBuilders: IFieldBuilders,
  context: any = {}
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
            currentPropName
          )
        }

        continue
      }

      await transformField(
        sourceObj[currentPropName],
        targetObj,
        fieldBuilders[currentPropName],
        context,
        currentPropName
      )
    }
  }

  return targetObj
}

function findAllEntriesWithResourceType(
  entries: Array<any>,
  resourceType: string
) {
  return entries.filter(
    (entry) => entry.resource?.resourceType === resourceType
  )
}

export async function transformObj2(
  sourceArray: Array<{ fieldId: string; value: string }>,
  targeObj: any,
  context: any = {}
) {
  for (const { fieldId, value } of sourceArray) {
    let entry = Object.create(null)
    const res = await fetch(`http://localhost:2021/questions/${fieldId}`)
    const field = await res.json()
    logger.info(field)
    const resourceType = field.fhirSchema.split('[')[0] // i.e. fhirSchema = "Patient[0]"
    const entryIndexString = field.fhirSchema.match(/\[\d+\]/) // i.e. "[0]"
    const path = field.fhirSchema.split(']')[1] // i.e. 'key[0].value
    let specifiedIndex

    if (entryIndexString) {
      specifiedIndex = entryIndexString.replace(/\D/g, '')
    }
    if (specifiedIndex && resourceType) {
      const entriesWithResourceType = findAllEntriesWithResourceType(
        targeObj.entries,
        resourceType
      )
      if (entriesWithResourceType[specifiedIndex]) {
        entry = entriesWithResourceType[specifiedIndex]
      } else {
        const refUUID = uuid()
        if (resourceType === 'Patient') {
          entry = createPersonEntryTemplate(refUUID)
        } else {
          entry = createObservationEntryTemplate(refUUID)
        }
      }
      entry = set(entry, path, value)
    }
  }
}
