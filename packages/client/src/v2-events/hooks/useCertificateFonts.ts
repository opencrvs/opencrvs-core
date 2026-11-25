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

import { useEffect, useState } from 'react'
import { CertificateTemplateConfig } from '@opencrvs/commons/client'
import { useAppConfig } from '@client/v2-events/hooks/useAppConfig'

type CertificateFonts = NonNullable<CertificateTemplateConfig['fonts']>

const FONT_VARIANTS = {
  normal: { weight: 'normal', style: 'normal' },
  bold: { weight: 'bold', style: 'normal' },
  italics: { weight: 'normal', style: 'italic' },
  bolditalics: { weight: 'bold', style: 'italic' }
} satisfies Record<keyof CertificateFonts[string], FontFaceDescriptors>

/** Each font face loads one time, so that the next preview does not wait for the network. */
const fontFaces = new Map<string, Promise<FontFace>>()

async function loadFontFace(
  family: string,
  variant: keyof typeof FONT_VARIANTS,
  url: string
) {
  const key = `${family}|${variant}|${url}`
  const cached = fontFaces.get(key)
  if (cached) {
    return cached
  }

  const fontFace = new FontFace(family, `url("${url}")`, FONT_VARIANTS[variant])
    .load()
    .catch((error) => {
      fontFaces.delete(key)
      throw error
    })
  fontFaces.set(key, fontFace)
  return fontFace
}

async function loadCertificateFonts(fonts: CertificateFonts | undefined) {
  const promises = Object.entries(fonts ?? {}).flatMap(([family, variants]) =>
    Object.entries(variants).map(async ([variant, url]) =>
      loadFontFace(family, variant as keyof typeof FONT_VARIANTS, url)
    )
  )

  return Promise.allSettled(promises)
}

/**
 * Loads the fonts of a certificate template while the user fills the print form, so that the
 * review page does not need to wait for them. The fonts are not added to the document.
 */
export function usePreloadCertificateFonts(templateId: string) {
  const { certificateTemplates } = useAppConfig()
  const fonts = certificateTemplates.find(
    (template) => template.id === templateId
  )?.fonts

  useEffect(() => {
    void loadCertificateFonts(fonts)
  }, [fonts])
}

/**
 * Loads the fonts of a certificate and adds them to the document while the component is mounted.
 * Show the certificate only after this returns `true`. Otherwise the browser shows the text in a
 * fallback font until the fonts load.
 *
 * @returns `true` when all fonts are loaded or failed to load.
 */
export function useCertificateFonts(fonts: CertificateFonts | undefined) {
  const [loadedFonts, setLoadedFonts] = useState<
    CertificateFonts | undefined | null
  >(null)

  useEffect(() => {
    let isUnmounted = false
    let fontFacesInDocument: FontFace[] = []

    void loadCertificateFonts(fonts).then((results) => {
      if (isUnmounted) {
        return
      }

      fontFacesInDocument = results.flatMap((result) =>
        result.status === 'fulfilled' ? [result.value] : []
      )

      fontFacesInDocument.forEach((fontFace) => document.fonts.add(fontFace))
      setLoadedFonts(fonts)
    })

    return () => {
      isUnmounted = true
      fontFacesInDocument.forEach((fontFace) => document.fonts.delete(fontFace))
    }
  }, [fonts])

  return loadedFonts === fonts
}
