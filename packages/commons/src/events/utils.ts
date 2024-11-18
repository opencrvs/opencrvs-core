import { z } from 'zod'

export const Label = z.object({
  defaultMessage: z.string(),
  description: z.string(), // check if optional
  id: z.string() // check if optional
})

export const Value = z.object({
  defaultMessage: z.string(),
  description: z.string(), // check if optional
  id: z.string() // check if optional
})

// Ask whether these are always together
export const Field = z.object({
  label: Label,
  value: Value
})

export const Summary = z.object({
  title: Label,
  fields: z.array(Field)
})

// @TODO
export const Query = z.object({
  requester: z.object({
    phone: z.object({
      check: z.string()
    }),
    name: z.object({
      check: z.string()
    })
  })
})
