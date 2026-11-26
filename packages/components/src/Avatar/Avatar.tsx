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
import styled, { css } from 'styled-components'
import { IFont } from '../fonts'

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  /** The user's full name. Supplies the initials and the accessible name. */
  name?: string
  /** Resolved URL of the user's uploaded photo. */
  src?: string
  size?: AvatarSize
  /** Given a handler, the avatar renders as a button. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

const DIAMETER: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 64,
  xl: 96
}

const INITIALS_FONT: Record<AvatarSize, IFont> = {
  sm: 'bold12',
  md: 'bold16',
  lg: 'h3',
  xl: 'h2'
}

function initialsOf(name: string) {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return ''
  }
  const first = Array.from(parts[0])[0]
  const last = parts.length > 1 ? Array.from(parts[parts.length - 1])[0] : ''
  return `${first}${last}`.toUpperCase()
}

const circle = css<{ $size: AvatarSize }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: ${({ $size }) => DIAMETER[$size]}px;
  height: ${({ $size }) => DIAMETER[$size]}px;
  border-radius: 50%;
  overflow: hidden;
`

const Circle = styled.span<{ $size: AvatarSize }>`
  ${circle}
`

const Photo = styled.img<{ $size: AvatarSize }>`
  ${circle}
  object-fit: cover;
`

const Initials = styled(Circle)`
  ${({ theme, $size }) => theme.fonts[INITIALS_FONT[$size]]}
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  user-select: none;
`

const Placeholder = styled(Circle)`
  background: ${({ theme }) => theme.colors.grey100};
  box-shadow: inset 0 0 0 1px ${({ theme }) => theme.colors.grey200};
  color: ${({ theme }) => theme.colors.grey500};
`

const AvatarButton = styled.button`
  display: inline-flex;
  padding: 0;
  border: none;
  background: none;
  border-radius: 50%;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 0.8;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.yellow};
  }
`

function PlaceholderGlyph() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="65%"
      height="65%"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M16 16.5a5.75 5.75 0 1 0 0-11.5 5.75 5.75 0 0 0 0 11.5Z" />
      <path d="M16 19.25c-5.5 0-9.97 3.6-9.97 8.03 0 .4.32.72.72.72h18.5c.4 0 .72-.32.72-.72 0-4.43-4.47-8.03-9.97-8.03Z" />
    </svg>
  )
}

export function Avatar({
  name,
  src,
  size = 'md',
  onClick,
  ...props
}: AvatarProps) {
  const [photoFailed, setPhotoFailed] = React.useState(false)

  React.useEffect(() => setPhotoFailed(false), [src])

  const interactive = Boolean(onClick)
  // The button carries the name, so the visual must not repeat it.
  const labelling = interactive
    ? ({ 'aria-hidden': true } as const)
    : ({ role: 'img', 'aria-label': name } as const)

  let visual: React.ReactNode

  if (src && !photoFailed) {
    visual = (
      <Photo
        $size={size}
        src={src}
        alt={interactive ? '' : name ?? ''}
        aria-hidden={interactive || undefined}
        onError={() => setPhotoFailed(true)}
      />
    )
  } else if (name && initialsOf(name)) {
    visual = (
      <Initials $size={size} {...labelling}>
        {initialsOf(name)}
      </Initials>
    )
  } else {
    visual = (
      <Placeholder $size={size} data-testid="avatar-placeholder" aria-hidden>
        <PlaceholderGlyph />
      </Placeholder>
    )
  }

  if (!interactive) {
    return (
      <span {...props} style={{ display: 'inline-flex', ...props.style }}>
        {visual}
      </span>
    )
  }

  return (
    <AvatarButton
      {...props}
      type="button"
      onClick={onClick}
      aria-label={name ? `Profile: ${name}` : 'Profile'}
    >
      {visual}
    </AvatarButton>
  )
}
