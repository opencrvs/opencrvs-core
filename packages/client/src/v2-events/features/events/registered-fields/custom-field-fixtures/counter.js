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
// Custom field modules for Custom.test.tsx, as a country config would serve them
export default function createCounterField({ React }) {
  globalThis.counterFactoryCalls = (globalThis.counterFactoryCalls ?? 0) + 1

  function Input({ id, value, onChange }) {
    const [count, setCount] = React.useState(value ?? 0)
    return React.createElement(
      'button',
      {
        id,
        type: 'button',
        onClick: () => {
          setCount(count + 1)
          onChange(count + 1)
        }
      },
      'Clicked ' + count + ' times'
    )
  }

  function Output({ value }) {
    return React.createElement('span', null, 'Value is ' + value)
  }

  return { Input, Output }
}
