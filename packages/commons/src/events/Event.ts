import { z } from 'zod'
import { Action, ActionConfig, ActionType } from './Action'
import { Label, Summary } from './utils'

/**
 * A subset of an event. Describes fields that can be sent to the system with the intention of either creating or mutating a an event
 */
export const EventInput = z.object({
  type: z.string(),
  fields: z.array(
    z.object({
      id: z.string(),
      value: z.union([
        z.string(),
        z.number(),
        z.array(
          // @TODO: Check if we could make this stricter
          z.object({
            optionValues: z.array(z.string()),
            type: z.string(),
            data: z.string(),
            fileSize: z.number()
          })
        )
      ])
    })
  )
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
