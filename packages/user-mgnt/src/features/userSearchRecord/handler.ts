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
import { logger } from '@user-mgnt/logger'
import User, { IUserModel, Event } from '@user-mgnt/model/user'
import { unauthorized } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import * as uuid from 'uuid/v4'

enum RegStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  ARCHIVED = 'ARCHIVED',
  DECLARED = 'DECLARED',
  DECLARATION_UPDATED = 'DECLARATION_UPDATED',
  WAITING_VALIDATION = 'WAITING_VALIDATION',
  VALIDATED = 'VALIDATED',
  REGISTERED = 'REGISTERED',
  CERTIFIED = 'CERTIFIED',
  REJECTED = 'REJECTED',
  ISSUED = 'ISSUED'
}
interface IUserCreateSearchPayload {
  userId: string
  name: string
  parameters: {
    event?: Event
    registrationStatuses?: string[]
    dateOfEvent?: string
    dateOfEventStart?: string
    dateOfEventEnd?: string
    registrationNumber?: string
    trackingId?: string
    dateOfRegistration?: string
    dateOfRegistrationStart?: string
    dateOfRegistrationEnd?: string
    declarationLocationId?: string
    declarationJurisdictionId?: string
    eventLocationId?: string
    eventLocationLevel1?: string
    eventLocationLevel2?: string
    eventLocationLevel3?: string
    eventLocationLevel4?: string
    eventLocationLevel5?: string
    childFirstNames?: string
    childLastName?: string
    childDoB?: string
    childDoBStart?: string
    childDoBEnd?: string
    childGender?: string
    deceasedFirstNames?: string
    deceasedFamilyName?: string
    deceasedGender?: string
    deceasedDoB?: string
    deceasedDoBStart?: string
    deceasedDoBEnd?: string
    motherFirstNames?: string
    motherFamilyName?: string
    motherDoB?: string
    motherDoBStart?: string
    motherDoBEnd?: string
    fatherFirstNames?: string
    fatherFamilyName?: string
    fatherDoB?: string
    fatherDoBStart?: string
    fatherDoBEnd?: string
    informantFirstNames?: string
    informantFamilyName?: string
    informantDoB?: string
    informantDoBStart?: string
    informantDoBEnd?: string
  }
}

interface IUserRemoveSearchPayload {
  userId: string
  searchId: string
}

export const validEvent = Object.values(Event)

export async function createSearchHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const userCreateSearchPayload = request.payload as IUserCreateSearchPayload
  const user: IUserModel | null = await User.findById(
    userCreateSearchPayload.userId
  )
  const mutableUser = user?.toObject() as IUserModel

  if (!mutableUser) {
    logger.error(
      `No user details found by given userid: ${userCreateSearchPayload.userId}`
    )
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }

  const modifiedPayload = {
    searchId: uuid(),
    ...userCreateSearchPayload
  }

  if (mutableUser.searches) {
    mutableUser.searches.push(modifiedPayload)
  } else {
    mutableUser.searches = [modifiedPayload]
  }

  try {
    await User.updateOne({ _id: mutableUser._id }, mutableUser)
  } catch (err) {
    // return 400 if there is a validation error when updating to mongo
    return h.response(err.message).code(400)
  }
  return h.response({ searchList: mutableUser.searches }).code(201)
}

export async function removeSearchHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const userSearchRemovePayload = request.payload as IUserRemoveSearchPayload
  const user: IUserModel | null = await User.findById(
    userSearchRemovePayload.userId
  )
  if (!user || !user.searches) {
    logger.error(
      `No user or search details found by given userid: ${userSearchRemovePayload.userId}`
    )
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }

  const filteredSearchList = user.searches?.filter(
    (searchData) => searchData.searchId !== userSearchRemovePayload.searchId
  )
  user.searches = filteredSearchList
  try {
    await User.updateOne({ _id: user._id }, user)
  } catch (err) {
    // return 400 if there is a validation error when updating to mongo
    return h.response(err.message).code(400)
  }

  return h.response({ searchList: user.searches }).code(200)
}

export const createSearchrequestSchema = Joi.object({
  userId: Joi.string().required(),
  name: Joi.string().required(),
  parameters: Joi.object({
    event: Joi.string().valid(...validEvent),
    registrationStatuses: Joi.array().items(
      Joi.string().valid(
        RegStatus.IN_PROGRESS,
        RegStatus.ARCHIVED,
        RegStatus.DECLARED,
        RegStatus.DECLARATION_UPDATED,
        RegStatus.WAITING_VALIDATION,
        RegStatus.VALIDATED,
        RegStatus.REGISTERED,
        RegStatus.CERTIFIED,
        RegStatus.REJECTED,
        RegStatus.ISSUED
      )
    ),
    dateOfEvent: Joi.string(),
    dateOfEventStart: Joi.string(),
    dateOfEventEnd: Joi.string(),
    registrationNumber: Joi.string(),
    trackingId: Joi.string(),
    dateOfRegistration: Joi.string(),
    dateOfRegistrationStart: Joi.string(),
    dateOfRegistrationEnd: Joi.string(),
    declarationLocationId: Joi.string(),
    declarationJurisdictionId: Joi.string(),
    eventCountry: Joi.string(),
    eventLocationId: Joi.string(),
    eventLocationLevel1: Joi.string(),
    eventLocationLevel2: Joi.string(),
    eventLocationLevel3: Joi.string(),
    eventLocationLevel4: Joi.string(),
    eventLocationLevel5: Joi.string(),
    childFirstNames: Joi.string(),
    childLastName: Joi.string(),
    childDoB: Joi.string(),
    childDoBStart: Joi.string(),
    childDoBEnd: Joi.string(),
    childGender: Joi.string(),
    deceasedFirstNames: Joi.string(),
    deceasedFamilyName: Joi.string(),
    deceasedGender: Joi.string(),
    deceasedDoB: Joi.string(),
    deceasedDoBStart: Joi.string(),
    deceasedDoBEnd: Joi.string(),
    motherFirstNames: Joi.string(),
    motherFamilyName: Joi.string(),
    motherDoB: Joi.string(),
    motherDoBStart: Joi.string(),
    motherDoBEnd: Joi.string(),
    fatherFirstNames: Joi.string(),
    fatherFamilyName: Joi.string(),
    fatherDoB: Joi.string(),
    fatherDoBStart: Joi.string(),
    fatherDoBEnd: Joi.string(),
    informantFirstNames: Joi.string(),
    informantFamilyName: Joi.string(),
    informantDoB: Joi.string(),
    informantDoBStart: Joi.string(),
    informantDoBEnd: Joi.string()
  })
})

export const removeSearchrequestSchema = Joi.object({
  userId: Joi.string().required(),
  searchId: Joi.string().required()
})
