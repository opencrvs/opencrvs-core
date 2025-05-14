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
import { IRegisterFormState } from '@client/forms/register/reducer'
import { IStoreState } from '@opencrvs/client/src/store'
import { Section, IFormSection } from '@client/forms'
import { EventType } from '@client/utils/gateway'

const getPartialState = (state: IStoreState): IRegisterFormState =>
  state.registerForm

function getKey<K extends keyof IRegisterFormState>(
  state: IStoreState,
  key: K
) {
  return getPartialState(state)[key]
}

// Register form needs to be ready before this function is called
export const getRegisterForm = (state: IStoreState) => {
  const form = getKey(state, 'registerForm')
  if (!form) {
    throw new Error(
      'Selector called before data was ready. This should never happen'
    )
  }

  return form
}
export const isRegisterFormReady = (state: IStoreState) => {
  const form = getKey(state, 'registerForm')
  return Boolean(form)
}

export const getEventRegisterForm = (state: IStoreState, event: EventType) => {
  return getRegisterForm(state)[event]
}

const getRegisterFormSection = (
  state: IStoreState,
  key: Section | string,
  event: EventType
): IFormSection => {
  const eventRegisterForm = getEventRegisterForm(state, event)

  const section = eventRegisterForm.sections.find(
    (section: IFormSection) => section.id === key
  )!

  if (!section) {
    throw new Error(
      'Selector called with an unknown section. This should never happen'
    )
  }

  return section
}

export const getBirthSection = (
  state: IStoreState,
  section: Section | string
) => {
  return getRegisterFormSection(state, section, EventType.Birth)
}

export const getDeathSection = (
  state: IStoreState,
  section: Section | string
) => {
  return getRegisterFormSection(state, section, EventType.Death)
}
