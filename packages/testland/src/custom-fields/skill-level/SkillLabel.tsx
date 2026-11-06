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
import { FormattedMessage, IntlProvider } from 'react-intl'

/**
 * Uses react-intl to show that an npm package which uses React works in a
 * custom field. The provider is this module's own: the client's intl context
 * is not shared.
 */
export function SkillLabel({ level, max }: { level: number; max: number }) {
  return (
    <IntlProvider defaultLocale="en" locale="en">
      <FormattedMessage
        defaultMessage="({level, plural, one {# star} other {# stars}} out of {max})"
        id="customField.skillLevel.summary"
        values={{ level, max }}
      />
    </IntlProvider>
  )
}
