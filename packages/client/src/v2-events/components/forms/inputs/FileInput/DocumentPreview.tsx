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

import * as React from 'react'
import styled from 'styled-components'
import {
  FileFieldValue,
  FileFieldValueWithOption
} from '@opencrvs/commons/client'
import { ImagePreview } from './ImagePreview'
import { PdfPreview } from './PdfPreview'

const ViewerWrapper = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 4;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.white};
`

const ViewerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  & img {
    max-height: 80vh;
    max-width: 80vw;
    width: auto;
  }
`

interface IProps {
  previewImage:
    | NonNullable<FileFieldValue>
    | NonNullable<FileFieldValueWithOption>
  disableDelete?: boolean
  title?: string
  goBack: () => void
  onDelete: (image: FileFieldValue) => void
  id?: string
}

export function DocumentPreview({
  previewImage,
  title,
  goBack,
  onDelete,
  disableDelete,
  id
}: IProps) {
  if (previewImage.type.startsWith('image/')) {
    return (
      <ImagePreview
        disableDelete={disableDelete}
        goBack={goBack}
        id={id}
        previewImage={previewImage}
        title={title}
        onDelete={onDelete}
      />
    )
  }
  if (previewImage.type.startsWith('application/pdf')) {
    return (
      <PdfPreview
        disableDelete={disableDelete}
        goBack={goBack}
        id={id}
        previewImage={previewImage}
        title={title}
        onDelete={onDelete}
      />
    )
  }
  return null
}
