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
// The receiving end expects a URL safe Base64 encoding in many places
// In addition to that, it also expects it to be padded with ='s to the nearest 4 character chunk, which base64url in Node.js doesn't do by default

export const padBase64 = (str: string) =>
  str + '='.repeat((4 - (str.length % 4)) % 4)

export const base64Encode = (input: string) =>
  Buffer.from(input, 'utf8').toString('base64url')
