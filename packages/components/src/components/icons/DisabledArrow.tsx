import * as React from 'react'

export const DisabledArrow = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={38} height={20} {...props}>
    <title>Disabled arrow</title>
    <g
      fillRule="nonzero"
      stroke="#F4F4F4"
      strokeWidth={4}
      fill="none"
      strokeLinecap="round"
    >
      <path d="M2 10h30" />
      <path strokeLinejoin="round" d="M28 2.929L35.071 10 28 17.071" />
    </g>
  </svg>
)
