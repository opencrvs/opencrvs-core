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
import { IsNominal } from '../../nominal'
import { EVENT_TYPE } from '../../record'
import {
  BirthRegistration,
  DeathRegistration,
  MarriageRegistration
} from './input'

export type Context<A extends string | number | symbol = never> = {
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

type AllInputs = BirthRegistration & DeathRegistration & MarriageRegistration

type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N

type IsDate<T> = T extends Date ? true : false

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
      : // Check for nominal Date
      IsDate<NonNullable<Root[Key]>> extends true
      ? IFieldBuilderFunction<RootKey | Key, Root[Key]>
      : // Check for nominal type
      IsNominal<NonNullable<Root[Key]>> extends true
      ? // Otherwise expect a builder function
        IFieldBuilderFunction<RootKey | Key, Root[Key]>
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

function transformField(
  sourceVal: any,
  targetObj: any,
  fieldBuilderForVal: IFieldBuilderFunction<any, any> | IFieldBuilders,
  context: Context<any>,
  currentPropNamePath: string[]
) {
  if (!(sourceVal instanceof Date) && typeof sourceVal === 'object') {
    if (isFieldBuilder(fieldBuilderForVal)) {
      const result = transformObj(
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
    const result = fieldBuilderForVal(targetObj, sourceVal, context)
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

export default function transformObj(
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

          const result = transformField(
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

      const result = transformField(
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
