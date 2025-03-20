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
/* eslint-disable */
const { getJestConfig } = require('@storybook/test-runner')
const path = require('path')

/**
 * By default, Storybook's Jest configuration is used.
 * Because our monorepo setup, the root dir is set to the root of the monorepo.
 * This file is used to override the root dir to the client folder.
 */

// The default Jest configuration comes from @storybook/test-runner
const testRunnerConfig = getJestConfig()
const clientRootDir = path.join(__dirname)

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  ...testRunnerConfig,
  /** Add your own overrides below, and make sure
   *  to merge testRunnerConfig properties with your own
   * @see https://jestjs.io/docs/configuration
   */
  rootDir: clientRootDir
}
