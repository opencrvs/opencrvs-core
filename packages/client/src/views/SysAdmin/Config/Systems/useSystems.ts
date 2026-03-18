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
import { EMPTY_STRING } from '@client/utils/constants'
import {
  System,
  SystemStatus,
  SystemType
} from '@client/utils/gateway'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'
import { useMutation, useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { UUID } from '@opencrvs/commons/client'

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

function scopesToSystemType(scopes: string[]): SystemType {
  if (scopes.includes('notification-api')) return SystemType.Health
  if (scopes.includes('recordsearch')) return SystemType.RecordSearch
  if (scopes.includes('webhook')) return SystemType.Webhook
  if (scopes.includes('nationalId')) return SystemType.NationalId
  return SystemType.Custom
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

  const listQuery = useQuery(
    trpcOptionsProxy.integrations.list.queryOptions()
  )

  const existingSystems: System[] = (listQuery.data ?? []).map((item) => ({
    _id: item.id,
    clientId: item.id,
    name: item.name,
    status: item.status === 'active' ? SystemStatus.Active : SystemStatus.Deactivated,
    type: scopesToSystemType(item.scopes),
    shaSecret: ''
  }))

  const invalidateList = () => {
    void queryClient.invalidateQueries({
      queryKey: trpcOptionsProxy.integrations.list.queryKey()
    })
  }

  const [systemToShowPermission, setSystemToShowPermission] = useState<System>()

  const [systemToDelete, setSystemToDelete] = useState<System>()

  const refreshTokenMutation = useMutation(
    trpcOptionsProxy.integrations.refreshToken.mutationOptions()
  )

  const deactivateMutation = useMutation(
    trpcOptionsProxy.integrations.deactivate.mutationOptions()
  )

  const activateMutation = useMutation(
    trpcOptionsProxy.integrations.activate.mutationOptions()
  )

  const deleteMutation = useMutation(
    trpcOptionsProxy.integrations.delete.mutationOptions()
  )

  const createMutation = useMutation(
    trpcOptionsProxy.integrations.create.mutationOptions()
  )

  const clientRefreshToken = (clientId: string | undefined) => {
    if (!clientId) return
    refreshTokenMutation.mutate({ clientId: clientId as UUID })
  }

  const updatePermissions = () => {
    if (!systemToShowPermission) return
  }

  const deactivateSystem = () => {
    if (!systemToToggleActivation) return
    deactivateMutation.mutate(
      { clientId: systemToToggleActivation.clientId as UUID },
      {
        onSuccess: () => {
          invalidateList()
          setSystemToToggleActivation(undefined)
        }
      }
    )
  }

  const activateSystem = () => {
    if (!systemToToggleActivation) return
    activateMutation.mutate(
      { clientId: systemToToggleActivation.clientId as UUID },
      {
        onSuccess: () => {
          invalidateList()
          setSystemToToggleActivation(undefined)
        }
      }
    )
  }

  const registerSystem = () => {
    const scopesByType: Record<string, string[]> = {
      [SystemType.Health]: ['notification-api'],
      [SystemType.RecordSearch]: ['recordsearch']
    }

    const scopes = scopesByType[newSystemType] ?? []

    createMutation.mutate(
      { name: newClientName, scopes },
      {
        onSuccess: () => {
          invalidateList()
        }
      }
    )
  }

  const deleteSystem = () => {
    if (!systemToDelete) return
    deleteMutation.mutate(
      { clientId: systemToDelete.clientId as UUID },
      {
        onSuccess: () => {
          invalidateList()
          setSystemToDelete(undefined)
        }
      }
    )
  }

  const resetData = () => {
    refreshTokenMutation.reset()
    deactivateMutation.reset()
    activateMutation.reset()
    deleteMutation.reset()
    createMutation.reset()
  }

  const closePermissionModal = () => {
    setSystemToShowPermission(undefined)
  }

  return {
    closePermissionModal,
    deleteSystem,
    systemToDelete,
    setSystemToDelete,
    updatePermissions,
    systemToShowPermission,
    setSystemToShowPermission,
    existingSystems,
    deactivateSystem,
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
    resetData,
    // Loading states
    deactivateSystemLoading: deactivateMutation.isPending,
    activateSystemLoading: activateMutation.isPending,
    refreshTokenLoading: refreshTokenMutation.isPending,
    systemToDeleteLoading: deleteMutation.isPending,
    // Data states
    deactivateSystemData: deactivateMutation.data,
    activateSystemData: activateMutation.data,
    refreshTokenData: refreshTokenMutation.data
      ? { refreshSystemSecret: { clientSecret: refreshTokenMutation.data.clientSecret } }
      : undefined,
    systemToDeleteData: deleteMutation.data,
    // Error states
    deactivateSystemError: deactivateMutation.error,
    activateSystemError: activateMutation.error,
    refreshTokenError: refreshTokenMutation.error,
    systemToDeleteError: deleteMutation.error,
    registerSystemData: createMutation.data
      ? {
          registerSystem: {
            system: {
              clientId: createMutation.data.clientId,
              shaSecret: createMutation.data.shaSecret,
              name: newClientName
            },
            clientSecret: createMutation.data.clientSecret
          }
        }
      : undefined,
    registerSystemLoading: createMutation.isPending,
    registerSystemError: createMutation.error
  }
}
