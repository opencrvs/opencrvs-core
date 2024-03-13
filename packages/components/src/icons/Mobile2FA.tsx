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

export const Mobile2FA = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={136} height={136} fill="none" {...props}>
    <path
      d="M83.724 121.853a3.195 3.195 0 0 0 3.197-3.19V16.571c0-1.76-1.433-3.19-3.197-3.19H32.588a3.196 3.196 0 0 0-3.196 3.19v102.092c0 1.76 1.433 3.19 3.196 3.19h51.136zm0 6.381H32.588c-5.294 0-9.588-4.287-9.588-9.571V16.571C23 11.287 27.294 7 32.588 7h51.136c5.294 0 9.588 4.287 9.588 9.571v102.092c0 5.284-4.294 9.571-9.588 9.571zm-31.96-12.762a3.193 3.193 0 0 1-3.196-3.19c0-1.762 1.431-3.19 3.196-3.19h12.784a3.193 3.193 0 0 1 3.196 3.19c0 1.762-1.43 3.19-3.196 3.19H51.764z"
      fill="url(#prefix__paint0_linear)"
    />
    <g filter="url(#prefix__filter0_d)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M49.313 19.656a1 1 0 0 0-1 1v48.826a1 1 0 0 0 1 1h10.262v8.953l16.786-8.953H112a1 1 0 0 0 1-1V20.656a1 1 0 0 0-1-1H49.312z"
        fill="url(#prefix__paint1_linear)"
      />
    </g>
    <path
      fill="#fff"
      d="M53.16 41.469h7.271v7.271H53.16zM62.854 41.469h7.271v7.271h-7.271zM72.548 41.469h7.271v7.271h-7.271zM82.243 41.469h7.271v7.271h-7.271zM91.937 41.469h7.271v7.271h-7.271zM101.632 41.469h7.271v7.271h-7.271z"
    />
    <defs>
      <filter
        id="prefix__filter0_d"
        x={42.313}
        y={15.656}
        width={76.688}
        height={71.779}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy={2} />
        <feGaussianBlur stdDeviation={3} />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
      </filter>
      <linearGradient
        id="prefix__paint0_linear"
        x1={58.156}
        y1={7}
        x2={58.156}
        y2={128.234}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6291CD" />
        <stop offset={1} stopColor="#AACAF3" />
      </linearGradient>
      <linearGradient
        id="prefix__paint1_linear"
        x1={80.656}
        y1={19.656}
        x2={80.656}
        y2={79.435}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6291CD" />
        <stop offset={1} stopColor="#AACAF3" />
      </linearGradient>
    </defs>
  </svg>
)
