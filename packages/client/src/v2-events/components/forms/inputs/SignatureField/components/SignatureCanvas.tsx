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

import { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import * as React from 'react'
import styled from 'styled-components'
import SignatureCanvasComponent from 'react-signature-canvas'
import { Button } from '@opencrvs/components/lib/Button'
import { messages } from '@client/i18n/messages/views/review'

/** Based on packages/client/src/components/form/SignatureField/SignatureUploader.tsx */

const SignatureContainer = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.grey600};
  border-radius: 4px;
  width: 100%;
`
const SignatureInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

/**
 * Stateful canvas component for capturing signatures.
 * Based on V1 functionality, it only emits changes, and is not controlled input.
 *
 * @param onChange - Callback function to handle the signature data URL when the "pen is lifted" (onEnd).
 */
export function SignatureCanvas({
  onChange
}: {
  onChange: (dataUrl?: string) => void
}) {
  const [canvasWidth, setCanvasWidth] = useState(300)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<SignatureCanvasComponent>(null)
  const intl = useIntl()

  useEffect(() => {
    function handleResize() {
      if (canvasContainerRef.current) {
        setCanvasWidth(canvasContainerRef.current.offsetWidth)
      }
    }

    window.addEventListener('resize', handleResize)

    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [canvasContainerRef])

  function onEnd() {
    const data = canvasRef.current?.toDataURL()
    if (!data) {
      return
    }

    onChange(data)
  }

  function clear() {
    canvasRef.current?.clear()
    onChange(undefined)
  }

  return (
    <SignatureInputContainer>
      <SignatureContainer ref={canvasContainerRef}>
        <SignatureCanvasComponent
          ref={canvasRef}
          canvasProps={{
            width: canvasWidth,
            height: 200
          }}
          penColor="black"
          onEnd={onEnd}
        />
      </SignatureContainer>
      <Button size="medium" type="tertiary" onClick={clear}>
        {intl.formatMessage(messages.clear)}
      </Button>
    </SignatureInputContainer>
  )
}
