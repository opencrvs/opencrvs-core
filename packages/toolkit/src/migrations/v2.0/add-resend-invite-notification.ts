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

/**
 * Codemod: Add `TriggerEvent.RESEND_INVITE` wiring to the country config
 * (email schemas, templates, `/triggers/user/resend-invite` route,
 * SMS keys, CSV copy, HTML template).
 *
 * Idempotent: safe to run multiple times; skips edits when markers are
 * already present.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

const EMAIL_TEMPLATES_INDEX = 'src/api/notification/email-templates/index.ts'
const NOTIFICATION_HANDLER = 'src/api/notification/handler.ts'
const USER_NOTIFICATION_ROUTES = 'src/config/routes/userNotificationRoutes.ts'
const SMS_SERVICE = 'src/api/notification/sms-service.ts'
const NOTIFICATION_CSV = 'src/translations/notification.csv'
const RESEND_INVITE_HTML =
  'src/api/notification/email-templates/other/resend-invite.html'

const TRIGGER_VARIABLE_ANCHOR_BEFORE = `  [TriggerEvent.CHANGE_PHONE_NUMBER]: z.object({
    firstname: z.string(),
    code: z.string()
  })
} as const`

const TRIGGER_VARIABLE_ANCHOR_AFTER = `  [TriggerEvent.CHANGE_PHONE_NUMBER]: z.object({
    firstname: z.string(),
    code: z.string()
  }),
  [TriggerEvent.RESEND_INVITE]: z.object({
    firstname: z.string(),
    username: z.string(),
    temporaryPassword: z.string(),
    completeSetupUrl: z.string(),
    loginURL: z.string()
  })
} as const`

const TEMPLATES_ANCHOR_BEFORE = `  [TriggerEvent.USER_CREATED]: {
    type: 'onboarding-invite',
    subject: 'Welcome to OpenCRVS!',
    template:
      readOtherTemplate<TriggerVariable['user-created']>('onboarding-invite')
  },
  [TriggerEvent.TWO_FA]: {`

const TEMPLATES_ANCHOR_AFTER = `  [TriggerEvent.USER_CREATED]: {
    type: 'onboarding-invite',
    subject: 'Welcome to OpenCRVS!',
    template:
      readOtherTemplate<TriggerVariable['user-created']>('onboarding-invite')
  },
  [TriggerEvent.RESEND_INVITE]: {
    type: 'resend-invite',
    subject: 'Your OpenCRVS account invitation',
    template:
      readOtherTemplate<TriggerVariable['resend-invite']>('resend-invite')
  },
  [TriggerEvent.TWO_FA]: {`

const HANDLER_ANCHOR_BEFORE = `    case TriggerEvent.USER_CREATED:
      return {
        firstname,
        username: payload.username,
        temporaryPassword: payload.temporaryPassword,
        completeSetupUrl: LOGIN_URL,
        loginURL: LOGIN_URL
      }

    case TriggerEvent.USER_UPDATED:`

const HANDLER_ANCHOR_AFTER = `    case TriggerEvent.USER_CREATED:
      return {
        firstname,
        username: payload.username,
        temporaryPassword: payload.temporaryPassword,
        completeSetupUrl: LOGIN_URL,
        loginURL: LOGIN_URL
      }

    case TriggerEvent.RESEND_INVITE:
      return {
        firstname,
        username: payload.username,
        temporaryPassword: payload.temporaryPassword,
        completeSetupUrl: LOGIN_URL,
        loginURL: LOGIN_URL
      }

    case TriggerEvent.USER_UPDATED:`

const ROUTES_ANCHOR_BEFORE = `    {
      method: 'POST',
      path: '/triggers/user/user-created',
      handler: makeNotificationHandler('user-created'),
      options: {
        auth: false,
        tags: ['api'],
        description: 'Handles notification for user creation'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/user-updated',`

const ROUTES_ANCHOR_AFTER = `    {
      method: 'POST',
      path: '/triggers/user/user-created',
      handler: makeNotificationHandler('user-created'),
      options: {
        auth: false,
        tags: ['api'],
        description: 'Handles notification for user creation'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/resend-invite',
      handler: makeNotificationHandler('resend-invite'),
      options: {
        auth: false,
        tags: ['api'],
        description: 'Handles notification for resent user invite'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/user-updated',`

const SMS_OTHER_BEFORE = `  userCredentialsNotification: 'userCredentialsNotification',
  retieveUserNameNotification:`

const SMS_OTHER_AFTER = `  userCredentialsNotification: 'userCredentialsNotification',
  resendInviteNotification: 'resendInviteNotification',
  retieveUserNameNotification:`

const SMS_TRIGGER_BEFORE = `  ['user-created']: 'userCredentialsNotification',
  ['user-updated']: 'updateUserNameNotification',`

const SMS_TRIGGER_AFTER = `  ['user-created']: 'userCredentialsNotification',
  ['resend-invite']: 'resendInviteNotification',
  ['user-updated']: 'updateUserNameNotification',`

const RESEND_INVITE_HTML_CONTENT = `<!doctype html>
<html>
  <head>
    <link
      href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <style type="text/css">
      body {
        font-family: 'Noto Sans', sans-serif;
        color: #222;
        padding: 16px 24px;
      }

      h1 {
        font-size: 21px;
        margin-top: 32px;
        margin-bottom: 36px;
        font-weight: 700;
      }

      p {
        font-weight: 400;
        font-size: 16px;
        line-height: 1.8;
        margin-bottom: 24px;
      }

      i {
        color: #666;
        font-weight: 400;
        font-size: 16px;
      }
    </style>
  </head>

  <body>
    <img
      src="{{countryLogo}}"
      alt="country_logo"
      style="max-height: 88px; max-width: 100%"
    />
    <h1>Your {{applicationName}} account invitation</h1>
    <p>Hello {{firstname}},</p>
    <p>Your account invitation has been resent. Please use the following credentials to access your account:</p>
    <p>
      Username: <strong>{{username}}</strong><br />
      Password: <strong>{{temporaryPassword}}</strong>
    </p>
    <p>
      Please click the link below to complete your account setup and start using
      {{applicationName}}.
    </p>

    <div style="margin-top: 32px; margin-bottom: 32px">
      <a href="{{loginURL}}">Complete setup</a>
    </div>
    <br />
    <p>
      Best regards, <br />
      {{applicationName}} Team
    </p>
  </body>
</html>
`

const CSV_ROW =
  "resendInviteNotification,The SMS message that is sent when a user invitation is resent,Your OpenCRVS account invitation was resent. Please login with your username: {{username}} and temporary password: {{temporaryPassword}},Votre invitation de compte OpenCRVS a été renvoyée. Veuillez vous connecter avec votre nom d'utilisateur : {{username}} et votre mot de passe temporaire : {{temporaryPassword}}.\n"

function replaceExactlyOnceOrSkip(
  fileLabel: string,
  contents: string,
  before: string,
  after: string,
  anchorName: string
): { contents: string; changed: boolean } {
  const n = contents.split(before).length - 1
  if (n === 0) {
    // eslint-disable-next-line no-console
    console.log(
      `  [${fileLabel}] ${anchorName}: anchor not found — skipping (unexpected file shape).`
    )
    return { contents, changed: false }
  }
  if (n > 1) {
    // eslint-disable-next-line no-console
    console.warn(
      `  [${fileLabel}] ${anchorName}: ambiguous anchor (${n} matches) — skipping.`
    )
    return { contents, changed: false }
  }
  const next = contents.replace(before, after)
  return { contents: next, changed: true }
}

function patchEmailTemplatesIndex(): boolean {
  const full = path.join(process.cwd(), EMAIL_TEMPLATES_INDEX)
  if (!existsSync(full)) {
    // eslint-disable-next-line no-console
    console.log(`  '${EMAIL_TEMPLATES_INDEX}' missing — skipping.`)
    return false
  }
  let text = readFileSync(full, 'utf8')

  let changed = false

  if (!text.includes('[TriggerEvent.RESEND_INVITE]: z.object')) {
    const r = replaceExactlyOnceOrSkip(
      EMAIL_TEMPLATES_INDEX,
      text,
      TRIGGER_VARIABLE_ANCHOR_BEFORE,
      TRIGGER_VARIABLE_ANCHOR_AFTER,
      'TriggerVariable'
    )
    text = r.contents
    if (r.changed) changed = true
  }

  if (!text.includes("readOtherTemplate<TriggerVariable['resend-invite']>")) {
    const r = replaceExactlyOnceOrSkip(
      EMAIL_TEMPLATES_INDEX,
      text,
      TEMPLATES_ANCHOR_BEFORE,
      TEMPLATES_ANCHOR_AFTER,
      '`templates`'
    )
    text = r.contents
    if (r.changed) changed = true
  }

  if (changed) {
    writeFileSync(full, text)
  }
  return changed
}

async function main(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('Adding RESEND_INVITE notification wiring…')

  const touched: string[] = []

  if (patchEmailTemplatesIndex()) touched.push(EMAIL_TEMPLATES_INDEX)

  /* handler */
  const handlerPath = path.join(process.cwd(), NOTIFICATION_HANDLER)
  if (existsSync(handlerPath)) {
    let t = readFileSync(handlerPath, 'utf8')
    if (
      !t.includes('TriggerEvent.RESEND_INVITE') &&
      t.includes(HANDLER_ANCHOR_BEFORE)
    ) {
      const count = t.split(HANDLER_ANCHOR_BEFORE).length - 1
      if (count === 1) {
        t = t.replace(HANDLER_ANCHOR_BEFORE, HANDLER_ANCHOR_AFTER)
        writeFileSync(handlerPath, t)
        touched.push(NOTIFICATION_HANDLER)
      }
    }
  }

  /* routes */
  const routesPath = path.join(process.cwd(), USER_NOTIFICATION_ROUTES)
  if (existsSync(routesPath)) {
    let t = readFileSync(routesPath, 'utf8')
    if (!t.includes(`/triggers/user/resend-invite`) && t.includes(ROUTES_ANCHOR_BEFORE)) {
      const count = t.split(ROUTES_ANCHOR_BEFORE).length - 1
      if (count === 1) {
        t = t.replace(ROUTES_ANCHOR_BEFORE, ROUTES_ANCHOR_AFTER)
        writeFileSync(routesPath, t)
        touched.push(USER_NOTIFICATION_ROUTES)
      }
    }
  }

  /* sms-service */
  const smsPath = path.join(process.cwd(), SMS_SERVICE)
  if (existsSync(smsPath)) {
    let t = readFileSync(smsPath, 'utf8')
    let smsChanged = false
    if (!t.includes(`resendInviteNotification`)) {
      const n = t.split(SMS_OTHER_BEFORE).length - 1
      if (n === 1) {
        t = t.replace(SMS_OTHER_BEFORE, SMS_OTHER_AFTER)
        smsChanged = true
      }
    }
    if (!t.includes(`['resend-invite']`)) {
      const n = t.split(SMS_TRIGGER_BEFORE).length - 1
      if (n === 1) {
        t = t.replace(SMS_TRIGGER_BEFORE, SMS_TRIGGER_AFTER)
        smsChanged = true
      }
    }
    if (smsChanged) {
      writeFileSync(smsPath, t)
      touched.push(SMS_SERVICE)
    }
  }

  /* csv */
  const csvPath = path.join(process.cwd(), NOTIFICATION_CSV)
  if (existsSync(csvPath)) {
    let t = readFileSync(csvPath, 'utf8')
    if (!/^resendInviteNotification,/m.test(t)) {
      if (!t.endsWith('\n')) t += '\n'
      writeFileSync(csvPath, t + CSV_ROW)
      touched.push(NOTIFICATION_CSV)
    }
  }

  /* html */
  const htmlPath = path.join(process.cwd(), RESEND_INVITE_HTML)
  mkdirSync(path.dirname(htmlPath), { recursive: true })
  if (!existsSync(htmlPath)) {
    writeFileSync(htmlPath, RESEND_INVITE_HTML_CONTENT)
    touched.push(RESEND_INVITE_HTML)
  }

  if (touched.length === 0) {
    // eslint-disable-next-line no-console
    console.log('  Nothing to update (already present or anchors not found).')
    return
  }

  // eslint-disable-next-line no-console
  console.log(`  Updated:\n${touched.map((f) => `    - ${f}`).join('\n')}`)
}

export { main }
