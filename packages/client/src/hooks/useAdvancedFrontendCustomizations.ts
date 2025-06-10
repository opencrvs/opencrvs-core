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
import { selectAdvancedFrontendCustomizations } from '@client/offline/selectors'
import { IScriptTag, IStyleTag } from '@client/utils/referenceApi'
import * as React from 'react'
import { useSelector } from 'react-redux'

const setAttributesForScriptTag = (scriptElement: HTMLScriptElement, scriptTag?: IScriptTag) => {
  if (scriptTag?.options) {
    const { async, defer, nomodule, onload, onerror, crossorigin, integrity } = scriptTag.options
    if (async) scriptElement.async = true
    if (defer) scriptElement.defer = true
    if (nomodule) scriptElement.setAttribute('nomodule', '')
    if (crossorigin) scriptElement.setAttribute('crossorigin', crossorigin)
    if (integrity) scriptElement.setAttribute('integrity', integrity)
    if (onload) scriptElement.onload = onload
    if (onerror) scriptElement.onerror = onerror
  }
  scriptElement.setAttribute('data-custom', 'true')
}

const setAttributesForStyleTag = (styleElement: HTMLLinkElement, styleTag?: IStyleTag) => {
  if (styleTag?.options) {
    const { media, crossorigin, integrity, title, disabled, type } = styleTag.options

    if (media) styleElement.media = media
    if (crossorigin) styleElement.setAttribute('crossorigin', crossorigin)
    if (integrity) styleElement.setAttribute('integrity', integrity)
    if (title) styleElement.title = title
    if (disabled) styleElement.disabled = disabled
    if (type) styleElement.type = type
  }

  styleElement.setAttribute('data-custom', 'true')
}

export function useAdvancedFrontendCustomizations() {
  const customizations = useSelector(selectAdvancedFrontendCustomizations)
  React.useEffect(() => {
    if (customizations) {
      if (customizations.customFiles) {
        // Handle custom script and CSS files from country config

        fetch(new URL('/custom-files', window.config.COUNTRY_CONFIG_URL).toString())
          .then((response) => response.json())
          .then((data) => {
            // Handle custom JS files
            if (data.scripts && data.scripts.length > 0) {
              data.scripts.forEach((scriptTag: IScriptTag) => {
                if (scriptTag.activateOn.includes('client')) {
                  const url = new URL(scriptTag.url, window.config.COUNTRY_CONFIG_URL).toString();
                  if (!document.querySelector(`script[src="${url}"]`) && scriptTag.activateOn.includes('client')) {
                    const scriptElement = document.createElement('script')
                    scriptElement.src = url
                    scriptElement.type = 'text/javascript'

                    setAttributesForScriptTag(scriptElement, scriptTag)
                    document.head.appendChild(scriptElement)
                  }
                }
              })
            }

            // Handle custom CSS files
            if (data.styles && data.styles.length > 0) {
              data.styles.forEach((styleTag: IStyleTag) => {
                if (styleTag.activateOn.includes('client')) {
                  const url = new URL(styleTag.url, window.config.COUNTRY_CONFIG_URL).toString();

                  if (!document.querySelector(`link[href="${url}"]`)) {
                    const linkElement = document.createElement('link')
                    linkElement.rel = 'stylesheet'
                    linkElement.href = url

                    setAttributesForStyleTag(linkElement, styleTag)
                    document.head.appendChild(linkElement)
                  }
                }
              })
            }
          })
          .catch((error) => {
            console.error('Failed to load custom files:', error)
          })
      }

      // Handle external scripts insertion
      if (customizations.externalScripts?.length) {
        // Insert into head
        customizations.externalScripts.forEach((scriptConfig) => {
          // Check if script should be activated on client
          if (scriptConfig.activateOn.includes('client')) {
            const scriptElement = document.createElement('script')
            scriptElement.src = scriptConfig.url

            setAttributesForScriptTag(scriptElement, scriptConfig)
            document.head.appendChild(scriptElement)
          }
        })
      }

      // Handle external styles insertion
      if (customizations.externalStyles?.length) {
        // Insert into head
        customizations.externalStyles.forEach((styleConfig) => {
          // Check if style should be activated on client
          if (styleConfig.activateOn.includes('client')) {
            const linkElement = document.createElement('link')
            linkElement.rel = 'stylesheet'
            linkElement.href = styleConfig.url

            setAttributesForStyleTag(linkElement, styleConfig)
            document.head.appendChild(linkElement)
          }
        })
      }
    }

    // Cleanup function to remove added elements when component unmounts
    return () => {
      const customScripts = document.querySelectorAll('script[data-custom="true"]')
      const customStyles = document.querySelectorAll('style[data-custom="true"], link[data-custom="true"]')

      customScripts.forEach(script => script.remove())
      customStyles.forEach(style => style.remove())
    }
  }, [customizations])
}