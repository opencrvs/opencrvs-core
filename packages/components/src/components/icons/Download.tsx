import * as React from 'react'

export const Download = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={20} height={22} fill="none" {...props}>
    <path
      d="M1 16v3a2 2 0 002 2h14a2 2 0 002-2v-3M6 11l4 4 4-4M10 1v14"
      stroke="#4C68C1"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
