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
import React, { useState, useEffect } from 'react'

interface IProps {
  onUnmount: (duration: number) => void // in milliseconds
  children?: React.ReactNode
}

export function TimeMounted(props: IProps) {
  const [startTime] = useState(new Date())
  const { onUnmount } = props

  useEffect(() => {
    return () => onUnmount(new Date().getTime() - startTime.getTime())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime])

  return <>{props.children}</>
}
