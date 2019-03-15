import * as React from 'react'

export const Tick = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={10} height={8} {...props}>
    <title>Line 2</title>
    <path
      d="M1 3.437L4.288 7 9 1"
      stroke="#FFF"
      strokeWidth={2}
      fill="none"
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
