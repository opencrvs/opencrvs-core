/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { useMutation } from '@apollo/client'
import { updateOfflineSystems } from '@client/offline/actions'
import { getOfflineData } from '@client/offline/selectors'
import { EMPTY_STRING } from '@client/utils/constants'
import {
  DeactivateSystemMutation,
  DeactivateSystemMutationVariables,
  ReactivateSystemMutation,
  ReactivateSystemMutationVariables,
  RefreshSystemSecretMutation,
  RefreshSystemSecretMutationVariables,
  RegisterSystemMutation,
  RegisterSystemMutationVariables,
  System,
  SystemType,
  UpdatePermissionsMutation,
  UpdatePermissionsMutationVariables,
  WebhookPermission
} from '@client/utils/gateway'

import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as mutations from './mutations'

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
export function useSystemsGlobalState() {
  const { systems: existingSystems } = useSelector(getOfflineData)
  const doesNationalIdAlreadyExist = existingSystems.some(
    (system) => system.type === SystemType.NationalId
  )
  const dispatch = useDispatch()

  const dispatchStatusChange = (updatedSystem: System) => {
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

  return {
    dispatchStatusChange,
    dispatchNewSystem,
    existingSystems,
    doesNationalIdAlreadyExist
  }
}

/** Lists systems, allows creation of new ones and enabling or disabling existing ones. */
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
  const {
    dispatchNewSystem,
    dispatchStatusChange,
    existingSystems,
    doesNationalIdAlreadyExist
  } = useSystemsGlobalState()

  const initWebHook: WebhookPermission = {
    event: EMPTY_STRING,
    permissions: []
  }

  const [birthPermissions, setBirthPermissions] =
    React.useState<WebhookPermission>(initWebHook)

  const [deathPermissions, setDeathPermissions] =
    React.useState<WebhookPermission>(initWebHook)

  const [systemToShowPermission, setSystemToShowPermission] =
    React.useState<System>()

  const [
    activateSystemMutate,
    {
      error: activateSystemError,
      loading: activateSystemLoading,
      data: activateSystemData,
      reset: resetActivateSystemData
    }
  ] = useMutation<ReactivateSystemMutation, ReactivateSystemMutationVariables>(
    mutations.activateSystem,
    {
      onCompleted: ({ reactivateSystem }) => {
        if (reactivateSystem) dispatchStatusChange(reactivateSystem)
        setSystemToToggleActivation(undefined)
      }
    }
  )
  const [
    deactivateSystemMutate,
    {
      error: deactivateSystemError,
      loading: deactivateSystemLoading,
      data: deactivateSystemData,
      reset: resetDeactivateSystemData
    }
  ] = useMutation<DeactivateSystemMutation, DeactivateSystemMutationVariables>(
    mutations.deactivateSystem,
    {
      onCompleted: ({ deactivateSystem }) => {
        if (deactivateSystem) dispatchStatusChange(deactivateSystem)
        setSystemToToggleActivation(undefined)
      }
    }
  )
  const [
    registerSystemMutate,
    {
      data: registerSystemData,
      error: registerSystemError,
      loading: registerSystemLoading,
      reset: resetRegisterSystemData
    }
  ] = useMutation<RegisterSystemMutation, RegisterSystemMutationVariables>(
    mutations.registerSystem,
    {
      onCompleted: ({ registerSystem }) => {
        console.log('registerSystem', registerSystem)
        if (registerSystem) dispatchNewSystem(registerSystem.system)
      }
    }
  )

  const [
    clientRefreshTokenMutate,
    {
      data: refreshTokenData,
      loading: refreshTokenLoading,
      error: refreshTokenError,
      reset: resetRefreshTokenData
    }
  ] = useMutation<
    RefreshSystemSecretMutation,
    RefreshSystemSecretMutationVariables
  >(mutations.refreshClientSecret)

  const clientRefreshToken = (clientId: string | undefined) => {
    if (!clientId) return
    clientRefreshTokenMutate({
      variables: {
        clientId
      }
    })
  }

  const [
    updateWebhookPermissions,
    {
      data: updatePermissionsData,
      loading: updatePermissionsLoading,
      error: updatePermissionsError,
      reset: updatePermissionsReset
    }
  ] = useMutation<
    UpdatePermissionsMutation,
    UpdatePermissionsMutationVariables
  >(mutations.updateSystemPermissions, {
    onCompleted: ({ updatePermissions }) => {
      if (updatePermissions) {
        dispatchStatusChange(updatePermissions)
        setSystemToShowPermission(undefined)
      }
    },
    onError: () => {
      setSystemToShowPermission(undefined)
    }
  })

  const updatePermissions = () => {
    if (!systemToShowPermission) return

    updateWebhookPermissions({
      variables: {
        setting: {
          clientId: systemToShowPermission.clientId,
          webhook: [birthPermissions, deathPermissions]
        }
      }
    })
  }

  const deactivateSystem = () => {
    if (!systemToToggleActivation) return

    deactivateSystemMutate({
      variables: {
        clientId: systemToToggleActivation?.clientId
      }
    })
  }

  const activateSystem = () => {
    if (!systemToToggleActivation) return

    activateSystemMutate({
      variables: {
        clientId: systemToToggleActivation?.clientId
      }
    })
  }

  const registerSystem = () => {
    registerSystemMutate({
      variables: {
        system: {
          type: newSystemType,
          name: newClientName,
          ...(newSystemType === 'WEBHOOK' && {
            settings: {
              dailyQuota: 0,
              webhook: [birthPermissions, deathPermissions]
            }
          })
        }
      }
    })
  }

  const resetData = () => {
    resetActivateSystemData()
    resetDeactivateSystemData()
    resetRegisterSystemData()
    setDeathPermissions(initWebHook)
    setBirthPermissions(initWebHook)
    resetRefreshTokenData()
    updatePermissionsReset()
  }

  const shouldWarnAboutNationalId =
    newSystemType === SystemType.NationalId && doesNationalIdAlreadyExist

  return {
    updatePermissionsData,
    updatePermissionsLoading,
    updatePermissionsError,
    updatePermissions,
    systemToShowPermission,
    setSystemToShowPermission,
    birthPermissions,
    setBirthPermissions,
    deathPermissions,
    setDeathPermissions,
    existingSystems,
    deactivateSystem,
    dispatchStatusChange,
    activateSystem,
    registerSystem,
    registerSystemData,
    deactivateSystemError,
    activateSystemError,
    registerSystemError,
    activateSystemData,
    deactivateSystemData,
    deactivateSystemLoading,
    activateSystemLoading,
    registerSystemLoading,
    systemToToggleActivation,
    setSystemToToggleActivation,
    newClientName,
    setNewClientName,
    newSystemType,
    setNewSystemType,
    onChangeClientName,
    clearNewSystemDraft,
    clientRefreshToken,
    refreshTokenData,
    refreshTokenLoading,
    refreshTokenError,
    resetRefreshTokenData,
    resetData,
    shouldWarnAboutNationalId
  }
}
