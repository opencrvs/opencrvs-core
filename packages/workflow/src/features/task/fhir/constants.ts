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
import { OPENCRVS_SPECIFICATION_URL } from '@workflow/features/registration/fhir/constants'

export const REINSTATED_EXTENSION_URL =
  `${OPENCRVS_SPECIFICATION_URL}extension/regReinstated` as const
export const DOWNLOADED_EXTENSION_URL =
  `${OPENCRVS_SPECIFICATION_URL}extension/regDownloaded` as const
export const ASSIGNED_EXTENSION_URL =
  `${OPENCRVS_SPECIFICATION_URL}extension/regAssigned` as const
export const VERIFIED_EXTENSION_URL =
  `${OPENCRVS_SPECIFICATION_URL}extension/regVerified` as const
export const UNASSIGNED_EXTENSION_URL =
  `${OPENCRVS_SPECIFICATION_URL}extension/regUnassigned` as const
export const MAKE_CORRECTION_EXTENSION_URL =
  `${OPENCRVS_SPECIFICATION_URL}extension/makeCorrection` as const
export const VIEWED_EXTENSION_URL =
  `${OPENCRVS_SPECIFICATION_URL}extension/regViewed` as const
export const MARKED_AS_NOT_DUPLICATE =
  `${OPENCRVS_SPECIFICATION_URL}extension/markedAsNotDuplicate` as const
export const MARKED_AS_DUPLICATE =
  `${OPENCRVS_SPECIFICATION_URL}extension/markedAsDuplicate` as const
