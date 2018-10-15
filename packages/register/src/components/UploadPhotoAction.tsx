import * as React from 'react'
import styled from 'styled-components'

import { IconAction } from '@opencrvs/components/lib/buttons'
import { Camera } from '@opencrvs/components/lib/icons'

import { IActionProps } from '@opencrvs/components/lib/buttons/Action'
import { ActionTitle } from '@opencrvs/components/lib/buttons/IconAction'

export const StyledIcon = styled(Camera)`
  border-radius: 2px;
  box-shadow: 0 0 4px 3px rgba(0, 0, 0, 0.1);
  height: 50px;
  width: 50px;
  background-color: ${({ theme }) => theme.colors.cardGradientEnd};
`

export const PhotoIconAction = styled(IconAction)`
  outline-style: dashed;
  outline-color: ${({ theme }) => theme.colors.cardGradientEnd};
  outline-width: 1px;
  min-height: 90px;

  /* stylelint-disable */
  ${ActionTitle} {
    /* stylelint-enable */
    font-size: 18px;
    margin-left: 75px;
    line-height: 24px;
  }
`

export function UploadPhotoAction({ title, ...props }: IActionProps) {
  return (
    <PhotoIconAction icon={() => <StyledIcon />} title={title} {...props} />
  )
}
