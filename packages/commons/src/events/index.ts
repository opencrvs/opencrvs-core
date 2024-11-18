import { z } from 'zod'
import { Action } from './Action'

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
 * A subset of an event. Describes how the event is stored in the search index. Contains static fields shared by all event types and custom fields defined by event configuration
 */
export const EventIndex = z.object({})
/**
 * Describes a physical location. Can be a admin structure, an office or something else. Cannot be anyone's personal home address
 */
export const Location = z.object({})
/**
 * User in the system. Might be a practitioner or an admin or something else.
 */
export const User = z.object({})

export const Event = EventInput.extend({
  id: z.string(),
  type: z.string(), // Should be replaced by a reference to a form version
  createdAt: z.date(),
  actions: z.array(Action)
})
export type Event = z.infer<typeof Event>
