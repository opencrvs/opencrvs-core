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

import { primitives as p } from './primitives'

/**
 * Semantic tokens — intent-based colour names that reference primitives,
 * transcribed from the Figma v4 Design System "Semantic" collection:
 * https://www.figma.com/design/fi2i59UhtoxW0crnknz6wv/v4---OpenCRVS-Design-System?node-id=53-308
 *
 * Every token is defined once for light (`lightColors`) and once for dark
 * (`darkColors`); both satisfy `SemanticColors` so the two themes cannot drift
 * out of sync. Components should reference these tokens rather than primitives
 * or raw hex.
 *
 * The `→ primitive` in each trailing comment records the Figma light/dark
 * mapping so drift between code and design is easy to spot.
 */

/** Turn a primitive hex into an rgba() string — used only for `overlay/*`,
 *  which Figma defines as a grey/black primitive applied at a fixed alpha. */
const alpha = (hex: string, a: number) => {
  const value = parseInt(hex.slice(1), 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export type SemanticColors = {
  'action/primary': string
  'action/primaryHover': string
  'action/primaryPressed': string
  'action/secondary': string
  'action/secondaryHover': string
  'action/secondaryPressed': string
  'action/positive': string
  'action/positiveHover': string
  'action/positivePressed': string
  'action/negative': string
  'action/negativeHover': string
  'action/negativePressed': string
  'action/disabled': string

  'border/default': string
  'border/subtle': string
  'border/strong': string

  'feedback/focus': string
  'feedback/info': string
  'feedback/infoSubtle': string
  'feedback/negative': string
  'feedback/negativeSubtle': string
  'feedback/positive': string
  'feedback/positiveSubtle': string
  'feedback/warning': string
  'feedback/warningSubtle': string

  'overlay/scrim': string
  'overlay/subtle': string

  'surface/default': string
  'surface/hover': string
  'surface/page': string
  'surface/raised': string
  'surface/selected': string
  'surface/sunken': string

  'text/primary': string
  'text/secondary': string
  'text/tertiary': string
  'text/disabled': string
  'text/link': string
  'text/onAction': string
}

export const lightColors: SemanticColors = {
  'action/primary': p.blue[500], //          Primary CTA fill (buttons, toggles on)
  'action/primaryHover': p.blue[800], //     Primary button hover
  'action/primaryPressed': p.blue[900], //   Primary button pressed / active
  'action/secondary': p.grey[100], //        Secondary button fill (neutral)
  'action/secondaryHover': p.grey[200], //   Secondary button hover
  'action/secondaryPressed': p.grey[300], // Secondary button pressed
  'action/positive': p.green[500], //        Confirm / approve action fill
  'action/positiveHover': p.green[700], //   Positive button hover
  'action/positivePressed': p.green[900], // Positive button pressed
  'action/negative': p.red[500], //          Destructive action fill (delete, reject)
  'action/negativeHover': p.red[600], //     Negative button hover
  'action/negativePressed': p.red[800], //   Negative button pressed
  'action/disabled': p.grey[200], //         Disabled button / control fill

  'border/default': p.grey[200], // Default control border (inputs, cards)
  'border/subtle': p.grey[100], //  Faintest border (table rows, list separators)
  'border/strong': p.grey[300], //  Stronger-than-default border

  'feedback/focus': p.yellow[300], //         Keyboard focus indicator
  'feedback/info': p.blue[500], //            Informational accent (Figma labels this blue/600; it resolves to blue/500)
  'feedback/infoSubtle': p.blue[100], //      Info banner / toast background
  'feedback/negative': p.red[500], //         Error accent (icon, banner border)
  'feedback/negativeSubtle': p.red[50], //    Error background
  'feedback/positive': p.green[500], //       Success accent
  'feedback/positiveSubtle': p.green[100], // Success background
  'feedback/warning': p.orange[500], //       Warning accent
  'feedback/warningSubtle': p.orange[100], // Warning background

  'overlay/scrim': alpha(p.grey[900], 0.54), //  Modal / drawer backdrop
  'overlay/subtle': alpha(p.grey[900], 0.24), // Lighter dim (popovers, hover scrims)

  'surface/default': p.white, //     Default card / component background
  'surface/hover': p.grey[50], //    Hover state for rows, list items
  'surface/page': p.grey[50], //     Page / app background
  'surface/raised': p.white, //      Raised surface (cards, modals)
  'surface/selected': p.blue[50], // Selected row / nav item background
  'surface/sunken': p.grey[100], //  Inset surface (textarea, code block)

  'text/primary': p.grey[900], //   Body text, headings
  'text/secondary': p.grey[600], // Less prominent text (subtitles)
  'text/tertiary': p.grey[500], //  Captions, helper text, placeholders
  'text/disabled': p.grey[400], //  Disabled text
  'text/link': p.blue[500], //      Hyperlink text
  'text/onAction': p.white //       Text on coloured action fills (white on primary)
}

export const darkColors: SemanticColors = {
  'action/primary': p.blue[500],
  'action/primaryHover': p.blue[200],
  'action/primaryPressed': p.blue[100],
  'action/secondary': p.grey[800],
  'action/secondaryHover': p.grey[700],
  'action/secondaryPressed': p.grey[600],
  'action/positive': p.green[500],
  'action/positiveHover': p.green[200],
  'action/positivePressed': p.green[100],
  'action/negative': p.red[500],
  'action/negativeHover': p.red[200],
  'action/negativePressed': p.red[50],
  'action/disabled': p.grey[700],

  'border/default': p.grey[700],
  'border/subtle': p.grey[800],
  'border/strong': p.grey[600],

  'feedback/focus': p.yellow[300],
  'feedback/info': p.blue[500],
  'feedback/infoSubtle': p.blue[900],
  'feedback/negative': p.red[500],
  'feedback/negativeSubtle': p.red[900],
  'feedback/positive': p.green[500],
  'feedback/positiveSubtle': p.green[900],
  'feedback/warning': p.orange[500],
  'feedback/warningSubtle': p.orange[900],

  'overlay/scrim': alpha(p.black, 0.64),
  'overlay/subtle': alpha(p.black, 0.32),

  'surface/default': p.grey[900],
  'surface/hover': p.grey[800],
  'surface/page': p.grey[950],
  'surface/raised': p.grey[800],
  'surface/selected': p.blue[900],
  'surface/sunken': p.black,

  'text/primary': p.grey[100],
  'text/secondary': p.grey[400],
  'text/tertiary': p.grey[500],
  'text/disabled': p.grey[600],
  'text/link': p.blue[200],
  'text/onAction': p.white
}

export type SemanticColor = keyof SemanticColors
