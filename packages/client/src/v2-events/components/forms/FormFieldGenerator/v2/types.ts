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

import {
  EventState,
  FieldConfig,
  ValidatorContext,
  FormPageConfig
} from '@opencrvs/commons/client'

export interface FormFieldGeneratorV2Props {
  pages: FormPageConfig[]
  currentPageIndex: number
  fullForm: EventState
  onFormChange: (values: EventState) => void
  readonlyMode?: boolean
  className?: string
  validatorContext: ValidatorContext
  isCorrection?: boolean
  fieldsToShowValidationErrors?: FieldConfig[]
}
