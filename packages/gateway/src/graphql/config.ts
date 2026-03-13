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
import { GraphQLSchema } from 'graphql'

import { ApolloServerOptions } from '@apollo/server'
import { userTypeResolvers } from '@gateway/features/user/type-resolvers'
import { Context } from '@gateway/graphql/context'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchemaSync } from '@graphql-tools/load'
import {
  addResolversToSchema,
  makeExecutableSchema
} from '@graphql-tools/schema'
import { readFileSync } from 'fs'
import { IResolvers } from 'graphql-tools'
import { merge } from 'lodash'

const graphQLSchemaPath = `${__dirname}/schema.graphql`

interface IStringIndexSignatureInterface {
  [index: string]: any
}

type StringIndexed<T> = T & IStringIndexSignatureInterface

export const resolvers: StringIndexed<IResolvers> = merge(

  userTypeResolvers as IResolvers,
  {
  }
)

export const schema = loadSchemaSync(graphQLSchemaPath, {
  loaders: [new GraphQLFileLoader()]
})

export const getExecutableSchema = (): GraphQLSchema => {
  return addResolversToSchema({
    schema,
    resolvers
  })
}

export const getApolloConfig = (): ApolloServerOptions<Context> => {
  const typeDefs = readFileSync(graphQLSchemaPath, 'utf8')
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  })

  return {
    schema,
    introspection: true
  }
}

/* credit: https://github.com/Urigo/graphql-scalars */

// Check whether a certain year is a leap year.
//
// Every year that is exactly divisible by four
// is a leap year, except for years that are exactly
// divisible by 100, but these centurial years are
// leap years if they are exactly divisible by 400.
// For example, the years 1700, 1800, and 1900 are not leap years,
// but the years 1600 and 2000 are.
//
const leapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

// Function that checks whether a date-string is RFC 3339 compliant.
//
// It checks whether the date-string is a valid date in the YYYY-MM-DD.
//
// Note, the number of days in each date are determined according to the
// following lookup table:
//
// Month Number  Month/Year           Maximum value of date-mday
// ------------  ----------           --------------------------
// 01            January              31
// 02            February, normal     28
// 02            February, leap year  29
// 03            March                31
// 04            April                30
// 05            May                  31
// 06            June                 30
// 07            July                 31
// 08            August               31
// 09            September            30
// 10            October              31
// 11            November             30
// 12            December             31
//
export const validateDate = (datestring: string): boolean => {
  const RFC_3339_REGEX = /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01]))$/

  if (!RFC_3339_REGEX.test(datestring)) {
    return false
  }

  // Verify the correct number of days for
  // the month contained in the date-string.
  const year = Number(datestring.substring(0, 4))
  const month = Number(datestring.substring(5, 2))
  const day = Number(datestring.substring(8, 2))

  switch (month) {
    case 2: // February
      if (leapYear(year) && day > 29) {
        return false
      } else if (!leapYear(year) && day > 28) {
        return false
      }
      return true
    case 4: // April
    case 6: // June
    case 9: // September
    case 11: // November
      if (day > 30) {
        return false
      }
      break
  }

  return true
}
