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

/*
 * Example of an _EXPERIMENTAL_CUSTOM field module.
 *
 * The client loads this file as an ES module from
 * /api/countryconfig/static/custom-fields/skill-level.js and calls the default
 * export with its own React instance. Do not import or bundle another copy of
 * React here: hooks only work with the instance the client gives.
 *
 * Value: a whole number between 1 and configuration.max (default 5).
 */
export default function createSkillLevelField({ React }) {
  const h = React.createElement

  function getMax(configuration) {
    return (configuration && configuration.max) || 5
  }

  function Input({ id, value, onChange, onBlur, disabled, configuration }) {
    const max = getMax(configuration)
    const [hovered, setHovered] = React.useState(null)
    const shown = hovered ?? value ?? 0

    return h(
      'div',
      {
        id,
        role: 'radiogroup',
        onMouseLeave: () => setHovered(null),
        onBlur,
        style: { display: 'flex', gap: 4 }
      },
      Array.from({ length: max }, (_, index) => {
        const level = index + 1
        return h(
          'button',
          {
            key: level,
            id: `${id}-${level}`,
            type: 'button',
            role: 'radio',
            'aria-checked': value === level,
            'aria-label': `${level} of ${max}`,
            disabled,
            onMouseEnter: () => setHovered(level),
            onClick: () => onChange(level),
            style: {
              border: 'none',
              background: 'none',
              padding: 0,
              fontSize: 32,
              lineHeight: 1,
              cursor: disabled ? 'default' : 'pointer',
              color: level <= shown ? '#f5a623' : '#c4c4c4'
            }
          },
          '★'
        )
      })
    )
  }

  function Output({ id, value }) {
    if (typeof value !== 'number') {
      return null
    }
    return h(
      'span',
      { id },
      `${'★'.repeat(value)}${'☆'.repeat(Math.max(5 - value, 0))} (${value}/5)`
    )
  }

  return { Input, Output }
}
