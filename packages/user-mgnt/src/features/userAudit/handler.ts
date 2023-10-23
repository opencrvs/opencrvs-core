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
import User, {
  AUDIT_ACTION,
  AUDIT_REASON,
  IAuditHistory,
  IUserModel
} from '@user-mgnt/model/user'
import { getUserId, statuses } from '@user-mgnt/utils/userUtils'
import { unauthorized } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { postUserActionToMetrics } from '@user-mgnt/features/changePhone/handler'

interface IAuditUserPayload {
  userId: string
  auditedBy: string
  action: string
  reason: string
  comment: string
}

export async function userAuditHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const auditUserPayload = request.payload as IAuditUserPayload
  const remoteAddress =
    request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']

  const user: IUserModel | null = await User.findById(auditUserPayload.userId)
  const systemAdminUser: IUserModel | null = await User.findById(
    getUserId({ Authorization: request.headers.authorization })
  )

  if (!user) {
    logger.error(
      `No user details found for requested userId: ${auditUserPayload.userId}`
    )
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }

  let updatedUserStatus
  if (AUDIT_ACTION[auditUserPayload.action] === AUDIT_ACTION.REACTIVATE) {
    updatedUserStatus = statuses.ACTIVE
  } else if (
    AUDIT_ACTION[auditUserPayload.action] === AUDIT_ACTION.DEACTIVATE
  ) {
    updatedUserStatus = statuses.DEACTIVATED
  } else {
    updatedUserStatus = user.status
  }

  let isCertificateActionOccur = false
  if (
    AUDIT_ACTION[auditUserPayload.action] === AUDIT_ACTION.CERTIFICATE_CREATED
  ) {
    isCertificateActionOccur = true
  } else if (
    AUDIT_ACTION[auditUserPayload.action] === AUDIT_ACTION.CERTIFICATE_CREATED
  ) {
    isCertificateActionOccur = true
  } else if (
    AUDIT_ACTION[auditUserPayload.action] === AUDIT_ACTION.CERTIFICATE_DELETED
  ) {
    isCertificateActionOccur = true
  }

  if (updatedUserStatus !== user.status || isCertificateActionOccur) {
    user.status = updatedUserStatus

    const auditData: IAuditHistory = {
      auditedBy: auditUserPayload.auditedBy,
      auditedOn: Date.now(),
      action: AUDIT_ACTION[AUDIT_ACTION[auditUserPayload.action]],
      reason: AUDIT_REASON[AUDIT_REASON[auditUserPayload.reason]],
      comment: auditUserPayload.comment
    }

    if (user.auditHistory) {
      user.auditHistory.push(auditData)
    } else {
      user.auditHistory = [auditData]
    }
    if (
      AUDIT_ACTION[auditUserPayload.action] === AUDIT_ACTION.REACTIVATE ||
      AUDIT_ACTION[auditUserPayload.action] === AUDIT_ACTION.DEACTIVATE
    ) {
      let action
      if (AUDIT_ACTION[auditUserPayload.action] === AUDIT_ACTION.REACTIVATE) {
        action = 'REACTIVATE'
      } else {
        action = 'DEACTIVATE'
      }
      const subjectPractitionerId = user.practitionerId
      const practitionerId = systemAdminUser!.practitionerId

      try {
        await postUserActionToMetrics(
          action,
          request.headers.authorization,
          remoteAddress,
          userAgent,
          practitionerId,
          subjectPractitionerId
        )
      } catch (err) {
        logger.error(err)
      }
    }
    try {
      await User.update({ _id: user._id }, user)
    } catch (err) {
      logger.error(err.message)
      // return 400 if there is a validation error when updating to mongo
      return h.response().code(400)
    }
  }
  return h.response().code(200)
}

export const requestSchema = Joi.object({
  userId: Joi.string().required(),
  auditedBy: Joi.string().required(),
  action: Joi.string().required(),
  reason: Joi.string().required(),
  comment: Joi.string().allow('')
})
