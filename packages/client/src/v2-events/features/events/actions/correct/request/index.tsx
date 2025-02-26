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

import { withSuspense } from '@client/v2-events/components/withSuspense'
import { Pages } from './Pages'
import { Review } from './Review'
import { Onboarding } from './Onboarding/Onboarding'
import { Summary } from './Summary/Summary'
import { AdditionalDetails } from './AdditionalDetails/AdditionalDetails'

const PagesIndex = withSuspense(Pages)
const OnboardingIndex = withSuspense(Onboarding)
const SummaryIndex = withSuspense(Summary)
const ReviewIndex = withSuspense(Review)
const AdditionalDetailsIndex = withSuspense(AdditionalDetails)

export {
  PagesIndex as Pages,
  ReviewIndex as Review,
  OnboardingIndex as Onboarding,
  SummaryIndex as Summary,
  AdditionalDetailsIndex as AdditionalDetails
}
