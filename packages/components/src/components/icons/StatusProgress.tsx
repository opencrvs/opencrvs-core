import * as React from 'react'

export const StatusProgress = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={18} height={18} fill="none" {...props}>
    <g opacity={0.5} fill="#8049B7">
      <path d="M9 18A9 9 0 1 0 9 0a9 9 0 0 0 0 18z" fillOpacity={0.5} />
      <path d="M9 13.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z" />
    </g>
  </svg>
)
