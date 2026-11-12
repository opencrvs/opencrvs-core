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
import type { Snapshot } from '../bindings/snapshot'
import { generateSecret } from '../form/generate'
import type { LocalServerPort } from '../local/port'

// The CLI keeps three secrets for the backup of an environment: the SSH key pair for the backup server and the
// passphrase that encrypts the backups. None has a question: they are made when the plan is prepared, and the
// plan writes them like any other secret.
export const BACKUP_PRIVATE_KEY = 'BACKUP_HOST_PRIVATE_KEY'
export const BACKUP_PUBLIC_KEY = 'BACKUP_HOST_PUBLIC_KEY'
export const BACKUP_PASSPHRASE = 'BACKUP_ENCRYPTION_PASSPHRASE'

// The form variable that says whether the environment has the key pair on GitHub. The pair has no question, so
// `definedSecrets` does not list it; the checkbox that asks for a new pair reads this one (see forms/wizard.yml).
export const BACKUP_KEYS_VARIABLE = 'backupKeysExist'

// Whether GitHub already holds the key pair of the environment; false without GitHub or for a new environment.
export const hasBackupKeys = (snapshot?: Snapshot): boolean =>
  snapshot?.github?.environment.secretNames.includes(BACKUP_PRIVATE_KEY) ?? false

// The same as the other generated passwords, and as the CLI's.
const PASSPHRASE_LENGTH = 16

// What a backing-up environment still needs, by secret name. Only a backup makes any, and without GitHub there is
// nowhere to keep them. `values` are the answers on screen: the checkbox is only there while the environment backs up.
//
// - The key pair is made when the environment has none on GitHub yet, as in the CLI (so always for a new
//   environment), and also when "Generate new private/public SSH key pair" is ticked, to replace it.
// - The passphrase is made only when there is none, never replaced: every backup already made is encrypted with it,
//   so a new one would leave them unreadable. The checkbox does not touch it.
export async function generateBackupSecrets(
  values: Record<string, unknown>,
  snapshot: Snapshot,
  local: LocalServerPort
): Promise<Record<string, string>> {
  if (values.BACKUP_OR_RESTORE !== 'backup' || !snapshot.github) return {}
  const exists = (name: string) => snapshot.github!.environment.secretNames.includes(name)
  const made: Record<string, string> = {}

  if (values.GENERATE_BACKUP_SSH_KEYS === true || !hasBackupKeys(snapshot)) {
    const { privateKey, publicKey } = await local.generateSshKeyPair()
    made[BACKUP_PRIVATE_KEY] = privateKey
    made[BACKUP_PUBLIC_KEY] = publicKey
  }
  if (!exists(BACKUP_PASSPHRASE)) made[BACKUP_PASSPHRASE] = generateSecret(PASSPHRASE_LENGTH)
  return made
}
