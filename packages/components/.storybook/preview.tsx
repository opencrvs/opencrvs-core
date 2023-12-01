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
import { DocsContainer } from '@storybook/addon-docs'
import { ThemeProvider, createGlobalStyle } from 'styled-components'
import WebFont from 'webfontloader'
import type { Preview } from '@storybook/react'
import { getTheme } from '@opencrvs/components/lib/theme'

const theme = getTheme()

WebFont.load({
  google: {
    families: ['Noto+Sans:600', 'Noto+Sans:400']
  }
})
const FontStyle = createGlobalStyle`
.sbdocs:not(.docs-story) * {
  font-family: ${theme.fontFamily} !important;
}
`
const preview: Preview = {
  decorators: [
    (Story, context) => (
      <ThemeProvider theme={theme}>
        {
          // Allows adding { parameters: { storyCss: { ... } }} inside stories
          context?.parameters?.storyCss ? (
            <div style={context?.parameters?.storyCss}>
              <Story />
            </div>
          ) : (
            <Story />
          )
        }
      </ThemeProvider>
    )
  ],
  parameters: {
    viewMode: 'docs',
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    docs: {
      container: ({ children, context }) => (
        <DocsContainer context={context}>
          <ThemeProvider theme={theme}>
            <FontStyle />
            {
              // Allows adding { parameters: { docsCss: { ... } }} inside stories
              context?.attachedCSFFile?.meta?.parameters?.docsCss ? (
                <div style={context.attachedCSFFile.meta.parameters.docsCss}>
                  {children}
                </div>
              ) : (
                children
              )
            }
          </ThemeProvider>
        </DocsContainer>
      )
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Styles',
          'Typography',
          'Layout',
          'Controls',
          'Input',
          'Data'
        ]
      }
    },
    a11y: {
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag21a', 'wcag2aa', 'best-practice']
        }
      }
    }
  }
}

export default preview
