/*
 * Per-action journey definitions for the granular-search-cache benchmark
 * harness (see cache-measure.spec.ts). Each journey is a
 * `{ seedState, warmCache, trigger, settleSignal }` bundle as the issue
 * `01-per-action-benchmark-harness.md` specifies:
 *
 *   - seed():    creates the prerequisite record(s) via API (toolkit events
 *                client) per scratch/harness-seeding-recipes.md. Called once
 *                per repetition so record-consuming actions (REGISTER, ARCHIVE,
 *                ...) always get a fresh record.
 *   - warmCache: identical for every action (5 workqueues + 10 record
 *                overviews) — lives in the runner, not here, so cache
 *                population is constant across actions and labels.
 *   - prepare(): drives the UI up to (but NOT including) the click that fires
 *                the measured mutation, and returns the `settle` signal plus a
 *                `fire()` closure. The measured window starts when `fire()`
 *                runs (per journeys doc: window starts at the confirm click).
 *
 * All journeys have been verified end-to-end against a live farajaland dev
 * stack, except DECLARE and VALIDATE which are BLOCKED on this stack (see the
 * per-journey comments): both require non-registrar roles that cannot run the
 * registrar-only warm-cache phase. Those two fail fast with a "BLOCKED:" reason.
 */
import { expect, type Page } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { faker } from '@faker-js/faker'
import { createClient } from '@opencrvs/toolkit/api'
import { ActionType } from '@opencrvs/toolkit/events'
import { CREDENTIALS, GATEWAY_HOST } from '../../constants'
import {
  continueForm,
  drawSignature,
  getRandomDate,
  getToken,
  goToSection,
  searchFromSearchBar,
  triggerDeclarationAction
} from '../../helpers'
import { ensureAssignedToUser, selectAction } from '../../utils'
import {
  fillChildDetails,
  fillDate,
  formatV2ChildName,
  openBirthDeclaration
} from '../birth/helpers'
import { openRecordByTitle } from '../print-certificate/birth/helpers'
import {
  navigateToCertificatePrintAction,
  printAndExpectPopup,
  selectCertificationType,
  selectRequesterType
} from '../print-certificate/birth/helpers'
import { createDeclaration } from '../test-data/birth-declaration'
import { createDeclaration as createDeclarationWithParents } from '../test-data/birth-declaration-with-mother-father'

type Credential = (typeof CREDENTIALS)[keyof typeof CREDENTIALS]

/** Full name of each CREDENTIALS user, for the assignedTo settle assertion. */
const CREDENTIAL_FULL_NAME: Partial<Record<Credential, string>> = {
  [CREDENTIALS.REGISTRAR]: 'Kennedy Mweene',
  [CREDENTIALS.REGISTRATION_OFFICER]: 'Felix Katongo',
  [CREDENTIALS.REGISTRAR_GENERAL]: 'Chipo Lungu'
}

/** Context the runner hands each journey's seed step. */
export interface SeedContext {
  rep: number
}

/** What a journey's seed step returns, so the UI can find the record. */
export interface JourneySeed {
  /** display title (formatted child name) used to locate the record in the UI */
  name?: string
  eventId?: string
  trackingId?: string
  /** duplicate flows: the ORIGINAL record's trackingId to match against */
  matchedTrackingId?: string
  /** print flow needs the whole declaration for the collector identity page */
  declaration?: Record<string, unknown>
}

/** How to know the measured mutation has settled inside the window. */
export type SettleSpec =
  | { kind: 'outbox' }
  | { kind: 'response'; urlIncludes: string }
  | { kind: 'assignedTo'; text: string | RegExp }
  | { kind: 'toast'; testIdPrefix: string }
  | { kind: 'none' }

export interface PreparedAction {
  settle: SettleSpec
  /** the click(s) that fire the measured mutation; window t0 is set right before */
  fire: () => Promise<void>
}

export interface Journey {
  action: string
  /** role that drives the browser + warm cache (default REGISTRAR) */
  uiRole?: Credential
  /** measured-window override in ms (default 8000, must stay < 20s poll) */
  windowMs?: number
  /**
   * negative control: no granular refetch is exercised, so ~0 `event.search`
   * is expected in the window and an empty window is success, not failure.
   */
  negativeControl?: boolean
  seed(ctx: SeedContext): Promise<JourneySeed>
  prepare(page: Page, seed: JourneySeed): Promise<PreparedAction>
}

/* ------------------------------------------------------------------ */
/* API seeding helpers                                                 */
/* ------------------------------------------------------------------ */

function userIdFromToken(token: string): string {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).sub
}

function eventsClient(token: string) {
  return createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)
}

/** Assign a record to the token's own user (recipes doc §2). */
async function apiAssign(token: string, eventId: string): Promise<void> {
  await eventsClient(token).event.actions.assignment.assign.mutate({
    eventId,
    transactionId: uuidv4(),
    type: ActionType.ASSIGN,
    assignedTo: userIdFromToken(token)
  })
}

/**
 * Unassign a record via API. Used to undo an API pre-assignment that a seed
 * needed (e.g. to make an API correction request) so the record is left
 * UNASSIGNED — the UI assign then refetches (downloads) the event document,
 * which is what enables the review actions. An API assign alone skips that
 * download and leaves every action greyed out.
 */
async function apiUnassign(token: string, eventId: string): Promise<void> {
  await eventsClient(token).event.actions.assignment.unassign.mutate({
    eventId,
    transactionId: uuidv4(),
    type: ActionType.UNASSIGN
  })
}

/** Seed a pending correction request via API; returns the requestId. */
async function apiRequestCorrection(
  token: string,
  eventId: string,
  declaration: Record<string, unknown>
): Promise<void> {
  await eventsClient(token).event.actions.correction.request.request.mutate({
    eventId,
    transactionId: uuidv4(),
    declaration: {
      'child.name': (declaration as { 'child.name': unknown })['child.name']
    },
    annotation: {}
  })
}

/* ------------------------------------------------------------------ */
/* UI navigation helpers                                               */
/* ------------------------------------------------------------------ */

/**
 * Opens the seeded record in the UI. Prefers a named workqueue when the record's
 * status pins it to one; otherwise falls back to the global search bar (works
 * regardless of assignment/status).
 */
async function openSeededRecord(
  page: Page,
  seed: JourneySeed,
  workqueue?: string
): Promise<void> {
  const name = seed.name
  if (!name) {
    throw new Error('journey seed has no record name to open')
  }
  if (workqueue) {
    await page.getByRole('button', { name: workqueue }).click()
    await openRecordByTitle(page, name)
    return
  }
  await searchFromSearchBar(page, name)
}

/**
 * Full birth declaration form fill, mirroring the proven end-to-end flow in
 * birth/8-validate-declaration-review-page.spec.ts (child / informant / mother
 * / father pages, then the review signature). Fills every required field so the
 * Declare action is enabled, and leaves the page on /review ready to declare.
 * Returns the child's display name.
 */
async function fillFullBirthDeclaration(page: Page): Promise<string> {
  const decl = {
    child: {
      firstNames: faker.person.firstName('female'),
      familyName: faker.person.lastName('female'),
      gender: 'Female',
      birthDate: getRandomDate(0, 200)
    },
    attendantAtBirth: 'Physician',
    birthType: 'Single',
    weightAtBirth: '2.4',
    placeOfBirth: 'Health Institution',
    birthLocation: 'Klow Village Hospital',
    informantType: 'Mother',
    informantEmail: faker.internet.email(),
    mother: {
      firstNames: faker.person.firstName('female'),
      familyName: faker.person.lastName('female'),
      birthDate: getRandomDate(20, 200),
      nid: faker.string.numeric(10),
      address: { province: 'Sulaka', district: 'Irundu', village: 'Xhosa' }
    },
    father: {
      firstNames: faker.person.firstName('male'),
      familyName: faker.person.lastName('male'),
      birthDate: getRandomDate(22, 200),
      nid: faker.string.numeric(10)
    }
  }
  const name = joinValuesWithSpace(decl.child.firstNames, decl.child.familyName)

  // Child page
  await page.locator('#firstname').fill(decl.child.firstNames)
  await page.locator('#surname').fill(decl.child.familyName)
  await page.locator('#child____gender').click()
  await page.getByText(decl.child.gender, { exact: true }).click()
  await fillDate(page, decl.child.birthDate)
  await page.locator('#child____placeOfBirth').click()
  await page.getByText(decl.placeOfBirth, { exact: true }).click()
  await page
    .locator('#child____birthLocation')
    .fill(decl.birthLocation.slice(0, 3))
  await page.getByText(decl.birthLocation).click()
  await page.locator('#child____attendantAtBirth').click()
  await page.getByText(decl.attendantAtBirth, { exact: true }).click()
  await page.locator('#child____birthType').click()
  await page.getByText(decl.birthType, { exact: true }).click()
  await page.locator('#child____weightAtBirth').fill(decl.weightAtBirth)
  await continueForm(page)

  // Informant page
  await page.locator('#informant____relation').click()
  await page.getByText(decl.informantType, { exact: true }).click()
  await page.locator('#informant____email').fill(decl.informantEmail)
  await continueForm(page)

  // Mother page
  await page.locator('#firstname').fill(decl.mother.firstNames)
  await page.locator('#surname').fill(decl.mother.familyName)
  await fillDate(page, decl.mother.birthDate)
  await page.locator('#mother____idType').click()
  await page.getByText('National ID', { exact: true }).click()
  await page.locator('#mother____nid').fill(decl.mother.nid)
  await page.locator('#province').click()
  await page.getByText(decl.mother.address.province, { exact: true }).click()
  await page.locator('#district').click()
  await page.getByText(decl.mother.address.district, { exact: true }).click()
  await page.locator('#village').click()
  await page.getByText(decl.mother.address.village, { exact: true }).click()
  await continueForm(page)

  // Father page
  await page.locator('#firstname').fill(decl.father.firstNames)
  await page.locator('#surname').fill(decl.father.familyName)
  await fillDate(page, decl.father.birthDate)
  await page.locator('#father____idType').click()
  await page.getByText('National ID', { exact: true }).click()
  await page.locator('#father____nid').fill(decl.father.nid)
  await page.locator('#father____addressSameAs_YES').click()
  await continueForm(page)

  // Walk any remaining pages (documents) to review, then sign.
  await goToSection(page, 'review')
  await page.getByRole('button', { name: 'Sign', exact: true }).click()
  await drawSignature(page, 'review____signature_canvas_element', false)
  await page
    .locator('#review____signature_modal')
    .getByRole('button', { name: 'Apply' })
    .click()
  await expect(page.getByRole('dialog')).not.toBeVisible()

  return name
}

const joinValuesWithSpace = (a: string, b: string) => [a, b].join(' ')

/* ------------------------------------------------------------------ */
/* Journey registry                                                    */
/* ------------------------------------------------------------------ */

/** Seed a REGISTERED record and (optionally) assign it to the registrar. */
async function seedRegistered(assign: boolean): Promise<JourneySeed> {
  const token = await getToken(CREDENTIALS.REGISTRAR)
  const res = await createDeclaration(token, undefined, ActionType.REGISTER)
  if (assign) {
    await apiAssign(token, res.eventId)
  }
  return {
    name: formatV2ChildName(res.declaration),
    eventId: res.eventId,
    trackingId: res.trackingId,
    declaration: res.declaration as Record<string, unknown>
  }
}

/**
 * Seed a record declared by the Registration Agent (same Ibombo office) and
 * assigned to the Registrar who drives the UI.
 *
 * The declaration must NOT be made by the Registrar: a user cannot
 * register/validate/archive/reject their own declaration (self-review is
 * disabled), which greys out every review action. The RA holds the validate
 * scope, so the RA's declaration auto-validates into Pending registration —
 * exactly the state REGISTER needs, and a valid state for ARCHIVE/REJECT/EDIT.
 */
async function seedDeclaredAssigned(): Promise<JourneySeed> {
  const raToken = await getToken(CREDENTIALS.REGISTRATION_OFFICER)
  const res = await createDeclaration(raToken, undefined, ActionType.DECLARE)
  // Deliberately left UNASSIGNED: the UI's ensureAssignedToUser assigns it,
  // and only the UI assign refetches (downloads) the full event document —
  // which is what enables the review actions. An API pre-assign sets the
  // assignment but skips the download, leaving every action greyed out.
  return {
    name: formatV2ChildName(res.declaration),
    eventId: res.eventId,
    trackingId: res.trackingId,
    declaration: res.declaration as Record<string, unknown>
  }
}

/** Seed a potential-duplicate pair; returns the flagged (2nd) record. */
async function seedDuplicatePair(): Promise<JourneySeed> {
  const token = await getToken(CREDENTIALS.REGISTRAR)
  const details = {
    'child.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'child.dob': new Date(Date.now() - 60 * 60 * 24 * 1000)
      .toISOString()
      .split('T')[0],
    'mother.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'mother.dob': '1995-09-12',
    'mother.idType': 'NATIONAL_ID',
    'mother.nid': faker.string.numeric(10)
  }
  // first (default REGISTER) — the record the 2nd will be matched to
  const original = await createDeclarationWithParents(token, details)
  // second (DECLARE) — server dedup flags this one POTENTIAL_DUPLICATE
  const duplicate = await createDeclarationWithParents(
    token,
    details,
    ActionType.DECLARE
  )
  // Left UNASSIGNED so the UI assign downloads the event document (enables the
  // duplicate-review actions); an API pre-assign would skip that download.
  return {
    name: formatV2ChildName(duplicate.declaration),
    eventId: duplicate.eventId,
    trackingId: duplicate.trackingId,
    matchedTrackingId: original.trackingId,
    declaration: duplicate.declaration as Record<string, unknown>
  }
}

/** Seed a REGISTERED record with a PENDING correction request. */
async function seedPendingCorrection(): Promise<JourneySeed> {
  const token = await getToken(CREDENTIALS.REGISTRAR)
  const res = await createDeclaration(token, undefined, ActionType.REGISTER)
  // The API correction request requires the record assigned to the requester;
  // unassign again afterwards so the UI assign downloads the event document
  // (which enables the review-correction action).
  await apiAssign(token, res.eventId)
  await apiRequestCorrection(
    token,
    res.eventId,
    res.declaration as Record<string, unknown>
  )
  await apiUnassign(token, res.eventId)
  return {
    name: formatV2ChildName(res.declaration),
    eventId: res.eventId,
    trackingId: res.trackingId,
    declaration: res.declaration as Record<string, unknown>
  }
}

const JOURNEYS: Record<string, Journey> = {
  /* ---- assignment actions (not in outbox, no granular refetch) ---- */
  ASSIGN: {
    action: 'ASSIGN',
    negativeControl: true,
    seed: () => seedRegistered(false), // leave UNASSIGNED
    async prepare(page, seed) {
      await openSeededRecord(page, seed)
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      const assignItem = page
        .locator('#action-Dropdown-Content li')
        .filter({ hasText: /^Assign$/i })
        .first()
      await assignItem.waitFor({ state: 'visible' })
      await assignItem.click()
      const fullName = CREDENTIAL_FULL_NAME[CREDENTIALS.REGISTRAR]!
      return {
        settle: { kind: 'assignedTo', text: fullName },
        fire: async () => {
          await page
            .getByRole('button', { name: 'Assign', exact: true })
            .click()
        }
      }
    }
  },

  UNASSIGN: {
    action: 'UNASSIGN',
    negativeControl: true,
    seed: () => seedRegistered(true), // REGISTER keeps assignment via apiAssign
    async prepare(page, seed) {
      await openSeededRecord(page, seed)
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await selectAction(page, 'Unassign')
      return {
        settle: { kind: 'assignedTo', text: 'Not assigned' },
        fire: async () => {
          await page
            .getByRole('button', { name: 'Unassign', exact: true })
            .click()
        }
      }
    }
  },

  /* ---- write actions (outbox-routed, granular refetch) ---- */
  // BLOCKED on this farajaland stack: DECLARE cannot be isolated as the
  // Registrar who drives the warm cache. The birth config auto-adds the
  // `validated` flag on DECLARE for LOCAL_REGISTRAR (src/events/birth/index.ts:
  // declare flags → or(hasRole('REGISTRATION_AGENT'|'LOCAL_REGISTRAR'|
  // 'EMBASSY_OFFICIAL'))), so a registrar's review enables only Register and the
  // Declare menu item is disabled. A non-registrar declarer (e.g. Hospital
  // Official) could fire a standalone DECLARE, but that role lacks the
  // registrar-only warm-cache workqueues (Pending registration / certification),
  // so it hangs the shared warmCache. Left implemented; fails fast with this
  // reason instead of hanging the full test timeout.
  DECLARE: {
    action: 'DECLARE',
    seed: async () => ({}), // fresh form, nothing seeded
    async prepare(page) {
      await openBirthDeclaration(page)
      await fillFullBirthDeclaration(page)
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      const declareItem = page
        .locator('#action-Dropdown-Content')
        .getByText('Declare', { exact: true })
      await declareItem.waitFor({ state: 'visible', timeout: 10_000 })
      const declareDisabled = await declareItem
        .evaluate(
          (el) =>
            el.hasAttribute('disabled') ||
            el.closest('li')?.hasAttribute('disabled') === true
        )
        .catch(() => false)
      if (declareDisabled) {
        throw new Error(
          'BLOCKED: DECLARE is not isolable as a Local Registrar — the birth ' +
            'config auto-validates a registrar DECLARE, so only Register is ' +
            'enabled and the Declare menu item is disabled. Requires a ' +
            'non-registrar declarer, which cannot run the registrar warm cache.'
        )
      }
      await declareItem.click()
      const confirm = page.getByRole('button', { name: 'Confirm' })
      await confirm.waitFor({ state: 'visible' })
      return {
        settle: { kind: 'response', urlIncludes: 'event.actions.declare' },
        fire: async () => {
          await confirm.click()
        }
      }
    }
  },

  REGISTER: {
    action: 'REGISTER',
    seed: () => seedDeclaredAssigned(),
    async prepare(page, seed) {
      await openSeededRecord(page, seed, 'Pending registration')
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await selectAction(page, 'Register')
      const confirm = page.getByRole('button', { name: 'Confirm' })
      await confirm.waitFor({ state: 'visible' })
      return {
        settle: { kind: 'response', urlIncludes: 'event.actions.register' },
        fire: async () => {
          await confirm.click()
        }
      }
    }
  },

  // BLOCKED on this farajaland stack: the custom VALIDATE_DECLARATION action is
  // scoped to the Registration Agent, so a Local Registrar's action menu has no
  // Validate item (the registrar registers directly instead of validating). The
  // RA who CAN validate lacks the registrar-only warm-cache workqueues (Pending
  // registration / certification), so an RA uiRole hangs the shared warmCache.
  // Left implemented (registrar-driven, opens the seeded Pending-validation
  // record via search); fails fast with this reason instead of hanging.
  VALIDATE: {
    action: 'VALIDATE',
    async seed() {
      // Seed DECLARED but NOT auto-validated: a lower role's DECLARE lands in
      // Pending validation (a registrar's DECLARE auto-validates). On this
      // farajaland stack the Community Leader lacks the declare scope
      // (FORBIDDEN); the Hospital Official can create+declare a birth and, as a
      // non-validating role, it lands in Pending validation for the registrar
      // to validate via UI.
      const notifierToken = await getToken(CREDENTIALS.HOSPITAL_OFFICIAL)
      const res = await createDeclaration(
        notifierToken,
        undefined,
        ActionType.DECLARE
      )
      return {
        name: formatV2ChildName(res.declaration),
        eventId: res.eventId,
        trackingId: res.trackingId,
        declaration: res.declaration as Record<string, unknown>
      }
    },
    async prepare(page, seed) {
      // The Registrar has no 'Pending validation' workqueue button on this
      // stack, so open the record via global search (works regardless of queue).
      await openSeededRecord(page, seed)
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      // Blocker guard: fail fast if the registrar's action menu has no Validate.
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      const validateItem = page
        .locator('#action-Dropdown-Content')
        .getByText('Validate', { exact: true })
      if (
        !(await validateItem.isVisible({ timeout: 10_000 }).catch(() => false))
      ) {
        throw new Error(
          'BLOCKED: VALIDATE (custom VALIDATE_DECLARATION) is scoped to the ' +
            'Registration Agent; a Local Registrar has no Validate action, and ' +
            'the RA cannot run the registrar-only warm-cache phase.'
        )
      }
      await validateItem.click()
      await expect(
        page.getByRole('heading', { name: 'Validate?', exact: true })
      ).toBeVisible()
      const confirm = page.getByRole('button', { name: 'Confirm' })
      return {
        settle: { kind: 'response', urlIncludes: 'event.actions.custom' },
        fire: async () => {
          await confirm.click()
        }
      }
    }
  },

  ARCHIVE: {
    action: 'ARCHIVE',
    seed: () => seedDeclaredAssigned(),
    async prepare(page, seed) {
      await openSeededRecord(page, seed)
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await selectAction(page, 'Archive')
      return {
        settle: { kind: 'response', urlIncludes: 'event.actions.archive' },
        fire: async () => {
          await page
            .getByRole('button', { name: 'Archive', exact: true })
            .click()
        }
      }
    }
  },

  REJECT: {
    action: 'REJECT',
    seed: () => seedDeclaredAssigned(),
    async prepare(page, seed) {
      await openSeededRecord(page, seed)
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await selectAction(page, 'Reject')
      await page.getByTestId('reject-reason').fill(faker.lorem.sentence())
      return {
        settle: {
          kind: 'response',
          urlIncludes: 'event.actions.reject.request'
        },
        fire: async () => {
          await page.getByRole('button', { name: 'Send For Update' }).click()
        }
      }
    }
  },

  // In farajaland the UI has no standalone edit-commit: Edit re-enters the
  // register flow, so this fires event.actions.edit + declare + register.
  EDIT: {
    action: 'EDIT',
    seed: () => seedDeclaredAssigned(),
    async prepare(page, seed) {
      await openSeededRecord(page, seed, 'Pending registration')
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await selectAction(page, 'Edit')
      await page.getByTestId('change-button-child.weightAtBirth').click()
      await page.getByTestId('number__child____weightAtBirth').fill('2.6')
      await page.getByRole('button', { name: 'Go to review' }).click()
      return {
        // multiple mutations settle; outbox badge clearing is the safe signal
        settle: { kind: 'outbox' },
        fire: async () => {
          await triggerDeclarationAction(page, 'Register with edits')
        }
      }
    }
  },

  // Print has no onSuccess refetch; the search traffic comes from the deferred
  // auto-UNASSIGN + the workqueue remount on redirect. Window must span both,
  // so it is wider than default and gated on the success toast, not a timer.
  PRINT_CERTIFICATE: {
    action: 'PRINT_CERTIFICATE',
    windowMs: 15_000,
    // UNASSIGNED so the UI assign (in navigateToCertificatePrintAction) downloads
    // the event document, enabling the Print action.
    seed: () => seedRegistered(false),
    async prepare(page, seed) {
      await page.getByRole('button', { name: 'Pending certification' }).click()
      await navigateToCertificatePrintAction(
        page,
        seed.declaration as {
          'child.name': { firstname: string; surname: string }
          [key: string]: unknown
        },
        CREDENTIALS.REGISTRAR
      )
      await selectCertificationType(page, 'Birth Certificate')
      await selectRequesterType(page, 'Print and issue to Informant (Mother)')
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      // collect-payment page
      await page.getByRole('button', { name: 'Continue' }).click()
      await expect(
        page.getByRole('button', { name: 'Yes, print certificate' })
      ).toBeVisible()
      return {
        settle: { kind: 'toast', testIdPrefix: 'print-successful' },
        fire: async () => {
          await printAndExpectPopup(page)
        }
      }
    }
  },

  REQUEST_CORRECTION: {
    action: 'REQUEST_CORRECTION',
    // UNASSIGNED so the UI assign downloads the event document (enables Correct).
    seed: () => seedRegistered(false),
    async prepare(page, seed) {
      await openSeededRecord(page, seed, 'Pending certification')
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await selectAction(page, 'Correct')
      // requester + reason
      await page.locator('#requester____type').click()
      await page.getByText('Informant (Mother)', { exact: true }).click()
      await page.locator('#reason____option').click()
      await page
        .getByText('Myself or an agent made a mistake (Clerical error)', {
          exact: true
        })
        .click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      // supporting documents page (docs optional) → fees → review
      await page.getByRole('button', { name: 'Continue' }).click()
      await page
        .locator('#fees____amount')
        .fill(faker.number.int({ min: 1, max: 1000 }).toString())
      await page.getByRole('button', { name: 'Continue' }).click()
      // review: change a value so "Submit correction request" enables
      await page.getByTestId('change-button-informant.email').click()
      await page
        .getByTestId('text__informant____email')
        .fill(faker.internet.email())
      await page.getByRole('button', { name: 'Go to review' }).click()
      await page.getByRole('button', { name: 'Continue' }).click() // → summary
      // The Registrar can approve corrections, so the summary submit is labelled
      // "Correct record" (a direct correction that fires correction.request AND
      // correction.approve). A non-approver role would see "Submit correction
      // request" instead. Either way the settle signal (correction.request)
      // fires. The submit opens a confirm dialog whose primary button is #send.
      await page.getByRole('button', { name: 'Correct record' }).click()
      const confirm = page.locator('#send')
      await confirm.waitFor({ state: 'visible' })
      return {
        settle: {
          kind: 'response',
          urlIncludes: 'event.actions.correction.request'
        },
        fire: async () => {
          await confirm.click()
        }
      }
    }
  },

  APPROVE_CORRECTION: {
    action: 'APPROVE_CORRECTION',
    seed: () => seedPendingCorrection(),
    async prepare(page, seed) {
      await openSeededRecord(page, seed, 'Pending corrections')
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await selectAction(page, 'Review correction request')
      await page.getByRole('button', { name: 'Approve', exact: true }).click()
      return {
        settle: {
          kind: 'response',
          urlIncludes: 'event.actions.correction.approve'
        },
        fire: async () => {
          await page
            .getByRole('button', { name: 'Confirm', exact: true })
            .click()
        }
      }
    }
  },

  // No e2e coverage — selectors from client correct/review/ReviewCorrection.tsx.
  REJECT_CORRECTION: {
    action: 'REJECT_CORRECTION',
    seed: () => seedPendingCorrection(),
    async prepare(page, seed) {
      await openSeededRecord(page, seed, 'Pending corrections')
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await selectAction(page, 'Review correction request')
      await page.locator('#rejectCorrectionBtn').click()
      await page
        .locator('#reject-correction-reason')
        .fill(faker.lorem.sentence())
      return {
        settle: {
          kind: 'response',
          urlIncludes: 'event.actions.correction.reject'
        },
        fire: async () => {
          await page.locator('#reject_correction').click()
        }
      }
    }
  },

  MARK_AS_DUPLICATE: {
    action: 'MARK_AS_DUPLICATE',
    seed: () => seedDuplicatePair(),
    async prepare(page, seed) {
      await openSeededRecord(page, seed, 'Potential duplicate')
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await selectAction(page, 'Review potential duplicates')
      await page.getByRole('button', { name: 'Mark as duplicate' }).click()
      await page.locator('.react-select__control').first().click()
      await page
        .locator('.react-select__option')
        .getByText(seed.matchedTrackingId ?? '')
        .click()
      await page.locator('#describe-reason').fill('Benchmark duplicate')
      return {
        settle: {
          kind: 'response',
          urlIncludes: 'event.actions.duplicate.markAsDuplicate'
        },
        fire: async () => {
          await page.getByTestId('mark-as-duplicate-button').click()
        }
      }
    }
  },

  // onSuccess does NOT refetch or invalidate workqueues → negative control.
  MARK_AS_NOT_DUPLICATE: {
    action: 'MARK_AS_NOT_DUPLICATE',
    negativeControl: true,
    seed: () => seedDuplicatePair(),
    async prepare(page, seed) {
      await openSeededRecord(page, seed, 'Potential duplicate')
      await ensureAssignedToUser(page, CREDENTIALS.REGISTRAR)
      await selectAction(page, 'Review potential duplicates')
      await page.getByRole('button', { name: 'Not a duplicate' }).click()
      return {
        settle: {
          kind: 'response',
          urlIncludes: 'event.actions.duplicate.markNotDuplicate'
        },
        fire: async () => {
          await page.locator('#not-duplicate-confirm').click()
        }
      }
    }
  },

  /* ---- draft / meta actions ---- */
  // The original measurement journey: new event → child name → Save & Exit.
  CREATE: {
    action: 'CREATE',
    seed: async () => ({}),
    async prepare(page) {
      await openBirthDeclaration(page)
      await fillChildDetails(page)
      await page.getByRole('button', { name: 'Save & Exit' }).click()
      const confirm = page.getByRole('button', { name: 'Confirm' })
      await confirm.waitFor({ state: 'visible' })
      return {
        settle: { kind: 'outbox' },
        fire: async () => {
          await confirm.click()
        }
      }
    }
  },

  // Save & Exit again on an already-created draft → fires event.draft.create
  // only. Negative control per the issue (no justified server search refetch).
  DRAFT_SAVE: {
    action: 'DRAFT_SAVE',
    negativeControl: true,
    seed: async () => ({}),
    async prepare(page) {
      // create a draft first
      const name = await openBirthDeclaration(page).then(() =>
        fillChildDetails(page)
      )
      await page.getByRole('button', { name: 'Save & Exit' }).click()
      const createResponse = page.waitForResponse(
        (r) => r.url().includes('event.draft.create') && r.ok()
      )
      await page.getByRole('button', { name: 'Confirm' }).click()
      await createResponse
      // re-open the draft and edit it
      await page.getByRole('button', { name: 'Drafts' }).click()
      await openRecordByTitle(page, name)
      await selectAction(page, 'Update')
      // 'Update' reopens the draft directly on the review page. Editing a field
      // via its Change button first pops an "Edit declaration?" confirm; then it
      // navigates to the child page where the name field and Save & Exit live.
      await page.getByTestId('change-button-child.name').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.locator('#surname').fill(faker.person.lastName('female'))
      await page.getByRole('button', { name: 'Save & Exit' }).click()
      const confirm = page.getByRole('button', { name: 'Confirm' })
      await confirm.waitFor({ state: 'visible' })
      return {
        settle: { kind: 'response', urlIncludes: 'event.draft.create' },
        fire: async () => {
          await confirm.click()
        }
      }
    }
  },

  DELETE: {
    action: 'DELETE',
    seed: async () => ({}),
    async prepare(page) {
      // create a draft to delete
      const name = await openBirthDeclaration(page).then(() =>
        fillChildDetails(page)
      )
      await page.getByRole('button', { name: 'Save & Exit' }).click()
      const createResponse = page.waitForResponse(
        (r) => r.url().includes('event.draft.create') && r.ok()
      )
      await page.getByRole('button', { name: 'Confirm' }).click()
      await createResponse
      await page.getByRole('button', { name: 'Drafts' }).click()
      await openRecordByTitle(page, name)
      await selectAction(page, 'Update')
      return {
        settle: { kind: 'response', urlIncludes: 'event.delete' },
        fire: async () => {
          await triggerDeclarationAction(page, 'Delete declaration')
        }
      }
    }
  },

  // Open a record overview only. No mutation → negative control.
  READ: {
    action: 'READ',
    negativeControl: true,
    seed: () => seedRegistered(false),
    async prepare(page, seed) {
      const name = seed.name!
      await page.getByRole('button', { name: 'Pending certification' }).click()
      return {
        settle: { kind: 'none' },
        fire: async () => {
          await openRecordByTitle(page, name)
        }
      }
    }
  }
}

export const JOURNEY_ORDER = [
  'ASSIGN',
  'UNASSIGN',
  'DECLARE',
  'REGISTER',
  'VALIDATE',
  'ARCHIVE',
  'REJECT',
  'EDIT',
  'PRINT_CERTIFICATE',
  'REQUEST_CORRECTION',
  'APPROVE_CORRECTION',
  'REJECT_CORRECTION',
  'MARK_AS_DUPLICATE',
  'MARK_AS_NOT_DUPLICATE',
  'CREATE',
  'DELETE',
  'READ',
  'DRAFT_SAVE'
] as const

export function getJourney(action: string): Journey {
  const journey = JOURNEYS[action.toUpperCase()]
  if (!journey) {
    throw new Error(
      `Unknown ACTION="${action}". Known actions: ${JOURNEY_ORDER.join(', ')}`
    )
  }
  return journey
}
