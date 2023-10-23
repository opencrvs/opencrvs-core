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
import { EVENT_TYPE } from '@gateway/features/fhir/constants'
import {
  GQLBirthRegistrationInput,
  GQLDeathRegistrationInput,
  GQLMarriageRegistrationInput
} from '@gateway/graphql/schema'
import { IAuthHeader } from '@opencrvs/commons'
import { Bundle } from '@opencrvs/commons/types'

export type Context<A extends string | number | symbol = never> = {
  authHeader: IAuthHeader
  event: EVENT_TYPE
  _index: { [Key in A]: number }
}
export type IFieldBuilderFunction<
  Key extends string | number | symbol,
  FieldType
> = (
  accumulatedObj: Bundle,
  fieldValue: NonNullable<FieldType>,
  context: Context<Key>
) => Promise<Bundle | void | boolean> | Bundle | void | boolean

type AllInputs = GQLBirthRegistrationInput &
  GQLDeathRegistrationInput &
  GQLMarriageRegistrationInput

type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N

export type IFieldBuilders<
  RootKey extends string | number | symbol = '',
  Root extends Record<string, any> = AllInputs
> = {
  [Key in keyof Root]: IfAny<
    Root[Key],
    IFieldBuilderFunction<RootKey | Key, any>,
    // Value is an array, take the inner item
    NonNullable<Root[Key]> extends Array<infer Item>
      ? // If the inner item is a record, keep on recursing
        NonNullable<Item> extends Record<any, any>
        ? IFieldBuilders<RootKey | Key, NonNullable<Item>>
        : // Otherwise expect a builder function
          IFieldBuilderFunction<RootKey | Key, Item>
      : // If it's not an array, but a record instead
      NonNullable<Root[Key]> extends Record<any, any>
      ? // Keep on recursing
        IFieldBuilders<RootKey | Key, NonNullable<Root[Key]>>
      : // Otherwise expect a builder function
        IFieldBuilderFunction<RootKey | Key, Root[Key]>
  >
}

function isFieldBuilder(
  x: IFieldBuilderFunction<any, any> | IFieldBuilders
): x is IFieldBuilders {
  return typeof x === 'object'
}

function isBuilderFunction(
  x: IFieldBuilderFunction<any, any> | IFieldBuilders
): x is IFieldBuilderFunction<any, any> {
  return typeof x === 'function'
}

async function transformField(
  sourceVal: any,
  targetObj: any,
  fieldBuilderForVal: IFieldBuilderFunction<any, any> | IFieldBuilders,
  context: Context<any>,
  currentPropNamePath: string[]
) {
  if (!(sourceVal instanceof Date) && typeof sourceVal === 'object') {
    if (isFieldBuilder(fieldBuilderForVal)) {
      const result = await transformObj(
        sourceVal,
        targetObj,
        fieldBuilderForVal,
        context,
        currentPropNamePath
      )
      if (result) {
        targetObj = result
      }
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
    const result = await fieldBuilderForVal(targetObj, sourceVal, context)
    if (result) {
      targetObj = result
    }
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
  sourceObj: Record<string, unknown>,
  bundle: Bundle,
  fieldBuilders: IFieldBuilders,
  context: Context<any>,
  currentPropNamePath: string[] = []
) {
  // ensure the sourceObj has Object in its prototype chain
  // graphql-js creates objects with Object.create(null)
  sourceObj = Object.assign({}, sourceObj)
  let targetObj = bundle

  for (const currentPropName in sourceObj) {
    if (sourceObj.hasOwnProperty(currentPropName)) {
      if (Array.isArray(sourceObj[currentPropName])) {
        for (const [index, arrayVal] of (
          sourceObj[currentPropName] as Array<unknown>
        ).entries()) {
          context._index = { ...context._index, [currentPropName]: index }

          const result = await transformField(
            arrayVal,
            targetObj,
            fieldBuilders[currentPropName as keyof typeof fieldBuilders] as any,
            context,
            currentPropNamePath.concat(currentPropName)
          )
          if (result) {
            targetObj = result
          }
        }

        continue
      }

      const result = await transformField(
        sourceObj[currentPropName],
        targetObj,
        fieldBuilders[currentPropName as keyof typeof fieldBuilders] as any,
        context,
        currentPropNamePath.concat(currentPropName)
      )
      if (result) {
        targetObj = result
      }
    }
  }

  return targetObj
}
