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

import { useIntl } from 'react-intl'
import {
  EventConfig,
  Flag,
  ActionFlag,
  InherentFlags,
  TranslationConfig
} from '@opencrvs/commons/client'

const flagMessages = {
  [InherentFlags.CORRECTION_REQUESTED]: {
    id: 'flags.builtin.correction-requested.label',
    defaultMessage: 'Correction requested',
    description: 'Flag label for correction requested'
  },
  [InherentFlags.POTENTIAL_DUPLICATE]: {
    id: 'flags.builtin.potential-duplicate.label',
    defaultMessage: 'Potential duplicate',
    description: 'Flag label for potential duplicate'
  },
  [InherentFlags.REJECTED]: {
    id: 'flags.builtin.rejected.label',
    defaultMessage: 'Rejected',
    description: 'Flag label for rejected'
  },
  [InherentFlags.INCOMPLETE]: {
    id: 'flags.builtin.incomplete.label',
    defaultMessage: 'Incomplete',
    description: 'Flag label for incomplete'
  },
  [InherentFlags.PENDING_CERTIFICATION]: {
    id: 'flags.builtin.pending-certification.label',
    defaultMessage: 'Pending certification',
    description: 'Flag label for pending certification'
  }
} satisfies Record<InherentFlags, TranslationConfig>

/**
 * React hook that resolves and formats human-readable labels for event flags.
 *
 * @param {EventConfig} eventConfiguration - The configuration for the event, used to look up custom flag labels.
 * @param {Flag[]} flags - The array of flag identifiers to resolve.
 * @returns {string} - A human-readable, comma-separated string of flag labels.
 */
export function useFlagLabelsString(
  eventConfiguration: EventConfig,
  flags: Flag[]
): string {
  const intl = useIntl()
  return flags
    .filter((flag) => !ActionFlag.safeParse(flag).success)
    .filter((flag) => flag !== InherentFlags.INCOMPLETE)
    .map((flag) => {
      if (flag in flagMessages) {
        return intl.formatMessage(flagMessages[flag as InherentFlags])
      }

      const flagConfig = eventConfiguration.flags.find(({ id }) => id === flag)
      if (flagConfig) {
        return intl.formatMessage(flagConfig.label)
      }

      return flag
    })
    .join(', ')
}
