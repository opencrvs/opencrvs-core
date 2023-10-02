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

export function useModal() {
  const [modalNode, setModalNode] = useState<ReactNode>(null)

  function openModal<ModalResult>(modalFactory: ModalFactory<ModalResult>) {
    return new Promise<ModalResult>((resolve) => {
      function close(value: ModalResult) {
        resolve(value)
        setModalNode(null)
      }

      setModalNode(modalFactory(close))
    })
  }

  return [modalNode, openModal] as const
}
