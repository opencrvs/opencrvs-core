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

import { TriggerEvent } from '@opencrvs/toolkit/notification'
import * as fs from 'fs'
import * as Handlebars from 'handlebars'
import { join } from 'path'
import { z } from 'zod'
import { InformantTemplateType } from '../sms-service'

const readBirthTemplate = <T extends Record<string, string>>(
  templateName: string
) =>
  Handlebars.compile<T>(
    fs.readFileSync(join(__dirname, `./birth/${templateName}.html`)).toString()
  )

const readDeathTemplate = <T extends Record<string, string>>(
  templateName: string
) =>
  Handlebars.compile<T>(
    fs.readFileSync(join(__dirname, `./death/${templateName}.html`)).toString()
  )

const readOtherTemplate = <T extends Record<string, string>>(
  templateName: string
) =>
  Handlebars.compile<T>(
    fs.readFileSync(join(__dirname, `./other/${templateName}.html`)).toString()
  )

const BaseVariables = z.object({
  applicationName: z.string(),
  countryLogo: z.string()
})

export const TriggerVariable = {
  [TriggerEvent.USER_CREATED]: z.object({
    firstname: z.string(),
    username: z.string(),
    temporaryPassword: z.string(),
    completeSetupUrl: z.string(),
    loginURL: z.string()
  }),
  [TriggerEvent.USER_UPDATED]: z.object({
    firstname: z.string(),
    oldUsername: z.string(),
    newUsername: z.string()
  }),
  [TriggerEvent.USERNAME_REMINDER]: z.object({
    firstname: z.string(),
    username: z.string()
  }),
  [TriggerEvent.RESET_PASSWORD]: z.object({
    firstname: z.string(),
    code: z.string()
  }),
  [TriggerEvent.RESET_PASSWORD_BY_ADMIN]: z.object({
    firstname: z.string(),
    temporaryPassword: z.string()
  }),
  [TriggerEvent.RESEND_INVITE]: z.object({
    firstname: z.string(),
    username: z.string(),
    temporaryPassword: z.string(),
    completeSetupUrl: z.string(),
    loginURL: z.string()
  }),
  [TriggerEvent.TWO_FA]: z.object({
    firstname: z.string(),
    code: z.string()
  }),
  [TriggerEvent.ALL_USER_NOTIFICATION]: z.object({
    subject: z.string(),
    body: z.string()
  }),
  [TriggerEvent.CHANGE_EMAIL_ADDRESS]: z.object({
    firstname: z.string(),
    code: z.string()
  }),
  [TriggerEvent.CHANGE_PHONE_NUMBER]: z.object({
    firstname: z.string(),
    code: z.string()
  })
} as const

export type TriggerVariable = {
  [T in TriggerEvent]: z.infer<(typeof TriggerVariable)[T]>
}

const ChangePhoneNumberVariables = BaseVariables.extend({
  firstNames: z.string(),
  authCode: z.string()
})
type ChangePhoneNumberVariables = z.infer<typeof ChangePhoneNumberVariables>

const ChangeEmailAddressVariables = BaseVariables.extend({
  firstNames: z.string(),
  authCode: z.string()
})
type ChangeEmailAddressVariables = z.infer<typeof ChangeEmailAddressVariables>

const ApproveCorrectionVariables = BaseVariables.extend({
  firstNames: z.string(),
  lastName: z.string(),
  event: z.string(),
  trackingId: z.string()
})
type ApproveCorrectionVariables = z.infer<typeof ApproveCorrectionVariables>

const RejectCorrectionVariables = ApproveCorrectionVariables.extend({
  reason: z.string()
})
type RejectCorrectionVariables = z.infer<typeof RejectCorrectionVariables>

const DeclarationCommonVariables = z.object({
  trackingId: z.string(),
  crvsOffice: z.string(),
  registrationLocation: z.string(),
  applicationName: z.string(),
  informantName: z.string()
})

export const InformantNotificationVariables = {
  [InformantTemplateType.birthInProgressNotification]:
    DeclarationCommonVariables,
  [InformantTemplateType.birthDeclarationNotification]:
    DeclarationCommonVariables.extend({
      name: z.string()
    }),
  [InformantTemplateType.birthRegistrationNotification]:
    DeclarationCommonVariables.extend({
      name: z.string(),
      registrationNumber: z.string()
    }),
  [InformantTemplateType.birthRejectionNotification]:
    DeclarationCommonVariables.extend({
      name: z.string()
    }),
  [InformantTemplateType.deathInProgressNotification]:
    DeclarationCommonVariables,
  [InformantTemplateType.deathDeclarationNotification]:
    DeclarationCommonVariables,
  [InformantTemplateType.deathRegistrationNotification]:
    DeclarationCommonVariables.extend({
      name: z.string(),
      registrationNumber: z.string()
    }),
  [InformantTemplateType.deathRejectionNotification]:
    DeclarationCommonVariables.extend({
      name: z.string()
    })
} as const

export type InformantNotificationVariables = {
  [K in InformantTemplateType]: z.infer<
    (typeof InformantNotificationVariables)[K]
  >
}

const templates = {
  [TriggerEvent.USER_CREATED]: {
    type: 'onboarding-invite',
    subject: 'Welcome to OpenCRVS!',
    template:
      readOtherTemplate<TriggerVariable['user-created']>('onboarding-invite')
  },
  [TriggerEvent.TWO_FA]: {
    type: '2-factor-authentication',
    subject: 'Two factor authentication',
    template: readOtherTemplate<TriggerVariable['2fa']>(
      '2-factor-authentication'
    )
  },
  'change-phone-number': {
    type: 'change-phone-number',
    subject: 'Phone number change request',
    template: readOtherTemplate<ChangePhoneNumberVariables>(
      'change-phone-number'
    )
  },
  'change-email-address': {
    type: 'change-email-address',
    subject: 'Email address change request',
    template: readOtherTemplate<ChangeEmailAddressVariables>(
      'change-email-address'
    )
  },
  [TriggerEvent.RESET_PASSWORD_BY_ADMIN]: {
    type: 'password-reset-by-system-admin',
    subject: 'Account password reset invitation',
    template: readOtherTemplate<TriggerVariable['reset-password-by-admin']>(
      'password-reset-by-system-admin'
    )
  },
  [TriggerEvent.RESEND_INVITE]: {
    type: 'resend-invite',
    subject: 'Your OpenCRVS account invitation',
    template:
      readOtherTemplate<TriggerVariable['resend-invite']>('resend-invite')
  },
  [TriggerEvent.RESET_PASSWORD]: {
    type: 'password-reset',
    subject: 'Account password reset request',
    template:
      readOtherTemplate<TriggerVariable['reset-password']>('password-reset')
  },
  [TriggerEvent.USERNAME_REMINDER]: {
    type: 'username-reminder',
    subject: 'Account username reminder',
    template:
      readOtherTemplate<TriggerVariable['username-reminder']>(
        'username-reminder'
      )
  },
  [TriggerEvent.USER_UPDATED]: {
    type: 'username-updated',
    subject: 'Account username updated',
    template:
      readOtherTemplate<TriggerVariable['user-updated']>('username-updated')
  },
  'correction-approved': {
    type: 'correction-approved',
    subject: 'Correction request approved',
    template: readOtherTemplate<ApproveCorrectionVariables>(
      'correction-approved'
    )
  },
  'correction-rejected': {
    type: 'correction-rejected',
    subject: 'Correction request rejected',
    template: readOtherTemplate<RejectCorrectionVariables>(
      'correction-rejected'
    )
  },
  birthInProgressNotification: {
    type: 'birthInProgressNotification',
    subject: 'Birth declaration in progress',
    template:
      readBirthTemplate<
        InformantNotificationVariables['birthInProgressNotification']
      >('inProgress')
  },
  birthDeclarationNotification: {
    type: 'birthDeclarationNotification',
    subject: 'Birth declaration in review',
    template:
      readBirthTemplate<
        InformantNotificationVariables['birthDeclarationNotification']
      >('inReview')
  },
  birthRegistrationNotification: {
    type: 'birthRegistrationNotification',
    subject: 'Birth declaration registered',
    template:
      readBirthTemplate<
        InformantNotificationVariables['birthRegistrationNotification']
      >('registration')
  },
  birthRejectionNotification: {
    type: 'birthRejectionNotification',
    subject: 'Birth declaration required update',
    template:
      readBirthTemplate<
        InformantNotificationVariables['birthRejectionNotification']
      >('rejection')
  },
  deathInProgressNotification: {
    type: 'deathInProgressNotification',
    subject: 'Death declaration in progress',
    template:
      readDeathTemplate<
        InformantNotificationVariables['deathInProgressNotification']
      >('inProgress')
  },
  deathDeclarationNotification: {
    type: 'deathDeclarationNotification',
    subject: 'Death declaration in review',
    template:
      readDeathTemplate<
        InformantNotificationVariables['deathDeclarationNotification']
      >('inReview')
  },
  deathRegistrationNotification: {
    type: 'deathRegistrationNotification',
    subject: 'Death declaration registered',
    template:
      readDeathTemplate<
        InformantNotificationVariables['deathRegistrationNotification']
      >('registration')
  },
  deathRejectionNotification: {
    type: 'deathRejectionNotification',
    subject: 'Death declaration required update',
    template:
      readDeathTemplate<
        InformantNotificationVariables['deathRejectionNotification']
      >('rejection')
  },
  [TriggerEvent.ALL_USER_NOTIFICATION]: {
    type: 'allUserNotification',
    subject: '', // Subject defined from National Sys Admin Dashboard
    template: readOtherTemplate<TriggerVariable['all-user-notification']>(
      'all-user-notification'
    )
  }
} as const

export type EmailTemplateType =
  | TriggerEvent
  | InformantTemplateType
  | 'change-phone-number'
  | 'change-email-address'
  | 'correction-approved'
  | 'correction-rejected'

export function getTemplate<T extends EmailTemplateType>(type: T) {
  return templates[type]
}

export function renderTemplate<T extends (typeof templates)[EmailTemplateType]>(
  template: T,
  variables: unknown
) {
  return template.template(variables as any)
}
