import * as React from 'react'

export const DisabledArrow = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 42.7 25.9" width={42.7} height={25.9} {...props}>
    <title>Disabled arrow</title>
    <g id="Arrow-Gradient" stroke="#F4F4F4" strokeWidth={4} fill="none">
      <path fill="none" strokeLinecap="round" d="M4.6,14h30" />
      <polyline
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="30.6,6.9 37.7,14 30.6,21 	"
      />
    </g>
  </svg>
)
