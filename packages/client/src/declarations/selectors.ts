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
import { IDeclaration, IDeclarationsState } from '@client/declarations/index'
import { IStoreState } from '@client/store'
import { useSelector } from 'react-redux'

export const getDraftsState = (store: IStoreState): IDeclarationsState =>
  store.declarationsState

function getKey<K extends keyof IDeclarationsState>(
  store: IStoreState,
  key: K
) {
  return getDraftsState(store)[key]
}

export const getInitialDeclarationsLoaded = (
  store: IStoreState
): IDeclarationsState['initialDeclarationsLoaded'] =>
  getKey(store, 'initialDeclarationsLoaded')

export const selectDeclaration =
  <T extends IDeclaration | undefined>(declarationId: string) =>
  (store: IStoreState) =>
    getKey(store, 'declarations').find(({ id }) => declarationId === id) as T

export const useDeclaration = <T extends IDeclaration>(
  declarationId: string
) => {
  return useSelector(selectDeclaration<T>(declarationId))
}
