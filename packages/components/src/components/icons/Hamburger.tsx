import * as React from 'react'

export const Hamburger = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={30} height={25} {...props}>
    <title>Menu/Hamburger</title>
    <g fill="#FFF" fillRule="nonzero">
      <path d="M0 11h30v3H0zM0 22h30v3H0zM0 0h30v3H0z" />
    </g>
  </svg>
)
