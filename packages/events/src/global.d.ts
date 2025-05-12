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

// Chai is a dependency of vitest, and it pollutes the global object namespace with its own 'should' property.
// This colludes with some strict library types, such as elasticsearch esClient.search() parameter types.
// We could separate the tests from the code, and use a separate tsconfig for them, but this is a simpler fix to the solution.
interface Object {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  should?: any
}
