import * as React from 'react'

export const BRN = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z"
      stroke="url(#prefix__paint0_linear)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient
        id="prefix__paint0_linear"
        x1={12}
        y1={3}
        x2={12}
        y2={21}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6291CD" />
        <stop offset={1} stopColor="#AACAF3" />
      </linearGradient>
    </defs>
  </svg>
)
