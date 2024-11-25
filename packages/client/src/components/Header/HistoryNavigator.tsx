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
import React from 'react'
import { Button } from '@opencrvs/components/lib/Button'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { goBack, goForward } from '@client/navigation'
import { Icon } from '@opencrvs/components/lib/Icon'
import { useHomePage } from '@client/hooks/useHomePage'

export function HistoryNavigator({
  hideForward = false
}: {
  hideForward?: boolean
}) {
  const history = useHistory()
  const dispatch = useDispatch()
  const { isCurrentPageHome } = useHomePage()

  return (
    <div>
      <Button
        id="header-go-back-button"
        type="icon"
        size="medium"
        disabled={
          (history.action === 'POP' || history.action === 'REPLACE') &&
          isCurrentPageHome
        }
        onClick={() => dispatch(goBack())}
      >
        <Icon name="ArrowLeft" />
      </Button>
      {!hideForward && (
        <Button
          type="icon"
          size="medium"
          disabled={history.action === 'PUSH' || history.action === 'REPLACE'}
          onClick={() => dispatch(goForward())}
        >
          <Icon name="ArrowRight" />
        </Button>
      )}
    </div>
  )
}
