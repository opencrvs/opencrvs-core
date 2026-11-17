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
 * Test user JWTs signed in Node by src/tests/test-tokens-plugin.ts, so
 * browser code (Storybook) can use them without `jsonwebtoken`.
 */
declare module 'virtual:test-tokens' {
  const tokens: import('../src/tests/sign-test-tokens').TestUserTokens
  export default tokens
}
