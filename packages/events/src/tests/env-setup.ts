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
import { generateKeyPairSync } from 'crypto'
import { mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
process.env.CERT_PUBLIC_KEY_PATH = path.resolve(__dirname, 'cert.public.key')

// A throwaway request-signing key, so no private key is committed for tests.
const requestSigningKeyPath = path.join(
  mkdtempSync(path.join(tmpdir(), 'events-test-')),
  'core-request-signing.pem'
)
writeFileSync(
  requestSigningKeyPath,
  generateKeyPairSync('ed25519').privateKey.export({
    format: 'pem',
    type: 'pkcs8'
  })
)
process.env.CORE_REQUEST_SIGNING_KEY_PATH = requestSigningKeyPath
