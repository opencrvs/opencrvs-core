import * as React from 'react'

export const KeyboardArrowUp = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <path
      d="M18 15l-6-5.96L6 15"
      stroke={props.color || '#4C68C1'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
