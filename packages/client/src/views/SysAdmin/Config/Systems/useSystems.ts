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
import { updateOfflineSystems } from '@client/offline/actions'
import { getOfflineData } from '@client/offline/selectors'
import { EMPTY_STRING } from '@client/utils/constants'
import {
  EventType,
  System,
  SystemType,
  WebhookPermission
} from '@client/utils/gateway'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

/** Handles the user input when creating a new system in a modal */
function useNewSystemDraft() {
  const [newClientName, setNewClientName] = useState(EMPTY_STRING)
  const [newSystemType, setNewSystemType] = useState<SystemType>(
    SystemType.Health
  )

  const onChangeClientName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = String(event.target.value)
    setNewClientName(value)
  }

  const clearNewSystemDraft = () => {
    setNewClientName(EMPTY_STRING)
    setNewSystemType(SystemType.Health)
  }

  return {
    newClientName,
    setNewClientName,
    newSystemType,
    setNewSystemType,
    onChangeClientName,
    clearNewSystemDraft
  }
}

/** Handles communication with global state management */
function useSystemsGlobalState() {
  const { systems: existingSystems } = useSelector(getOfflineData)
  const dispatch = useDispatch()

  const dispatchSystemUpdate = (updatedSystem: System) => {
    const systems = existingSystems.map((system) => {
      if (system.clientId === updatedSystem.clientId) {
        return updatedSystem
      } else {
        return system
      }
    })
    dispatch(updateOfflineSystems({ systems }))
  }

  const dispatchNewSystem = (newSystem: System) => {
    dispatch(updateOfflineSystems({ systems: [...existingSystems, newSystem] }))
  }

  const dispatchSystemRemove = (system: System) => {
    const systems = existingSystems.filter(
      (ite) => ite.clientId !== system.clientId
    )
    dispatch(updateOfflineSystems({ systems }))
  }

  return {
    dispatchSystemUpdate,
    dispatchNewSystem,
    existingSystems,
    dispatchSystemRemove
  }
}

function initWebHook(event: string) {
  return {
    event: event,
    permissions: []
  }
}

export function useSystems() {
  const [systemToToggleActivation, setSystemToToggleActivation] =
    useState<System>()
  const {
    newClientName,
    setNewClientName,
    newSystemType,
    setNewSystemType,
    onChangeClientName,
    clearNewSystemDraft
  } = useNewSystemDraft()
  const { dispatchSystemUpdate, existingSystems } = useSystemsGlobalState()

  const [birthPermissions, setBirthPermissions] = useState<WebhookPermission>(
    initWebHook(EventType.Birth)
  )

  const [deathPermissions, setDeathPermissions] = useState<WebhookPermission>(
    initWebHook(EventType.Death)
  )

  const [systemToShowPermission, setSystemToShowPermission] = useState<System>()

  const [systemToDelete, setSystemToDelete] = useState<System>()

  const clientRefreshToken = (clientId: string | undefined) => {
    if (!clientId) return
  }

  const updatePermissions = () => {
    if (!systemToShowPermission) return
  }

  const deactivateSystem = () => {
    if (!systemToToggleActivation) return

    throw new Error('Deactivate system mutation not yet implemented')
  }

  const activateSystem = () => {
    if (!systemToToggleActivation) return

    throw new Error('Reactivate system mutation not yet implemented')
  }

  const registerSystem = () => {
    throw new Error('Register system mutation not yet implemented')
  }

  const deleteSystem = () => {
    if (!systemToDelete) return
  }
  const resetData = () => {
    setDeathPermissions(initWebHook(EventType.Death))
    setBirthPermissions(initWebHook(EventType.Birth))
  }

  const closePermissionModal = () => {
    setSystemToShowPermission(undefined)
    setDeathPermissions(initWebHook(EventType.Death))
    setBirthPermissions(initWebHook(EventType.Birth))
  }

  return {
    closePermissionModal,
    deleteSystem,
    systemToDelete,
    setSystemToDelete,
    updatePermissions,
    systemToShowPermission,
    setSystemToShowPermission,
    birthPermissions,
    setBirthPermissions,
    deathPermissions,
    setDeathPermissions,
    existingSystems,
    deactivateSystem,
    dispatchSystemUpdate,
    activateSystem,
    registerSystem,
    systemToToggleActivation,
    setSystemToToggleActivation,
    newClientName,
    setNewClientName,
    newSystemType,
    setNewSystemType,
    onChangeClientName,
    clearNewSystemDraft,
    clientRefreshToken,
    resetData
  }
}
