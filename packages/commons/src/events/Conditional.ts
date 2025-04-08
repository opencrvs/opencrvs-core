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

import { JSONSchema } from '../conditionals/conditionals'
import { z } from 'zod'

export const Conditional = z.custom<JSONSchema>(
  (val) => typeof val === 'object' && val !== null
)

/**
 * By default, when conditionals are undefined, action is visible and enabled to everyone.
 */
export const ConditionalType = {
  SHOW: 'SHOW',
  ENABLE: 'ENABLE',
  DISPLAY_ON_REVIEW: 'DISPLAY_ON_REVIEW'
} as const

export type ConditionalType =
  (typeof ConditionalType)[keyof typeof ConditionalType]

export const ShowConditional = z.object({
  type: z
    .literal(ConditionalType.SHOW)
    .describe(
      "If 'SHOW' conditional is defined, the component is shown to the user only if the condition is met"
    ),
  conditional: Conditional
})

export const EnableConditional = z.object({
  type: z
    .literal(ConditionalType.ENABLE)
    .describe(
      "If 'ENABLE' conditional is defined, the component is enabled only if the condition is met"
    ),
  conditional: Conditional
})

/*
 * This needs to be exported so that Typescript can refer to the type in
 * the declaration output type. If it can't do that, you might start encountering
 * "The inferred type of this node exceeds the maximum length the compiler will serialize. An explicit type annotation is needed"
 * errors when compiling
 */
/** @knipignore */
export type TActionConditional =
  | typeof ShowConditional
  | typeof EnableConditional

/** @knipignore */
export type InferredActionConditional =
  | z.infer<typeof ShowConditional>
  | z.infer<typeof EnableConditional>

export const ActionConditional = z.discriminatedUnion('type', [
  // Action can be shown / hidden
  ShowConditional,
  // Action can be shown to the user in the list but as disabled
  EnableConditional
]) as unknown as z.ZodDiscriminatedUnion<'type', TActionConditional[]>

export type ActionConditional = InferredActionConditional

export const DisplayOnReviewConditional = z.object({
  type: z
    .literal(ConditionalType.DISPLAY_ON_REVIEW)
    .describe(
      "If 'DISPLAY_ON_REVIEW' conditional is defined, the component is shown on the review page only if both the 'DISPLAY_ON_REVIEW' and 'SHOW' conditions are met. This should only be used for fields within declaration forms, as they are the only ones with review pages."
    ),
  conditional: Conditional
})

/*
 * This needs to be exported so that Typescript can refer to the type in
 * the declaration output type. If it can't do that, you might start encountering
 * "The inferred type of this node exceeds the maximum length the compiler will serialize. An explicit type annotation is needed"
 * errors when compiling
 */
/** @knipignore */
export type TFieldConditional =
  | typeof ShowConditional
  | typeof EnableConditional
  | typeof DisplayOnReviewConditional

/** @knipignore */
export type InferredFieldConditional =
  | z.infer<typeof ShowConditional>
  | z.infer<typeof EnableConditional>
  | z.infer<typeof DisplayOnReviewConditional>

export const FieldConditional = z.discriminatedUnion('type', [
  // Field input can be shown / hidden
  ShowConditional,
  // Field input can be shown to the user but as disabled
  EnableConditional,
  // Field output can be shown / hidden on the review page
  DisplayOnReviewConditional
]) as unknown as z.ZodDiscriminatedUnion<'type', TFieldConditional[]>

export type FieldConditional = z.infer<typeof FieldConditional>
