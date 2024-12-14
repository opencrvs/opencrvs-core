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

import React, { useEffect } from 'react'
import { defineMessages } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { Preview } from '@client/v2-events/features/events/components/Preview'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'

import { getCurrentEventState } from '@opencrvs/commons/client'

const messages = defineMessages({
  registerActionTitle: {
    id: 'registerAction.title',
    defaultMessage: 'Register member',
    description: 'The title for register action'
  },
  registerActionDescription: {
    id: 'registerAction.description',
    defaultMessage:
      'By clicking register, you confirm that the information entered is correct and the member can be registered.',
    description: 'The description for register action'
  },
  registerActionDeclare: {
    id: 'registerAction.Declare',
    defaultMessage: 'Register',
    description: 'The label for declare button of register action'
  }
})

/**
 *
 * Preview of event to be registered.
 */
export const RegisterIndex = () => {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.REGISTER)
  const events = useEvents()
  const [modal, openModal] = useModal()
  const navigate = useNavigate()
  const { goToHome } = useEventFormNavigation()
  const registerMutation = events.actions.register()

  const [event] = events.getEvent(eventId)

  const { eventConfiguration: config } = useEventConfiguration(event.type)

  if (!config) {
    throw new Error('Event configuration not found with type: ' + event.type)
  }

  const { forms: formConfigs } = config.actions.filter(
    (action) => action.type === 'REGISTER'
  )[0]

  const setFormValues = useEventFormData((state) => state.setFormValues)
  const getFormValues = useEventFormData((state) => state.getFormValues)

  useEffect(() => {
    setFormValues(eventId, getCurrentEventState(event).data)
  }, [event, eventId, setFormValues])

  const form = getFormValues(eventId)

  const handleEdit = async ({
    pageId,
    fieldId
  }: {
    pageId: string
    fieldId?: string
  }) => {
    const confirmedEdit = await openModal<boolean | null>((close) => (
      <Preview.EditModal close={close} />
    ))

    if (confirmedEdit) {
      navigate(
        ROUTES.V2.EVENTS.DECLARE.PAGE.buildPath(
          { pageId, eventId },
          {
            from: 'register'
          },
          fieldId
        )
      )
    }
    return
  }

  const handleRegistration = async () => {
    const confirmedRegistration = await openModal<boolean | null>((close) => (
      <Preview.ActionModal close={close} action="Register" />
    ))
    if (confirmedRegistration) {
      registerMutation.mutate({
        eventId: event.id,
        data: form,
        transactionId: uuid()
      })

      goToHome()
    }
  }

  return (
    <Preview.Body
      title=""
      formConfig={formConfigs[0]}
      eventConfig={config}
      onEdit={handleEdit}
      form={form}
    >
      <Preview.Actions
        onConfirm={handleRegistration}
        messages={{
          title: messages.registerActionTitle,
          description: messages.registerActionDescription,
          onConfirm: messages.registerActionDeclare
        }}
      />
      {modal}
    </Preview.Body>
  )
}
