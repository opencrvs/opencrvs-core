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
import type { Plan } from './plan'

const PLAIN = /^[A-Za-z0-9_@%+=:,./-]*$/

function quote(value: string): string {
  if (PLAIN.test(value)) return value
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/\n/g, '\\n')}"`
}

// A dotenv file with every value the plan writes. It contains the secrets, and GitHub never gives
// them back, so this is the only copy: the user decides where it goes.
export function renderEnvFile(plan: Plan): string {
  const lines = [
    `# ${plan.environment}: values written by OpenCRVS Environment configuration.`,
    '# This file contains secrets. Keep it private; GitHub cannot return secret values.'
  ]
  for (const item of plan.items) {
    if (item.status === 'keep' || item.value === '') continue
    lines.push(`${item.name}=${quote(item.value)}`)
  }
  return lines.join('\n') + '\n'
}
