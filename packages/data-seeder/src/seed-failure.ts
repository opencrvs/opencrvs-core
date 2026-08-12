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
 * What an operator is told when the seed job fails, and where the line between
 * the two kinds of failure is drawn.
 *
 * There are two kinds, and keeping them apart is the whole point of this
 * module:
 *
 * - A failure **before the first write** leaves the database untouched. Its
 *   report ends `nothing was seeded` and names no remedy, because there is
 *   nothing to clean up. Telling an operator to clear a database that was
 *   never written to would send them to destroy a clean system for no reason.
 *   Pre-flight validation fails this way too, and says the same phrase — see
 *   `formatValidationReport` in `./validate-seed-data.ts`.
 * - A failure **after writing has begun** leaves the database holding
 *   incomplete seed-data, and re-running does not recover: the job mints fresh
 *   identifiers on every run, so a second attempt collides on an external-id
 *   unique constraint rather than resuming where it stopped. Clearing the data
 *   is the only way forward, so the report says so. This is reported
 *   behaviour, not a repair: the retry path is deliberately out of scope.
 *
 * The remedy names no command. The same job runs on a developer's machine, as
 * a Compose service, and as a deployment job, so any one command would be
 * wrong for two of the three.
 *
 * Everything here is pure — facts in, a rendered report out — so that the
 * wording can be tested without a database, a network, or a process to exit.
 * Printing and exiting belong to the entry point; see `./index.ts`.
 */

/**
 * The record a failure belongs to, identified the way the validator identifies
 * one: `position` is the record's 1-based place in the seed-data, and is
 * deliberately not a line number — see the note in `./validate-seed-data.ts`.
 */
export interface FailedRecord {
  position: number
  username: string
}

/** A failure while creating one of the initial users, in the three parts an
 * operator needs: which record stopped the run, why, and how much of the
 * seed-data was already written. */
export interface InitialUserFailure {
  record: FailedRecord
  /** What went wrong, as the operator should read it. */
  reason: string
  /** How many initial users were created before this failure. */
  created: number
  /** How many initial users the seed-data holds. */
  total: number
}

const REMEDY =
  'The database now holds incomplete seed-data. ' +
  'Clear the database before you seed again.'

const NOTHING_WAS_SEEDED = 'No write was attempted; nothing was seeded.'

/** Every report has the same shape: a headline, the detail indented under it,
 * and a closing sentence saying what the operator should do about it. */
function renderReport(headline: string, details: string[], closing: string) {
  return [
    headline,
    '',
    ...details.map((detail) => `  ${detail}`),
    '',
    closing
  ].join('\n')
}

/**
 * The report for a failure while creating initial users: the record that
 * failed, how far the run got, and the remedy.
 */
export function formatInitialUserFailure({
  record,
  reason,
  created,
  total
}: InitialUserFailure): string {
  const counted =
    total === 1
      ? `${created} of 1 initial user was created before this failure`
      : `${created} of ${total} initial users were created before this failure`

  return renderReport(
    'Seeding failed while creating initial users.',
    [`record ${record.position} (${record.username}): ${reason}`, counted],
    REMEDY
  )
}

/**
 * The report for any other failure after writing had begun — a location write,
 * or a step after the users. It cannot name a record, but the database is in
 * the same state, so it carries the same remedy.
 */
export function formatPartialSeedFailure(reason: string): string {
  return renderReport(
    'Seeding failed after writing had begun.',
    [reason],
    REMEDY
  )
}

/**
 * The report for a failure before any write was attempted — a seed-data fetch
 * that never arrived, or anything else that went wrong on the way to
 * validation. It ends with the phrase that tells the operator their database
 * is still clean, and names no remedy.
 */
export function formatUnwrittenFailure(reason: string): string {
  return renderReport(
    'Seeding failed before anything was written.',
    [reason],
    NOTHING_WAS_SEEDED
  )
}

/** How a thrown value reads to an operator: its message, or the value itself
 * when something other than an error was thrown. */
export function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message || error.name
  }

  return String(error)
}

/**
 * The write path reports a duplicate as a bare code, which is precise for a
 * client and opaque to a person reading a terminal. These are the codes the
 * user create route raises, mapped to the seed-data field they are about.
 */
const DUPLICATE_FIELDS: Record<string, 'email' | 'mobile'> = {
  DUPLICATE_EMAIL: 'email',
  DUPLICATE_MOBILE: 'mobile'
}

/**
 * Why creating one initial user failed, expanded far enough to act on: a bare
 * duplicate code gains the field and the offending value from the record that
 * carried it, and anything else reads as the error said it.
 */
export function describeInitialUserFailure(
  error: unknown,
  user: { email?: string; mobile?: string }
): string {
  const message = describeError(error)
  const field = DUPLICATE_FIELDS[message]

  if (!field) {
    return message
  }

  const value = user[field]

  return value === undefined
    ? `${message} — ${field} is already in use`
    : `${message} — ${field} "${value}" is already in use`
}

/**
 * A failure that happened after writing had begun, carrying the report the
 * operator should see.
 *
 * The type is the phase marker. Only the writing part of the entry point
 * raises it, so an error reaching the top-level handler *without* it can only
 * have come from before the first write — which is what lets the handler
 * choose between `nothing was seeded` and the clear-the-database remedy
 * without tracking any state.
 */
export class PartialSeedError extends Error {
  public readonly report: string

  constructor(report: string) {
    super(report)
    this.name = 'PartialSeedError'
    this.report = report
  }
}
