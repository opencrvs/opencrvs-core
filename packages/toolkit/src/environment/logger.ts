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

import kleur from 'kleur'

/* eslint-disable no-console */
export const log = console.log
export const warn = console.warn
export const success = (...args: any[]) =>
  console.log(kleur.green(args.join(' ')))
export const info = console.info
export const error = (...args: any[]) => console.log(kleur.red(args.join(' ')))
