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
 * Minimal shim for libraries (e.g. react-select-event) that import act from
 * @testing-library/react. RTL's act throws in production React builds, which
 * breaks interaction tests against built Storybook. Storybook's instrumented
 * utilities handle act internally, so a passthrough is sufficient here.
 */
export async function act(callback: () => unknown | Promise<unknown>) {
  await callback()
}
