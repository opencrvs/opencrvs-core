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
 * Semantic tokens — intent-based colour names that reference primitives.
 *
 * Transcribed from the Figma v4 Design System **Variables** panel ("Semantic"
 * collection, Light + Dark modes) — the authoritative source, not the
 * documentation swatch frame (which can lag the variables).
 * https://www.figma.com/design/fi2i59UhtoxW0crnknz6wv/v4---OpenCRVS-Design-System
 *
 * Every token is defined once for light (`lightColors`) and once for dark
 * (`darkColors`); both satisfy `SemanticColors` so the two themes cannot drift.
 * Components reference these tokens exclusively — never primitives or raw hex.
 * The trailing comment on each light token records its Figma primitive alias.
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
  'border/focus': string
  'border/emphasis': string
  'border/action': string

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
  'surface/inset': string

  'text/primary': string
  'text/secondary': string
  'text/tertiary': string
  'text/disabled': string
  'text/link': string
  'text/onAction': string
}

export const lightColors: SemanticColors = {
  'action/primary': p.blue[500], //          blue/500  — Primary CTA fill
  'action/primaryHover': p.blue[800], //     blue/800  — Primary button hover
  'action/primaryPressed': p.blue[900], //   blue/900  — Primary button pressed
  'action/secondary': p.grey[100], //        grey/100  — Secondary button fill
  'action/secondaryHover': p.grey[200], //   grey/200  — Secondary button hover
  'action/secondaryPressed': p.grey[300], // grey/300  — Secondary button pressed
  'action/positive': p.green[500], //        green/500 — Confirm / approve fill
  'action/positiveHover': p.green[800], //   green/800 — Positive button hover
  'action/positivePressed': p.green[900], // green/900 — Positive button pressed
  'action/negative': p.red[500], //          red/500   — Destructive action fill
  'action/negativeHover': p.red[800], //     red/800   — Negative button hover
  'action/negativePressed': p.red[900], //   red/900   — Negative button pressed
  'action/disabled': p.grey[200], //         grey/200  — Disabled control fill

  'border/default': p.grey[300], //  grey/300  — Default control border
  'border/subtle': p.grey[200], //   grey/200  — Faintest border / separator
  'border/strong': p.grey[400], //   grey/400  — Stronger-than-default border
  'border/focus': p.yellow[500], //  yellow/500 (feedback/focus) — Focus ring border
  'border/emphasis': p.grey[900], // grey/900  — High-contrast divider / outline
  'border/action': p.blue[500], //   blue/500  — Border on interactive elements

  'feedback/focus': p.yellow[500], //         yellow/500 — Keyboard focus indicator
  'feedback/info': p.blue[500], //            blue/500   — Informational accent
  'feedback/infoSubtle': p.blue[50], //       blue/50    — Info background
  'feedback/negative': p.red[500], //         red/500    — Error accent
  'feedback/negativeSubtle': p.red[50], //    red/50     — Error background
  'feedback/positive': p.green[500], //       green/500  — Success accent
  'feedback/positiveSubtle': p.green[50], //  green/50   — Success background
  'feedback/warning': p.orange[500], //       orange/500 — Warning accent
  'feedback/warningSubtle': p.orange[50], //  orange/50  — Warning background

  'overlay/scrim': alpha(p.grey[900], 0.54), //  grey/900 @ 54% — Modal / drawer backdrop
  'overlay/subtle': alpha(p.grey[900], 0.24), // grey/900 @ 24% — Lighter dim

  'surface/default': p.white, //     white    — Default component background
  'surface/hover': p.grey[50], //    grey/50  — Hover state for rows / list items
  'surface/page': p.grey[50], //     grey/50  — Page / app background
  'surface/raised': p.white, //      white    — Raised surface (cards, modals)
  'surface/selected': p.blue[50], // blue/50  — Selected row / nav item background
  'surface/inset': p.grey[100], //   grey/100 — Inset surface (textarea, code block)

  'text/primary': p.grey[900], //   grey/900 — Body text, headings
  'text/secondary': p.grey[600], // grey/600 — Less prominent text (subtitles)
  'text/tertiary': p.grey[500], //  grey/500 — Captions, helper text, placeholders
  'text/disabled': p.grey[400], //  grey/400 — Disabled text
  'text/link': p.blue[500], //      blue/500 — Hyperlink text
  'text/onAction': p.white //       white    — Text on coloured action fills
}

export const darkColors: SemanticColors = {
  'action/primary': p.blue[500],
  'action/primaryHover': p.blue[100],
  'action/primaryPressed': p.blue[50],
  'action/secondary': p.grey[800],
  'action/secondaryHover': p.grey[700],
  'action/secondaryPressed': p.grey[600],
  'action/positive': p.green[500],
  'action/positiveHover': p.green[100],
  'action/positivePressed': p.green[50],
  'action/negative': p.red[500],
  'action/negativeHover': p.red[100],
  'action/negativePressed': p.red[50],
  'action/disabled': p.grey[700],

  'border/default': p.grey[700],
  'border/subtle': p.grey[800],
  'border/strong': p.grey[600],
  'border/focus': p.yellow[500],
  'border/emphasis': p.grey[100],
  'border/action': p.blue[100],

  'feedback/focus': p.yellow[500],
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
  'surface/inset': p.black,

  'text/primary': p.grey[100],
  'text/secondary': p.grey[400],
  'text/tertiary': p.grey[500],
  'text/disabled': p.grey[600],
  'text/link': p.blue[100],
  'text/onAction': p.white
}

export type SemanticColor = keyof SemanticColors
