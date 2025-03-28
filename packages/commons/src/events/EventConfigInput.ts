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
import { z } from 'zod'
import { EventConfig } from './EventConfig'
import { PageConfig, PageConfigInput } from './PageConfig'
import {
  ActionFormConfig,
  ActionFormConfigInput,
  DeclarationFormConfig,
  DeclarationFormConfigInput
} from './FormConfig'
export type EventConfigInput = z.input<typeof EventConfig>

export const defineDeclaration = (
  form: DeclarationFormConfigInput
): DeclarationFormConfig => DeclarationFormConfig.parse(form)

export const defineActionForm = (
  actionForm: ActionFormConfigInput
): ActionFormConfig => ActionFormConfig.parse(actionForm)

export const definePage = (formPage: PageConfigInput): PageConfig =>
  PageConfig.parse(formPage)
