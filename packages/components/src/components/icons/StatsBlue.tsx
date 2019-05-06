import * as React from 'react'

export const StatsBlue = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <path
      d="M23 6l-9.5 9.5-5-5L1 18"
      stroke="#5E93ED"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 6h6v6"
      stroke="#5E93ED"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
