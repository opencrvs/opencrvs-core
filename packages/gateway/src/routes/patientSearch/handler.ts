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
import * as Joi from 'joi'
import * as Hapi from '@hapi/hapi'
import { fetchFromHearth } from '@gateway/features/fhir/utils'

interface ISearchParams {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  dateOfDeath?: string
  gender?: string
  offset?: number
  limit?: number
}

interface IAttributeError {
  code?: number
  message?: string
}

interface IResponseAttribute {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  dateOfDeath?: string
  gender?: string
}

const validAttributes = [
  'firstName',
  'lastName',
  'dateOfBirth',
  'dateOfDeath',
  'gender'
]

export async function getPersonsRecord(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const searchParams = request.query as ISearchParams
  const params = new URLSearchParams()
  const {
    firstName,
    lastName,
    dateOfBirth,
    dateOfDeath,
    gender,
    limit,
    offset
  } = searchParams

  if (firstName) params.set('given', firstName)
  if (lastName) params.set('family', lastName)
  if (limit) params.set('_count', String(limit))
  if (offset) params.set('_getpagesoffset', String(offset))
  if (dateOfBirth) params.set('dateOfBirth', dateOfBirth)
  if (dateOfDeath) params.set('dateOfDeath', dateOfDeath)
  if (gender) params.set('gender', gender)

  const queryString = params.toString()
  const names = (request.query.names || []) as Array<keyof IResponseAttribute>

  try {
    const response = (await fetchFromHearth(
      `/Patient?${queryString}`
    )) as fhir.Bundle
    const result = response?.entry?.map((person) => {
      const { name, gender, birthDate, deceasedDateTime, identifier } =
        person.resource as fhir.Patient

      const allAttributes: IResponseAttribute = {
        firstName: name?.[0]?.given?.[0],
        lastName: name?.[0]?.family?.[0],
        gender,
        dateOfBirth: birthDate,
        dateOfDeath: deceasedDateTime
      }

      if (names.length > 0) {
        const requestedAttributes: IResponseAttribute | IAttributeError = {}
        for (const attr of names) {
          if (validAttributes.includes(attr)) {
            requestedAttributes[attr] = allAttributes[attr] || ''
          } else {
            requestedAttributes[attr] = {
              code: '1023',
              message: 'Unknown attribute name'
            }
          }
        }
        return requestedAttributes
      }
      const nidIdentifier = identifier?.find(
        (id) => id.type === 'OSIA_UIN_VID_NID'
      )
      return { uid: nidIdentifier?.value || '' }
    })

    return h.response(result).code(200)
  } catch (error) {
    return h.response('Internal Server Error').code(500)
  }
}

export async function getSinglePersonRecord(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const uin = request.params.uin
  const names = request.query.attributeNames as Array<keyof IResponseAttribute>
  try {
    const response = (await fetchFromHearth(
      `/Patient?identifier=${uin}`
    )) as fhir.Bundle
    const person = response?.entry?.[0]
    const { name, gender, birthDate, deceasedDateTime } =
      person?.resource as fhir.Patient

    const allAttributes: IResponseAttribute = {
      firstName: name?.[0]?.given?.[0],
      lastName: name?.[0]?.family?.[0],
      gender,
      dateOfBirth: birthDate,
      dateOfDeath: deceasedDateTime
    }

    const requestedAttributes: IResponseAttribute | IAttributeError = {}
    for (const attr of names) {
      requestedAttributes[attr] = allAttributes[attr] || ''
      if (validAttributes.includes(attr)) {
        requestedAttributes[attr] = allAttributes[attr] || ''
      } else {
        requestedAttributes[attr] = {
          code: '1023',
          message: 'Unknown attribute name'
        }
      }
    }
    return h.response(requestedAttributes).code(200)
  } catch (error) {
    return h.response('Internal Server Error').code(500)
  }
}

export const requestSchemaForPersons = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  dateOfDeath: Joi.date().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  names: Joi.array().items(Joi.string()).min(1).single().optional(),
  offset: Joi.number().integer().min(0).optional(),
  limit: Joi.number().integer().min(0).optional()
}).or(...validAttributes)

export const requestQuerySchemaForPerson = Joi.object({
  transactionId: Joi.string(),
  attributeNames: Joi.array().items(Joi.string()).min(1).single().required()
})

export const requestParamSchemaForPerson = Joi.object({
  uin: Joi.string().required()
})
