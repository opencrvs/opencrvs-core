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
import { ReactNode, useState } from 'react'

type CloseModal<ResultType> = (result: ResultType) => void

type ModalFactory<ResultType> = (close: CloseModal<ResultType>) => ReactNode

type AnyModalFactory = ModalFactory<unknown>

export function useModal() {
  const [modalState, setModalState] = useState<{
    factory: AnyModalFactory
    close: CloseModal<unknown>
  } | null>(null)

  const modalNode = modalState ? modalState.factory(modalState.close) : null

  async function openModal<ModalResult>(
    modalFactory: ModalFactory<ModalResult>
  ) {
    return new Promise<ModalResult>((resolve) => {
      function close(value: ModalResult) {
        resolve(value)
        setModalState(null)
      }

      setModalState({
        factory: modalFactory as AnyModalFactory,
        close: close as CloseModal<unknown>
      })
    })
  }

  return [modalNode, openModal] as const
}
