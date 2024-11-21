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
import { z } from 'zod'
import { Action, ActionConfig, ActionType } from './Action'
import { Label, Summary } from './utils'

/**
 * A subset of an event. Describes fields that can be sent to the system with the intention of either creating or mutating a an event
 */
export const EventInput = z.object({
  type: z.string()
})
export type EventInput = z.infer<typeof EventInput>

/**
 * Description of event features defined by the country. Includes configuration for process steps and forms involved.
 */
export const EventConfig = z.object({
  id: z.string(),
  label: Label,
  summary: Summary,
  actions: z.array(ActionConfig)
})

export type EventConfig = z.infer<typeof EventConfig>

/**
 * A subset of an event. Describes how the event is stored in the search index. Contains static fields shared by all event types and custom fields defined by event configuration
 */

export const EventIndex = z.object({
  id: z.string(),
  event: z.string(),
  status: z.enum([ActionType.CREATE]),
  createdAt: z.date(),
  createdBy: z.string(),
  createdAtLocation: z.string(), // uuid
  modifiedAt: z.date(),
  assignedTo: z.string(),
  updatedBy: z.string(),
  data: z.object({})
})

export type EventIndex = z.infer<typeof EventIndex>

export const Event = EventInput.extend({
  id: z.string(),
  type: z.string(), // Should be replaced by a reference to a form version
  createdAt: z.date(),
  updatedAt: z.date(),
  actions: z.array(Action)
})

export type Event = z.infer<typeof Event>

/**
 * Builds a validated configuration for an event
 * @param config - Event specific configuration
 */
export const defineConfig = (config: EventConfig) =>
  EventConfig.safeParse(config)
