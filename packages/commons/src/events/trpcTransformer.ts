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
 * tRPC transformer for the events service. It does not change the data, so
 * requests and responses are sent as plain JSON.
 *
 * Without a transformer, tRPC types each output as its JSON form. That changes
 * some types, for example the `FieldValue` union, so they no longer match the
 * types in commons. With this transformer, clients get the output types that
 * the procedures declare. All events values are JSON safe (dates are ISO
 * strings), so these types are correct.
 */
export const jsonTransformer = {
  serialize: <T>(value: T) => value,
  deserialize: <T>(value: T) => value
}
