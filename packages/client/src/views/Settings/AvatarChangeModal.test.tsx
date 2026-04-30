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
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { ThemeProvider } from 'styled-components'
import { getTheme } from '@opencrvs/components/lib/theme'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mutate: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let uploadFileAsync: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cacheFile: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let getCroppedImage: any

vi.mock('@client/v2-events/hooks/useUsers', () => ({
  useUsers: () => ({
    changeAvatar: {
      mutate: (...args: unknown[]) => mutate(...args)
    }
  })
}))

vi.mock('@client/v2-events/features/files/useFileUpload', () => ({
  useFileUpload: () => ({
    uploadFileAsync: (...args: unknown[]) => uploadFileAsync(...args)
  })
}))

vi.mock('@client/v2-events/cache', () => ({
  cacheFile: (args: unknown) => cacheFile(args)
}))

vi.mock('@client/utils/imageUtils', async () => {
  const actual = await vi.importActual<
    typeof import('@client/utils/imageUtils')
  >('@client/utils/imageUtils')
  return {
    ...actual,
    getCroppedImage: (...args: unknown[]) => getCroppedImage(...args)
  }
})

vi.mock('@client/utils', async () => {
  const actual =
    await vi.importActual<typeof import('@client/utils')>('@client/utils')
  return {
    ...actual,
    useOnlineStatus: () => true
  }
})

vi.mock('react-easy-crop', () => ({
  default: () => <div data-testid="cropper" />
}))

async function renderModal(onAvatarChanged = vi.fn()) {
  const { AvatarChangeModal } = await import('./AvatarChangeModal')
  const store = configureStore({
    reducer: () => ({
      profile: { userDetails: { id: 'user-123' } }
    })
  })
  return render(
    <Provider store={store}>
      <IntlProvider locale="en" messages={{}}>
        <ThemeProvider theme={getTheme()}>
          <AvatarChangeModal
            cancelAvatarChangeModal={vi.fn()}
            showChangeAvatar={true}
            imgSrc={{ type: 'image/png', data: 'data:image/png;base64,xxx' }}
            onImgSrcChanged={vi.fn()}
            error={''}
            onErrorChanged={vi.fn()}
            onConfirmAvatarChange={vi.fn()}
            onAvatarChanged={onAvatarChanged}
          />
        </ThemeProvider>
      </IntlProvider>
    </Provider>
  )
}

describe('AvatarChangeModal', () => {
  beforeEach(() => {
    vi.resetModules()
    mutate = vi.fn()
    uploadFileAsync = vi.fn()
    cacheFile = vi.fn()
    getCroppedImage = vi.fn()
  })

  it('uploads cropped image then calls changeAvatar mutation with MinIO path string', async () => {
    const cropped = { type: 'image/png', data: 'data:image/png;base64,yyy' }
    getCroppedImage.mockResolvedValue(cropped)
    uploadFileAsync.mockResolvedValue({ url: '/users/user-123/avatar.png' })

    await renderModal()

    fireEvent.click(screen.getByText('Apply'))

    await waitFor(() => {
      expect(uploadFileAsync).toHaveBeenCalledWith(cropped, 'user-123')
    })
    expect(mutate).toHaveBeenCalledWith(
      {
        userId: 'user-123',
        avatar: '/users/user-123/avatar.png'
      },
      expect.any(Object)
    )
  })

  it('caches file and notifies parent on mutation success', async () => {
    const cropped = { type: 'image/png', data: 'data:image/png;base64,yyy' }
    const url = '/users/user-123/avatar.png'
    getCroppedImage.mockResolvedValue(cropped)
    uploadFileAsync.mockResolvedValue({ url })

    const onAvatarChanged = vi.fn()
    await renderModal(onAvatarChanged)

    fireEvent.click(screen.getByText('Apply'))

    await waitFor(() => expect(mutate).toHaveBeenCalled())
    const [, options] = mutate.mock.calls[0]
    options.onSuccess({})

    expect(cacheFile).toHaveBeenCalledWith({ url, file: cropped })
    expect(onAvatarChanged).toHaveBeenCalledWith(url)
  })

  it('does not call mutation when crop fails', async () => {
    getCroppedImage.mockResolvedValue(null)

    await renderModal()

    fireEvent.click(screen.getByText('Apply'))

    await waitFor(() => expect(getCroppedImage).toHaveBeenCalled())
    expect(uploadFileAsync).not.toHaveBeenCalled()
    expect(mutate).not.toHaveBeenCalled()
  })
})
