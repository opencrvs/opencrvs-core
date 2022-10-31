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
import { logger } from '@user-mgnt/logger'
import User, { IUserModel, Event, ISearch } from '@user-mgnt/model/user'
import { unauthorized } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'

interface IUserCreateSearchPayload {
  userId: string
  search: ISearch
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

  if (mutableUser.searches) {
    mutableUser.searches.push(userCreateSearchPayload.search)
  } else {
    mutableUser.searches = [userCreateSearchPayload.search]
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
  search: Joi.object({
    searchId: Joi.string().required(),
    name: Joi.string().required(),
    event: Joi.string().valid(...validEvent),
    registrationStatuses: Joi.string(),
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
