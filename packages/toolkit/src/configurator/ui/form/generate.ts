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
// `username` is lowercase letters and digits with a letter first: it is safe as a user name almost anywhere
// (Postgres, Kibana, an S3 access key), which a password alphabet with capitals and a leading digit is not.
export type Charset = 'alphanumeric' | 'hex' | 'username'

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'

const ALPHABETS: Record<Exclude<Charset, 'username'>, string> = {
  alphanumeric: `${DIGITS}${LETTERS}${LETTERS.toUpperCase()}`,
  hex: '0123456789abcdef'
}

function randomChars(alphabet: string, length: number): string {
  // Reject bytes above the largest multiple of the alphabet size to avoid modulo bias.
  const limit = 256 - (256 % alphabet.length)
  let out = ''
  while (out.length < length) {
    for (const byte of crypto.getRandomValues(new Uint8Array(length))) {
      if (byte < limit && out.length < length) out += alphabet.charAt(byte % alphabet.length)
    }
  }
  return out
}

// Never call this from a SurveyJS expression: expressions re-run whenever an
// input changes, which would silently replace the secret.
export function generateSecret(length: number, charset: Charset = 'alphanumeric'): string {
  if (charset === 'username') return length < 1 ? '' : randomChars(LETTERS, 1) + randomChars(LETTERS + DIGITS, length - 1)
  return randomChars(ALPHABETS[charset], length)
}
