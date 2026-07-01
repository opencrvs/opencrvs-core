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
import * as z from 'zod/v4'
import { TranslationConfig } from './TranslationConfig'
import { ActionType } from './ActionType'
import { FieldConfig } from './FieldConfig'
import { ActionFormConfig } from './FormConfig'
import { DeduplicationConfig } from './DeduplicationConfig'
import { ActionFlagConfig } from './Flag'
import { ActionConditional } from './Conditional'

export const DeclarationReviewConfig = z
  .object({
    title: TranslationConfig.describe('Title of the review page'),
    fields: z
      .array(FieldConfig)
      .describe('Fields displayed on the review page for annotations.')
  })
  .describe(
    'Configuration of the declaration review page for collecting event-related metadata.'
  )

export const ActionConfigBase = z.object({
  label: TranslationConfig.describe('Human readable description of the action'),
  flags: z
    .array(ActionFlagConfig)
    .optional()
    .default([])
    .describe('Flag actions which are executed when the action is performed.'),
  supportingCopy: TranslationConfig.optional().describe(
    'Text displayed on the confirmation dialog'
  ),
  /**
   * Icon representing the action.
   *
   * This could reference AvailableIcons, but it was causing TS7056 error:
   * "The inferred type of this node exceeds the maximum length the compiler will serialize. An explicit type annotation is needed."
   * for EventConfig.d.ts.
   */
  icon: z.string().describe('Icon representing the action').optional(),
  conditionals: z
    .array(ActionConditional)
    .optional()
    .describe('Conditionals which can disable or hide actions.')
})

const DeclarationActionBase = ActionConfigBase.extend({
  deduplication: DeduplicationConfig.optional()
})

const ReadActionConfig = ActionConfigBase.extend(
  z.object({
    type: z.literal(ActionType.READ),
    review: DeclarationReviewConfig.describe(
      'Configuration of the review page for read-only view.'
    ),
    conditionals: z
      .never()
      .optional()
      .describe('Read-action can not be disabled or hidden with conditionals.')
  }).shape
)

const NotifyConfig = ActionConfigBase.extend(
  z.object({
    type: z.literal(ActionType.NOTIFY)
  }).shape
)

const DeclareConfig = DeclarationActionBase.extend(
  z.object({
    type: z.literal(ActionType.DECLARE),
    review: DeclarationReviewConfig.describe(
      'Configuration of the review page fields.'
    ),
    dialogCopy: z
      .object({
        notify: TranslationConfig.describe(
          'Confirmation text for the notify action'
        ),
        declare: TranslationConfig.describe(
          'Confirmation text for the declare action'
        ),
        register: TranslationConfig.describe(
          'Confirmation text for the register action'
        )
      })
      .optional()
  }).shape
)

const ArchiveConfig = ActionConfigBase.extend(
  z.object({
    type: z.literal(ActionType.ARCHIVE)
  }).shape
)

const EditActionConfig = ActionConfigBase.extend(
  z.object({
    type: z.literal(ActionType.EDIT),
    dialogCopy: z.object({
      notify: TranslationConfig.describe(
        'Confirmation text for the notify with edits action'
      ),
      declare: TranslationConfig.describe(
        'Confirmation text for the declare with edits action'
      ),
      register: TranslationConfig.describe(
        'Confirmation text for the register with edits action'
      )
    })
  }).shape
)

const RejectConfig = ActionConfigBase.extend(
  z.object({
    type: z.literal(ActionType.REJECT)
  }).shape
)

const RegisterConfig = DeclarationActionBase.extend(
  z.object({
    type: z.literal(ActionType.REGISTER)
  }).shape
)

const PrintCertificateActionConfig = ActionConfigBase.extend(
  z.object({
    type: z.literal(ActionType.PRINT_CERTIFICATE),
    printForm: ActionFormConfig
  }).shape
)

const RequestCorrectionConfig = ActionConfigBase.extend(
  z.object({
    type: z.literal(ActionType.REQUEST_CORRECTION),
    correctionForm: ActionFormConfig
  }).shape
)

const CustomActionConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.CUSTOM),
    customActionType: z
      .string()
      .describe('Type identifier of the custom action.'),
    /** Custom action form configuration supports a simple array of field configs, which should be rendered on the action modal. In the future, we might add support for pages etc. */
    form: z
      .array(FieldConfig)
      .describe(
        'Form configuration for the custom action. The form configured here will be used on the custom action confirmation modal.'
      ),
    auditHistoryLabel: TranslationConfig.describe(
      'The label to show in audit history for this action. For example "Approved".'
    )
  })
)

export type CustomActionConfig = z.infer<typeof CustomActionConfig>

export const ActionConfig = z
  .discriminatedUnion('type', [
    /*
     * OpenAPI references are defined here so our generated OpenAPI spec knows to reuse the models
     * and treat them as "models" instead of duplicating the data structure in each endpoint.
     */
    ReadActionConfig.meta({
      id: 'ReadActionConfig',
      description:
        'Configuration for the read action — defines the record-tab content displayed on the event overview page.'
    }),
    NotifyConfig.meta({
      id: 'NotifyActionConfig',
      description:
        'Configuration for the notify action. When present, NOTIFY uses this config independently from DECLARE. When absent, NOTIFY falls back to the DeclareActionConfig.'
    }),
    DeclareConfig.meta({
      id: 'DeclareActionConfig',
      description:
        'Configuration for the declare action. Includes review-page fields. NOTIFY falls back to this config when no dedicated NotifyActionConfig is provided.'
    }),
    RejectConfig.meta({
      id: 'RejectActionConfig',
      description: 'Configuration for rejecting a record before registration.'
    }),
    RegisterConfig.meta({
      id: 'RegisterActionConfig',
      description: 'Configuration for registering a record.'
    }),
    PrintCertificateActionConfig.meta({
      id: 'PrintCertificateActionConfig',
      description:
        'Configuration for printing a certificate of a registered record.'
    }),
    RequestCorrectionConfig.meta({
      id: 'RequestCorrectionActionConfig',
      description:
        'Configuration for requesting a correction on a registered record.'
    }),
    EditActionConfig.meta({
      id: 'EditActionConfig',
      description: 'Configuration for editing a record before registration.'
    }),
    ArchiveConfig.meta({
      id: 'ArchiveActionConfig',
      description: 'Configuration for archiving a record.'
    }),
    CustomActionConfig.meta({
      id: 'CustomActionConfig',
      description:
        'Configuration for a country-defined custom action. An event may include any number of these.'
    })
  ])
  .describe(
    'Configuration of an action available for an event. Data collected depends on the action type and is accessible through the annotation property in ActionDocument.'
  )
  .meta({ id: 'ActionConfig' })

export type ActionConfig = z.infer<typeof ActionConfig>

// Build a runtime set directly from the schema
export const actionConfigTypes: Set<ActionConfigTypes> = new Set(
  ActionConfig.options.map((opt) => opt.shape.type.value)
)
/**
 * Action types that come specifically from the country configuration.
 *
 * These are not the same as the broader workflow `action.type` values.
 * `ActionConfigTypes` includes only the action kinds that can be defined
 * in the country configuration (e.g. NOTIFY, DECLARE, VALIDATE, CUSTOM), and
 * excludes workflow-only types such as CREATE.
 */
export type ActionConfigTypes = ActionConfig['type']

export const DeclarationActionConfig = z.discriminatedUnion('type', [
  DeclareConfig,
  RegisterConfig
])

export type DeclarationActionConfig = z.infer<typeof DeclarationActionConfig>
