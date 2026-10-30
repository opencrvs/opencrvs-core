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
 * Example of an _EXPERIMENTAL_CUSTOM field module, used by applicant.skillLevel
 * in the tennis club membership form.
 *
 * build.ts bundles this folder into one ES module, which the client loads from
 * /api/countryconfig/static/custom-fields/skill-level.js. The module can import
 * React and npm packages (react-intl here), and be split into files.
 *
 * Value: a whole number between 1 and configuration.max (default 5).
 */
import type {
  CustomFieldInputProps,
  CustomFieldOutputProps
} from '@opencrvs/toolkit/custom-fields'
import { SkillLabel } from './SkillLabel'
import { Stars } from './Stars'

type Configuration = { max?: number } | undefined

const DEFAULT_MAX = 5

function Input({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  configuration
}: CustomFieldInputProps<number, Configuration>) {
  return (
    <Stars
      disabled={disabled}
      id={id}
      max={configuration?.max ?? DEFAULT_MAX}
      value={value}
      onBlur={onBlur}
      onSelect={onChange}
    />
  )
}

function Output({ id, value }: CustomFieldOutputProps<number>) {
  if (typeof value !== 'number') {
    return null
  }
  return (
    <span id={id}>
      {'★'.repeat(value)}
      {'☆'.repeat(Math.max(DEFAULT_MAX - value, 0))}{' '}
      <SkillLabel level={value} max={DEFAULT_MAX} />
    </span>
  )
}

export default function createSkillLevelField() {
  return { Input, Output }
}
