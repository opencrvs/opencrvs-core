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

import { Text as TextComponent } from '@opencrvs/components'
import { ParagraphConfiguration } from '@opencrvs/commons/client'

function ParagraphInput({
  configuration,
  message
}: {
  message: string
  configuration: ParagraphConfiguration
}) {
  const fontVariant = configuration.styles?.fontVariant
  const hint = configuration.styles?.hint

  return (
    <TextComponent
      color={hint ? 'grey500' : 'copy'}
      element="p"
      variant={fontVariant ?? 'reg16'}
    >
      <span dangerouslySetInnerHTML={{ __html: message }} />
    </TextComponent>
  )
}

export const Paragraph = {
  Input: ParagraphInput,
  Output: null
}
