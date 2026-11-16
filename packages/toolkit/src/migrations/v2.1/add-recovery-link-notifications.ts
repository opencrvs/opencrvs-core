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
 * Codemod: Register the two v2.1 account-recovery notifications,
 * `password-reset-link` and `username-reminder-link`.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.1/add-recovery-link-notifications.ts
 *
 * Why:
 *   v2.1 replaces the 6-digit code exchanged over `/api/auth/verifyUser` with
 *   an emailed single-use recovery link, so that endpoint no longer reveals
 *   whether an account exists. Core now dispatches two new `TriggerEvent`s to
 *   the country config. Because they are members of `TriggerEvent`, every
 *   `Record<TriggerEvent, ...>` / `[T in TriggerEvent]` map in a v2.0 country
 *   config stops compiling until it handles them, and until the routes exist
 *   the recovery email is never sent (core logs the 404 and moves on).
 *
 * What it does, skipping anything already present:
 *   - `src/api/notification/email-templates/index.ts`: adds the two variable
 *     schemas to `TriggerVariable` and the two entries to `templates`
 *   - `src/api/notification/sms-service.ts`: adds the two SMS template names
 *     to `otherTemplates` and the two mappings to `TriggerToSMSTemplate`
 *   - `src/api/notification/handler.ts`: adds the two cases to the
 *     `convertPayloadToVariable` switch, building the recovery URL from the
 *     token in the payload
 *   - `src/config/routes/userNotificationRoutes.ts`: adds the two
 *     `POST /trigger/user/*` routes core posts to
 *   - `src/api/notification/email-templates/other/*.html`: writes the two
 *     email bodies
 *   - `src/translations/notification.csv`: adds the two SMS messages
 *   - `src/translations/login.csv`: adds the login messages for the screens
 *     that wait on the emailed link
 *
 * Caveats:
 *   - Country configs that renamed or restructured these files keep their own
 *     structure; each step warns and is skipped rather than guessing. The
 *     warning lists what still has to be wired by hand.
 */

import {
  IndentationText,
  Node,
  ObjectLiteralExpression,
  Project,
  SourceFile,
  SyntaxKind,
  VariableDeclaration
} from 'ts-morph'
import { existsSync, writeFileSync } from 'fs'
import path from 'path'
import { addRows, readCsvFile, writeCsvFile } from '../../csv'

const EMAIL_TEMPLATES_FILE = 'src/api/notification/email-templates/index.ts'
const SMS_SERVICE_FILE = 'src/api/notification/sms-service.ts'
const HANDLER_FILE = 'src/api/notification/handler.ts'
const ROUTES_FILE = 'src/config/routes/userNotificationRoutes.ts'
const EMAIL_TEMPLATE_DIR = 'src/api/notification/email-templates/other'
const NOTIFICATION_CSV = 'src/translations/notification.csv'
const LOGIN_CSV = 'src/translations/login.csv'

const TRIGGER_VARIABLE_OBJECT = 'TriggerVariable'
const TEMPLATES_OBJECT = 'templates'
const OTHER_TEMPLATES_OBJECT = 'otherTemplates'
const TRIGGER_TO_SMS_TEMPLATE_OBJECT = 'TriggerToSMSTemplate'
const CONVERT_PAYLOAD_FUNCTION = 'convertPayloadToVariable'
const ROUTES_FUNCTION = 'getUserNotificationRoutes'

type RecoveryEvent = {
  /** The `TriggerEvent` value, and the path core posts to. */
  id: string
  /** The `TriggerEvent` member name, for `[TriggerEvent.X]` style keys. */
  constant: string
  smsTemplate: string
  emailSubject: string
  routeDescription: string
  heading: string
  /** Sentence explaining why the mail arrived. */
  reason: string
  linkLabel: string
}

const RECOVERY_EVENTS: RecoveryEvent[] = [
  {
    id: 'password-reset-link',
    constant: 'PASSWORD_RESET_LINK',
    smsTemplate: 'resetPasswordLinkNotification',
    emailSubject: 'Reset your password',
    routeDescription: 'Handles notification for password reset recovery link',
    heading: 'Reset your password',
    reason:
      'Someone asked to reset the password for your {{applicationName}}\n      account.',
    linkLabel: 'Reset your password'
  },
  {
    id: 'username-reminder-link',
    constant: 'USERNAME_REMINDER_LINK',
    smsTemplate: 'retrieveUsernameLinkNotification',
    emailSubject: 'Retrieve your username',
    routeDescription:
      'Handles notification for username reminder recovery link',
    heading: 'Retrieve your username',
    reason:
      'Someone asked for a reminder of the username for your\n      {{applicationName}} account.',
    linkLabel: 'Retrieve your username'
  }
]

const NOTIFICATION_CSV_ROWS = [
  `resetPasswordLinkNotification,The SMS message that is sent to a user containing a self-service password reset link,{{applicationName}}: reset your password using this link. It expires in 1 hour. {{{recoveryURL}}},{{applicationName}} : réinitialisez votre mot de passe à l'aide de ce lien. Il expire dans 1 heure. {{{recoveryURL}}}`,
  `retrieveUsernameLinkNotification,The SMS message that is sent to a user containing a self-service username retrieval link,{{applicationName}}: retrieve your username using this link. It expires in 1 hour. {{{recoveryURL}}},{{applicationName}} : récupérez votre nom d'utilisateur à l'aide de ce lien. Il expire dans 1 heure. {{{recoveryURL}}}`
]

const LOGIN_CSV_ROWS = [
  `buttons.backToLogin,"Label used to leave a screen that is waiting on an emailed link, where logging in is not yet possible",Back to login,Retour à la connexion`,
  `resetCredentials.recoveryInstructionsSent.body,"Body message for the recovery instructions sent page. Must not assert delivery, since the account may not exist.","If we found an account, you'll receive instructions for {forgottenItem, select, username {retrieving your username} other {resetting your password}}. The link expires in 1 hour.","Si nous trouvons un compte correspondant, vous recevrez les instructions pour {forgottenItem, select, username {récupérer votre nom d'utilisateur} other {réinitialiser votre mot de passe}}. Le lien expire dans 1 heure."`,
  `resetCredentials.recoveryInstructionsSent.title.email,Title for the recovery instructions sent page when notifications are delivered by email,Check your email,Vérifiez votre e-mail`,
  `resetCredentials.recoveryInstructionsSent.title.phone,Title for the recovery instructions sent page when notifications are delivered by SMS,Check your phone,Vérifiez votre téléphone`,
  `resetCredentials.recoveryLinkLanding.expired.body,"Body shown when a recovery link is invalid, expired, or already used. Must not reveal whether the underlying account exists.",This link is no longer valid. Request a new one to continue.,Ce lien n'est plus valide. Veuillez en demander un nouveau pour continuer.`,
  `resetCredentials.recoveryLinkLanding.expired.link,Link back to the forgotten item form shown on an expired/invalid recovery link,Start again,Recommencer`,
  `resetCredentials.recoveryLinkLanding.expired.title,"Title shown when a recovery link is invalid, expired, or already used",This link has expired,Ce lien a expiré`
]

const skipped: string[] = []

function warnSkipped(message: string) {
  skipped.push(message)
  console.warn(`  ⚠️  ${message}`)
}

// ─── ts-morph helpers ────────────────────────────────────────────────────────

/**
 * Returns the object literal a `const x = { ... }` declares, unwrapping any
 * `as const` / `satisfies Record<...>` the map is annotated with.
 */
function findObjectLiteral(
  declaration: VariableDeclaration | undefined
): ObjectLiteralExpression | undefined {
  let expression = declaration?.getInitializer()

  while (
    expression &&
    (Node.isAsExpression(expression) || Node.isSatisfiesExpression(expression))
  ) {
    expression = expression.getExpression()
  }

  return expression && Node.isObjectLiteralExpression(expression)
    ? expression
    : undefined
}

/**
 * Property keys for these maps are written in three interchangeable styles:
 * `[TriggerEvent.PASSWORD_RESET_LINK]`, `['password-reset-link']` and
 * `password-reset-link`. All three mean the same key, so all three count as
 * already present.
 */
function hasKeyFor(
  obj: ObjectLiteralExpression,
  key: string,
  constant: string
) {
  const accepted = new Set([
    `[TriggerEvent.${constant}]`,
    `['${key}']`,
    `["${key}"]`,
    `'${key}'`,
    `"${key}"`,
    key
  ])

  return obj
    .getProperties()
    .some(
      (property) =>
        Node.isPropertyAssignment(property) &&
        accepted.has(property.getName().trim())
    )
}

/**
 * Mirrors the key style the object already uses, so the inserted entry does
 * not look foreign next to its neighbours.
 */
function renderKey(
  obj: ObjectLiteralExpression,
  key: string,
  constant: string
) {
  const names = obj
    .getProperties()
    .filter(Node.isPropertyAssignment)
    .map((property) => property.getName().trim())

  if (names.some((name) => name.startsWith('[TriggerEvent.'))) {
    return `[TriggerEvent.${constant}]`
  }
  if (names.some((name) => name.startsWith('['))) {
    return `['${key}']`
  }
  return `'${key}'`
}

/**
 * Appends `key: <value>` after the last entry of the object literal declared
 * as `objectName`, given the value as lines indented relative to the key.
 *
 * Text insertion rather than `addPropertyAssignment`: ts-morph re-indents the
 * code it writes one level deeper than a property of an already-nested map,
 * which turns a two-line addition into a whole-file reformat once prettier
 * runs over it. Returns false when the object cannot be found or is empty.
 *
 * Insertion invalidates every node previously read from this file, so callers
 * must re-resolve what they need afterwards.
 */
function appendEntry(
  sourceFile: SourceFile,
  objectName: string,
  key: string,
  valueLines: string[]
) {
  const obj = findObjectLiteral(sourceFile.getVariableDeclaration(objectName))
  const properties = obj?.getProperties() ?? []
  const lastProperty = properties[properties.length - 1]

  if (!lastProperty) return false

  const indent = lastProperty.getIndentationText()
  const entry = valueLines
    .map((line, index) => `${indent}${index === 0 ? `${key}: ${line}` : line}`)
    .join('\n')

  sourceFile.insertText(lastProperty.getEnd(), `,\n${entry}`)
  return true
}

/**
 * Returns whether the named object literal already holds a key for `event`,
 * under any of the styles `hasKeyFor` accepts.
 */
function objectHasKeyFor(
  sourceFile: SourceFile,
  objectName: string,
  key: string,
  constant: string
) {
  const obj = findObjectLiteral(sourceFile.getVariableDeclaration(objectName))
  return obj ? hasKeyFor(obj, key, constant) : false
}

/**
 * Resolves the key style of the named object literal. Falls back to the
 * quoted-string form when the object is gone.
 */
function renderKeyFor(
  sourceFile: SourceFile,
  objectName: string,
  key: string,
  constant: string
) {
  const obj = findObjectLiteral(sourceFile.getVariableDeclaration(objectName))
  return obj ? renderKey(obj, key, constant) : `'${key}'`
}

// ─── Steps ───────────────────────────────────────────────────────────────────

function updateEmailTemplates(project: Project, cwd: string) {
  const sourceFile = project.getSourceFile(path.join(cwd, EMAIL_TEMPLATES_FILE))
  if (!sourceFile) {
    warnSkipped(`${EMAIL_TEMPLATES_FILE} not found; email templates not wired`)
    return
  }

  const missingObject = [TRIGGER_VARIABLE_OBJECT, TEMPLATES_OBJECT].find(
    (objectName) =>
      !findObjectLiteral(sourceFile.getVariableDeclaration(objectName))
  )

  if (missingObject) {
    warnSkipped(
      `Could not find '${missingObject}' in ${EMAIL_TEMPLATES_FILE}; email templates not wired`
    )
    return
  }

  for (const event of RECOVERY_EVENTS) {
    if (
      !objectHasKeyFor(
        sourceFile,
        TRIGGER_VARIABLE_OBJECT,
        event.id,
        event.constant
      ) &&
      appendEntry(
        sourceFile,
        TRIGGER_VARIABLE_OBJECT,
        renderKeyFor(
          sourceFile,
          TRIGGER_VARIABLE_OBJECT,
          event.id,
          event.constant
        ),
        [
          'z.object({',
          '  firstname: z.string(),',
          '  applicationName: z.string(),',
          '  countryLogo: z.string(),',
          '  recoveryURL: z.string()',
          '})'
        ]
      )
    ) {
      console.log(`  ✓ ${EMAIL_TEMPLATES_FILE}: ${event.id} variables`)
    }

    if (
      !objectHasKeyFor(
        sourceFile,
        TEMPLATES_OBJECT,
        event.id,
        event.constant
      ) &&
      appendEntry(
        sourceFile,
        TEMPLATES_OBJECT,
        renderKeyFor(sourceFile, TEMPLATES_OBJECT, event.id, event.constant),
        [
          '{',
          `  type: '${event.id}',`,
          `  subject: '${event.emailSubject}',`,
          `  template: readOtherTemplate<TriggerVariable['${event.id}']>(`,
          `    '${event.id}'`,
          '  )',
          '}'
        ]
      )
    ) {
      console.log(`  ✓ ${EMAIL_TEMPLATES_FILE}: ${event.id} template`)
    }
  }
}

function updateSmsService(project: Project, cwd: string) {
  const sourceFile = project.getSourceFile(path.join(cwd, SMS_SERVICE_FILE))
  if (!sourceFile) {
    warnSkipped(`${SMS_SERVICE_FILE} not found; SMS templates not wired`)
    return
  }

  const missingObject = [
    OTHER_TEMPLATES_OBJECT,
    TRIGGER_TO_SMS_TEMPLATE_OBJECT
  ].find(
    (objectName) =>
      !findObjectLiteral(sourceFile.getVariableDeclaration(objectName))
  )

  if (missingObject) {
    warnSkipped(
      `Could not find '${missingObject}' in ${SMS_SERVICE_FILE}; SMS templates not wired`
    )
    return
  }

  for (const event of RECOVERY_EVENTS) {
    if (
      !objectHasKeyFor(
        sourceFile,
        OTHER_TEMPLATES_OBJECT,
        event.smsTemplate,
        event.smsTemplate
      ) &&
      appendEntry(sourceFile, OTHER_TEMPLATES_OBJECT, event.smsTemplate, [
        `'${event.smsTemplate}'`
      ])
    ) {
      console.log(`  ✓ ${SMS_SERVICE_FILE}: ${event.smsTemplate}`)
    }

    if (
      !objectHasKeyFor(
        sourceFile,
        TRIGGER_TO_SMS_TEMPLATE_OBJECT,
        event.id,
        event.constant
      ) &&
      appendEntry(
        sourceFile,
        TRIGGER_TO_SMS_TEMPLATE_OBJECT,
        renderKeyFor(
          sourceFile,
          TRIGGER_TO_SMS_TEMPLATE_OBJECT,
          event.id,
          event.constant
        ),
        [`'${event.smsTemplate}'`]
      )
    ) {
      console.log(
        `  ✓ ${SMS_SERVICE_FILE}: ${event.id} -> ${event.smsTemplate}`
      )
    }
  }
}

function updateHandler(project: Project, cwd: string) {
  const sourceFile = project.getSourceFile(path.join(cwd, HANDLER_FILE))
  if (!sourceFile) {
    warnSkipped(`${HANDLER_FILE} not found; payload conversion not wired`)
    return
  }

  const convertPayload = sourceFile.getFunction(CONVERT_PAYLOAD_FUNCTION)
  const caseBlock = convertPayload
    ?.getFirstDescendantByKind(SyntaxKind.SwitchStatement)
    ?.getCaseBlock()

  if (!caseBlock) {
    warnSkipped(
      `Could not find a switch inside '${CONVERT_PAYLOAD_FUNCTION}' in ${HANDLER_FILE}; payload conversion not wired`
    )
    return
  }

  const missing = RECOVERY_EVENTS.filter(
    (event) =>
      !caseBlock.getText().includes(`TriggerEvent.${event.constant}`) &&
      !caseBlock.getText().includes(`'${event.id}'`)
  )

  if (missing.length === 0) return

  /*
   * `CaseBlock` has no clause-insertion API, so this inserts text instead:
   * ahead of `default:` when there is one — an unreached case would silently
   * become an "Unknown event" throw — otherwise after the last clause.
   * Inserted text is not re-indented, so it carries its neighbours' indent.
   */
  const existingClauses = caseBlock.getClauses()
  if (existingClauses.length === 0) {
    warnSkipped(
      `The switch inside '${CONVERT_PAYLOAD_FUNCTION}' in ${HANDLER_FILE} has no cases; payload conversion not wired`
    )
    return
  }

  const defaultClause = existingClauses.find(Node.isDefaultClause)
  const anchor = defaultClause ?? existingClauses[existingClauses.length - 1]
  const indent = anchor.getIndentationText()

  /*
   * Both events carry the same payload and render the same variables, so they
   * share one body — matching how the switch already groups 2fa with the
   * change-phone-number / change-email-address cases.
   */
  const lines = [
    ...missing.map((event) => `case TriggerEvent.${event.constant}:`),
    `  return {`,
    `    firstname,`,
    `    applicationName: applicationConfig.APPLICATION_NAME,`,
    `    countryLogo: COUNTRY_LOGO_URL,`,
    `    recoveryURL: \`\${LOGIN_URL}recover?token=\${encodeURIComponent(payload.token)}\``,
    `  }`
  ]

  if (defaultClause) {
    // Insertion starts at `default`, i.e. past its indent, so the first line
    // brings none of its own and the last hands the indent back.
    caseBlock.insertText(
      anchor.getStart(),
      `${lines.map((line, index) => (index === 0 ? line : `${indent}${line}`)).join('\n')}\n${indent}`
    )
  } else {
    caseBlock.insertText(
      anchor.getEnd(),
      `\n${lines.map((line) => `${indent}${line}`).join('\n')}`
    )
  }

  for (const event of missing) {
    console.log(`  ✓ ${HANDLER_FILE}: ${event.id} case`)
  }
}

function updateRoutes(project: Project, cwd: string) {
  const sourceFile = project.getSourceFile(path.join(cwd, ROUTES_FILE))
  if (!sourceFile) {
    warnSkipped(`${ROUTES_FILE} not found; trigger routes not registered`)
    return
  }

  const routesFunction =
    sourceFile.getFunction(ROUTES_FUNCTION) ??
    sourceFile.getFunctions().find((fn) => fn.isDefaultExport())

  const routesArray = routesFunction
    ?.getFirstDescendantByKind(SyntaxKind.ReturnStatement)
    ?.getExpressionIfKind(SyntaxKind.ArrayLiteralExpression)

  if (!routesArray) {
    warnSkipped(
      `Could not find the route array returned by '${ROUTES_FUNCTION}' in ${ROUTES_FILE}; trigger routes not registered`
    )
    return
  }

  for (const event of RECOVERY_EVENTS) {
    if (routesArray.getText().includes(`/trigger/user/${event.id}`)) continue

    routesArray.addElement(`{
  method: 'POST',
  path: '/trigger/user/${event.id}',
  handler: makeNotificationHandler('${event.id}'),
  options: {
    auth: false,
    tags: ['api'],
    description: '${event.routeDescription}'
  }
}`)
    console.log(`  ✓ ${ROUTES_FILE}: POST /trigger/user/${event.id}`)
  }
}

function renderEmailTemplate(event: RecoveryEvent) {
  return `<!--
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.

OpenCRVS is also distributed under the terms of the Civil Registration
& Healthcare Disclaimer located at http://opencrvs.org/license.

Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
-->
<!doctype html>
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
    <h1>${event.heading}</h1>
    <p>Hello {{firstname}},</p>
    <p>
      ${event.reason}
    </p>

    <div style="margin-top: 32px; margin-bottom: 32px">
      <a href="{{{recoveryURL}}}">${event.linkLabel}</a>
    </div>
    <br />
    <p>
      This link expires in 1 hour and can only be used once. If you did not
      request this, you can ignore this email.
    </p>
    <br />
    <p>
      Best regards, <br />
      {{applicationName}} Team
    </p>
  </body>
</html>
`
}

function writeEmailTemplates(cwd: string) {
  const templateDir = path.join(cwd, EMAIL_TEMPLATE_DIR)

  if (!existsSync(templateDir)) {
    warnSkipped(
      `${EMAIL_TEMPLATE_DIR} not found; recovery email bodies not written`
    )
    return
  }

  for (const event of RECOVERY_EVENTS) {
    const templatePath = path.join(templateDir, `${event.id}.html`)
    if (existsSync(templatePath)) continue

    /*
     * The recovery URL uses a triple stash on purpose: Handlebars' default
     * escaping turns the `=` of `?token=` into `&#x3D;`, which breaks the
     * query string the login page parses the token out of.
     */
    writeFileSync(templatePath, renderEmailTemplate(event))
    console.log(`  ✓ ${EMAIL_TEMPLATE_DIR}/${event.id}.html`)
  }
}

/**
 * Appends the rows the CSV is missing, keeping the file's own ordering.
 */
function addCsvRows(cwd: string, relativePath: string, rows: string[]) {
  const csvPath = path.join(cwd, relativePath)
  const file = readCsvFile(csvPath)

  if (!file) {
    warnSkipped(`${relativePath} not found; translations not added`)
    return
  }

  const added = addRows(file, rows)

  if (added.length === 0) return

  for (const id of added) {
    console.log(`  ✓ ${relativePath}: ${id}`)
  }

  writeCsvFile(csvPath, file)
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  const cwd = process.cwd()
  const tsConfigFilePath = path.join(cwd, 'tsconfig.json')

  console.log(
    'Registering the password-reset-link and username-reminder-link notifications...\n'
  )

  if (!existsSync(tsConfigFilePath)) {
    warnSkipped(
      `tsconfig.json not found in ${cwd}; notification wiring skipped entirely`
    )
    return
  }

  const project = new Project({
    tsConfigFilePath,
    skipAddingFilesFromTsConfig: false,
    // ts-morph indents inserted code with four spaces by default, which every
    // country config's prettier run would immediately undo.
    manipulationSettings: { indentationText: IndentationText.TwoSpaces }
  })

  updateEmailTemplates(project, cwd)
  updateSmsService(project, cwd)
  updateHandler(project, cwd)
  updateRoutes(project, cwd)

  await project.save()

  writeEmailTemplates(cwd)
  addCsvRows(cwd, NOTIFICATION_CSV, NOTIFICATION_CSV_ROWS)
  addCsvRows(cwd, LOGIN_CSV, LOGIN_CSV_ROWS)

  if (skipped.length > 0) {
    console.warn(
      `\n⚠️  ${skipped.length} step(s) were skipped. Wire the following by hand before upgrading:`
    )
    for (const message of skipped) {
      console.warn(`  - ${message}`)
    }
  }
}

export { main }
