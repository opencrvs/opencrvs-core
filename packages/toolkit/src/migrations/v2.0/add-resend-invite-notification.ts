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
import {
  ArrayLiteralExpression,
  AsExpression,
  Node,
  ObjectLiteralExpression,
  Project,
  SyntaxKind,
  SwitchStatement,
  VariableDeclaration
} from 'ts-morph'

const EMAIL_TEMPLATES_INDEX = 'src/api/notification/email-templates/index.ts'
const NOTIFICATION_HANDLER = 'src/api/notification/handler.ts'
const USER_NOTIFICATION_ROUTES = 'src/config/routes/userNotificationRoutes.ts'
const SMS_SERVICE = 'src/api/notification/sms-service.ts'
const NOTIFICATION_CSV = 'src/translations/notification.csv'
const RESEND_INVITE_HTML =
  'src/api/notification/email-templates/other/resend-invite.html'

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

function getObjectLiteralFromConst(
  declaration: VariableDeclaration | undefined
): ObjectLiteralExpression | undefined {
  if (!declaration) {
    return
  }
  const initializer = declaration.getInitializer()
  if (!initializer) {
    return
  }
  if (Node.isObjectLiteralExpression(initializer)) {
    return initializer
  }
  if (Node.isAsExpression(initializer)) {
    const expression = (initializer as AsExpression).getExpression()
    if (Node.isObjectLiteralExpression(expression)) {
      return expression
    }
  }
}

function patchEmailTemplatesIndex(): boolean {
  const full = path.join(process.cwd(), EMAIL_TEMPLATES_INDEX)
  if (!existsSync(full)) {
    // eslint-disable-next-line no-console
    console.log(`  '${EMAIL_TEMPLATES_INDEX}' missing — skipping.`)
    return false
  }

  const project = new Project({
    skipAddingFilesFromTsConfig: true
  })
  const sourceFile = project.addSourceFileAtPath(full)

  let changed = false

  const triggerVariableObject = getObjectLiteralFromConst(
    sourceFile.getVariableDeclaration('TriggerVariable')
  )
  if (triggerVariableObject) {
    const hasResendInviteVariable = triggerVariableObject
      .getProperties()
      .some((prop) => prop.getText().includes('[TriggerEvent.RESEND_INVITE]'))
    if (!hasResendInviteVariable) {
      triggerVariableObject.addPropertyAssignment({
        name: '[TriggerEvent.RESEND_INVITE]',
        initializer: `z.object({
    firstname: z.string(),
    username: z.string(),
    temporaryPassword: z.string(),
    completeSetupUrl: z.string(),
    loginURL: z.string()
  })`
      })
      changed = true
    }
  }

  const templatesObject = getObjectLiteralFromConst(
    sourceFile.getVariableDeclaration('templates')
  )
  if (templatesObject) {
    const hasResendInviteTemplate = templatesObject
      .getProperties()
      .some((prop) =>
        prop
          .getText()
          .includes("readOtherTemplate<TriggerVariable['resend-invite']>")
      )
    if (!hasResendInviteTemplate) {
      const userCreatedIndex = templatesObject
        .getProperties()
        .findIndex((prop) => prop.getText().includes('[TriggerEvent.USER_CREATED]'))
      templatesObject.insertPropertyAssignment(
        userCreatedIndex >= 0 ? userCreatedIndex + 1 : templatesObject.getProperties().length,
        {
          name: '[TriggerEvent.RESEND_INVITE]',
          initializer: `{
    type: 'resend-invite',
    subject: 'Your OpenCRVS account invitation',
    template:
      readOtherTemplate<TriggerVariable['resend-invite']>('resend-invite')
  }`
        }
      )
      changed = true
    }
  }

  if (changed) {
    sourceFile.saveSync()
  }

  return changed
}

function patchNotificationHandler(): boolean {
  const full = path.join(process.cwd(), NOTIFICATION_HANDLER)
  if (!existsSync(full)) {
    return false
  }

  const project = new Project({ skipAddingFilesFromTsConfig: true })
  const sourceFile = project.addSourceFileAtPath(full)
  const convertFn = sourceFile.getFunction('convertPayloadToVariable')
  if (!convertFn) {
    return false
  }

  const switchStmt = convertFn.getFirstDescendantByKind(
    SyntaxKind.SwitchStatement
  ) as SwitchStatement | undefined
  if (!switchStmt) {
    return false
  }

  const clauses = switchStmt.getCaseBlock().getClauses()
  const hasResendInvite = clauses.some(
    (clause) =>
      Node.isCaseClause(clause) &&
      clause.getExpression().getText() === 'TriggerEvent.RESEND_INVITE'
  )
  if (hasResendInvite) {
    return false
  }

  const userCreatedClauseIndex = clauses.findIndex(
    (clause) =>
      Node.isCaseClause(clause) &&
      clause.getExpression().getText() === 'TriggerEvent.USER_CREATED'
  )
  if (userCreatedClauseIndex < 0) {
    return false
  }

  const userCreatedClause = clauses[userCreatedClauseIndex]
  sourceFile.insertText(
    userCreatedClause.getEnd(),
    `

    case TriggerEvent.RESEND_INVITE:
      return {
        firstname,
        username: payload.username,
        temporaryPassword: payload.temporaryPassword,
        completeSetupUrl: LOGIN_URL,
        loginURL: LOGIN_URL
      }`
  )

  sourceFile.saveSync()
  return true
}

function getReturnedArrayLiteral(functionFilePath: string, fnName: string) {
  const project = new Project({ skipAddingFilesFromTsConfig: true })
  const sourceFile = project.addSourceFileAtPath(functionFilePath)
  const fn = sourceFile.getFunction(fnName)
  const returnStmt = fn?.getFirstDescendantByKind(SyntaxKind.ReturnStatement)
  const expr = returnStmt?.getExpression()
  if (!expr || !Node.isArrayLiteralExpression(expr)) {
    return { sourceFile, arrayLiteral: undefined as ArrayLiteralExpression | undefined }
  }
  return { sourceFile, arrayLiteral: expr }
}

function patchUserNotificationRoutes(): boolean {
  const full = path.join(process.cwd(), USER_NOTIFICATION_ROUTES)
  if (!existsSync(full)) {
    return false
  }

  const { sourceFile, arrayLiteral } = getReturnedArrayLiteral(
    full,
    'getUserNotificationRoutes'
  )
  if (!arrayLiteral) {
    return false
  }

  const routeExists = arrayLiteral
    .getElements()
    .some((element) => element.getText().includes(`path: '/triggers/user/resend-invite'`))
  if (routeExists) {
    return false
  }

  const userCreatedIndex = arrayLiteral
    .getElements()
    .findIndex((element) => element.getText().includes(`path: '/triggers/user/user-created'`))

  arrayLiteral.insertElement(
    userCreatedIndex >= 0 ? userCreatedIndex + 1 : arrayLiteral.getElements().length,
    `{
      method: 'POST',
      path: '/triggers/user/resend-invite',
      handler: makeNotificationHandler('resend-invite'),
      options: {
        auth: false,
        tags: ['api'],
        description: 'Handles notification for resent user invite'
      }
    }`
  )

  sourceFile.saveSync()
  return true
}

function patchSmsService(): boolean {
  const full = path.join(process.cwd(), SMS_SERVICE)
  if (!existsSync(full)) {
    return false
  }

  const project = new Project({ skipAddingFilesFromTsConfig: true })
  const sourceFile = project.addSourceFileAtPath(full)
  let changed = false

  const otherTemplatesObject = getObjectLiteralFromConst(
    sourceFile.getVariableDeclaration('otherTemplates')
  )
  if (otherTemplatesObject) {
    const hasResendTemplate = otherTemplatesObject
      .getProperties()
      .some((prop) => prop.getText().includes('resendInviteNotification'))
    if (!hasResendTemplate) {
      const userCredentialsIndex = otherTemplatesObject
        .getProperties()
        .findIndex((prop) => prop.getText().includes('userCredentialsNotification'))
      otherTemplatesObject.insertPropertyAssignment(
        userCredentialsIndex >= 0
          ? userCredentialsIndex + 1
          : otherTemplatesObject.getProperties().length,
        {
          name: 'resendInviteNotification',
          initializer: `'resendInviteNotification'`
        }
      )
      changed = true
    }
  }

  const triggerToSmsTemplateObject = getObjectLiteralFromConst(
    sourceFile.getVariableDeclaration('TriggerToSMSTemplate')
  )
  if (triggerToSmsTemplateObject) {
    const hasResendInviteMap = triggerToSmsTemplateObject
      .getProperties()
      .some((prop) => prop.getText().includes(`['resend-invite']`))
    if (!hasResendInviteMap) {
      const userCreatedIndex = triggerToSmsTemplateObject
        .getProperties()
        .findIndex((prop) => prop.getText().includes(`['user-created']`))
      triggerToSmsTemplateObject.insertPropertyAssignment(
        userCreatedIndex >= 0
          ? userCreatedIndex + 1
          : triggerToSmsTemplateObject.getProperties().length,
        {
          name: `['resend-invite']`,
          initializer: `'resendInviteNotification'`
        }
      )
      changed = true
    }
  }

  if (changed) {
    sourceFile.saveSync()
  }

  return changed
}

async function main(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('Adding RESEND_INVITE notification wiring…')

  const touched: string[] = []

  if (patchEmailTemplatesIndex()) touched.push(EMAIL_TEMPLATES_INDEX)

  if (patchNotificationHandler()) touched.push(NOTIFICATION_HANDLER)
  if (patchUserNotificationRoutes()) touched.push(USER_NOTIFICATION_ROUTES)
  if (patchSmsService()) touched.push(SMS_SERVICE)

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
