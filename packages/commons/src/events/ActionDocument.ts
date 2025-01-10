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
import { ActionType } from './ActionConfig'
import { z } from 'zod'
import { FieldValue } from './FieldValue'

/**
 * @type ActionDocument - Peristed action document schema
 * @type ResolvedActionDocument - Transient action document schema where user and location ids are resolved to actual values
 */

/** ActionDocument START */

const ActionBase = z.object({
  createdAt: z.string().datetime(),
  createdBy: z.string(),
  data: z.record(z.string(), FieldValue),
  draft: z.boolean().optional().default(false),
  createdAtLocation: z.string()
})

const AssignedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.ASSIGN),
    assignedTo: z.string()
  })
)

const UnassignedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.UNASSIGN)
  })
)

const RegisterAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.REGISTER),
    identifiers: z.object({
      trackingId: z.string(),
      registrationNumber: z.string()
    })
  })
)

const DeclareAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.DECLARE)
  })
)

const ValidateAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.VALIDATE)
  })
)

const CreatedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.CREATE)
  })
)

const NotifiedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.NOTIFY)
  })
)

const CustomAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.CUSTOM)
  })
)

export const ActionDocument = z.discriminatedUnion('type', [
  CreatedAction,
  ValidateAction,
  NotifiedAction,
  RegisterAction,
  DeclareAction,
  AssignedAction,
  UnassignedAction,
  CustomAction
])
export type ActionDocument = z.infer<typeof ActionDocument>

/** ActionDocument END */

/**  ResolvedActionDocument START */
export const ResolvedUser = z.object({
  id: z.string(),
  systemRole: z.string(),
  name: z.array(
    z.object({
      use: z.string(),
      given: z.array(z.string()),
      family: z.string()
    })
  )
})

export type ResolvedUser = z.infer<typeof ResolvedUser>

export const ResolvedLocation = z.object({
  id: z.string(),
  externalId: z.string().nullable(),
  name: z.string(),
  partOf: z.string().nullable()
})

export type ResolvedLocation = z.infer<typeof ResolvedLocation>

const ResolvedActionBase = ActionBase.extend({
  createdBy: ResolvedUser,
  createdAtLocation: ResolvedLocation
})

const ResolvedAssignedAction = ResolvedActionBase.merge(
  z.object({
    type: z.literal(ActionType.ASSIGN),
    assignedTo: ResolvedUser
  })
)

const ResolvedUnassignedAction = ResolvedActionBase.merge(
  z.object({
    type: z.literal(ActionType.UNASSIGN)
  })
)

const ResolvedRegisterAction = ResolvedActionBase.merge(
  z.object({
    type: z.literal(ActionType.REGISTER),
    identifiers: z.object({
      trackingId: z.string(),
      registrationNumber: z.string()
    })
  })
)

const ResolvedDeclareAction = ResolvedActionBase.merge(
  z.object({
    type: z.literal(ActionType.DECLARE)
  })
)

const ResolvedValidateAction = ResolvedActionBase.merge(
  z.object({
    type: z.literal(ActionType.VALIDATE)
  })
)

const ResolvedCreatedAction = ResolvedActionBase.merge(
  z.object({
    type: z.literal(ActionType.CREATE)
  })
)

const ResolvedNotifiedAction = ResolvedActionBase.merge(
  z.object({
    type: z.literal(ActionType.NOTIFY)
  })
)

const ResolvedCustomAction = ResolvedActionBase.merge(
  z.object({
    type: z.literal(ActionType.CUSTOM)
  })
)

export const ResolvedActionDocument = z.discriminatedUnion('type', [
  ResolvedAssignedAction,
  ResolvedUnassignedAction,
  ResolvedRegisterAction,
  ResolvedDeclareAction,
  ResolvedValidateAction,
  ResolvedCreatedAction,
  ResolvedNotifiedAction,
  ResolvedCustomAction
])

export type ResolvedActionDocument = z.infer<typeof ResolvedActionDocument>

/**  ResolvedActionDocument END */

export type CreatedAction = z.infer<typeof CreatedAction>

export type ActionFormData = ActionDocument['data']
