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

// Like the output of the toolkit bundler plugin: React comes from the global
// while the module loads, as npm packages such as react-intl need
const externals = globalThis.__OPENCRVS_CUSTOM_FIELD_EXTERNALS__
const React = externals['react']
const { jsx } = externals['react/jsx-runtime']

const Label = React.createContext('Text from a context made at load time')

export default function createSharedExternalsField() {
  function Output() {
    return jsx(Label.Consumer, { children: (text) => text })
  }

  return { Input: Output, Output }
}
