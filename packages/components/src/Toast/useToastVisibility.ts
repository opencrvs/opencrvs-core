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
import { useEffect } from 'react'

type ToastVisibilityProps = {
  duration: number | null
  onClose?: () => void
}

export function useToastVisibility({
  duration,
  onClose
}: ToastVisibilityProps) {
  useEffect(() => {
    if (duration === null) {
      return
    }

    const timer = setTimeout(() => {
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])
}
