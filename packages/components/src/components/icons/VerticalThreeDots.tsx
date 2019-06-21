import * as React from 'react'

export const VerticalThreeDots = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={40} height={40} fill="none" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21 14a1 1 0 1 0-2 0 1 1 0 0 0 2 0zM21 20a1 1 0 1 0-2 0 1 1 0 0 0 2 0zM21 26a1 1 0 1 0-2 0 1 1 0 0 0 2 0z"
      stroke="#4C68C1"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
