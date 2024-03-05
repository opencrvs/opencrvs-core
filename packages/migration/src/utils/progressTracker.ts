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

export function reportProgress(message: string, step: number, total: number) {
  // log every 0.1% progress
  const logEvery = Math.max(10, Math.round(total / 1000))
  if (step % logEvery === 0 || step === total) {
    console.log(`${message}: ${((100 * step) / total).toFixed(2)}%`)
  }
}
